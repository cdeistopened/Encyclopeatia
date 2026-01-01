"""
Inference layer for Ray Peat Radio RAG system.
Uses Gemini Flash for fast, grounded responses.
Supports GraphRAG: entity-based filtering to enhance vector search.
"""

import logging
import os
import sqlite3
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Set

from dotenv import load_dotenv

# Load .env from the rag directory
load_dotenv(Path(__file__).parent / ".env")

from config import DATA_DIR, GEMINI_MODEL
from vector_store import RayPeatVectorStore, SearchResult

# Query logging database
QUERY_LOG_DB = DATA_DIR / "query_log.db"


def init_query_log_db():
    """Initialize the query logging database."""
    conn = sqlite3.connect(QUERY_LOG_DB)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT,
            num_sources INTEGER,
            entities_found TEXT,
            graph_enhanced INTEGER,
            model_used TEXT,
            response_time_ms INTEGER
        )
    """)
    conn.commit()
    conn.close()


def log_query(
    question: str,
    answer: str,
    num_sources: int,
    entities: List[str],
    graph_enhanced: bool,
    model: str,
    response_time_ms: int,
):
    """Log a query to the database for analytics."""
    try:
        init_query_log_db()
        conn = sqlite3.connect(QUERY_LOG_DB)
        conn.execute(
            """
            INSERT INTO queries (timestamp, question, answer, num_sources, entities_found,
                                graph_enhanced, model_used, response_time_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                datetime.utcnow().isoformat(),
                question,
                answer[:2000] if answer else None,  # Truncate long answers
                num_sources,
                ",".join(entities) if entities else None,
                1 if graph_enhanced else 0,
                model,
                response_time_ms,
            ),
        )
        conn.commit()
        conn.close()
        logger.debug(f"Logged query: {question[:50]}...")
    except Exception as e:
        logger.warning(f"Failed to log query: {e}")


# Try to import knowledge graph (optional - degrades gracefully)
try:
    from knowledge_graph import KnowledgeGraph

    GRAPH_AVAILABLE = True
except ImportError:
    GRAPH_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_AVAILABLE = False
genai = None


@dataclass
class RAGResponse:
    """Response from the RAG system."""

    answer: str
    sources: List[SearchResult]
    query: str
    entities_found: List[str] = field(
        default_factory=list
    )  # Entities detected in query
    graph_enhanced: bool = False  # Whether GraphRAG was used


class RayPeatRAG:
    """
    RAG system for answering questions about Ray Peat's work.

    Uses:
    - Vector search to find relevant transcript sections
    - Knowledge graph for entity-based filtering (GraphRAG)
    - Gemini Flash for fast inference
    """

    def __init__(self, gemini_api_key: Optional[str] = None, use_graph: bool = True):
        """Initialize the RAG system."""
        self.store = RayPeatVectorStore()
        self._gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.model = None

        # Initialize knowledge graph if available
        self.graph = None
        if use_graph and GRAPH_AVAILABLE:
            try:
                self.graph = KnowledgeGraph()
                stats = self.graph.get_stats()
                if stats.get("total_entities", 0) > 0:
                    logger.info(f"GraphRAG enabled: {stats['total_entities']} entities")
                else:
                    logger.info("Knowledge graph empty - GraphRAG disabled")
                    self.graph = None
            except Exception as e:
                logger.warning(f"Could not load knowledge graph: {e}")
                self.graph = None

        # Configure Gemini lazily (only when `ask` needs it) so search-only workflows
        # don't depend on the google stack being importable.
        self.llm_available = False
        self._model_name = None

    def _ensure_llm(self) -> bool:
        """Initialize the LLM if possible; returns whether it's available."""
        if self.llm_available and self.model is not None:
            return True
        if not self._gemini_api_key:
            return False

        try:
            import google.generativeai as _genai  # type: ignore

            global genai, GEMINI_AVAILABLE
            genai = _genai
            GEMINI_AVAILABLE = True

            genai.configure(api_key=self._gemini_api_key)
            model_name = os.getenv("GEMINI_MODEL", GEMINI_MODEL)
            logger.info(f"Initializing Gemini model: {model_name}")
            self.model = genai.GenerativeModel(model_name)
            self._model_name = model_name
            self.llm_available = True
            return True
        except Exception as e:
            logger.warning("Gemini unavailable (%s). LLM responses disabled.", e)
            self.llm_available = False
            self.model = None
            return False

    def _extract_entities_from_query(self, query: str) -> List[str]:
        """
        Extract entity names from query by matching against known entities.
        Uses simple keyword matching against the knowledge graph.
        """
        if not self.graph:
            return []

        entities = []
        query_lower = query.lower()

        # Search for matching entities in the graph
        # Try to find entities that appear in the query
        words = query_lower.split()

        # Check single words and common bigrams
        for i, word in enumerate(words):
            if len(word) < 3:
                continue

            # Search for entities matching this word
            matches = self.graph.search_entities(word, limit=5)
            for entity in matches:
                # Check if entity name appears in query
                if entity.normalized_name in query_lower:
                    entities.append(entity.name)

            # Check bigrams
            if i < len(words) - 1:
                bigram = f"{word} {words[i + 1]}"
                matches = self.graph.search_entities(bigram, limit=3)
                for entity in matches:
                    if entity.normalized_name in query_lower:
                        entities.append(entity.name)

        # Deduplicate while preserving order
        seen = set()
        unique_entities = []
        for e in entities:
            if e.lower() not in seen:
                seen.add(e.lower())
                unique_entities.append(e)

        return unique_entities[:10]  # Limit to top 10 entities

    def _get_graph_boosted_episodes(self, entities: List[str]) -> Set[str]:
        """Get episode IDs that contain the given entities."""
        if not self.graph or not entities:
            return set()

        return set(self.graph.get_episodes_for_entities(entities))

    def search(
        self,
        query: str,
        limit: int = 5,
        show: Optional[str] = None,
        doc_type: Optional[str] = None,
        use_graph: bool = True,
    ) -> List[SearchResult]:
        """
        Search for relevant transcript sections.

        If GraphRAG is enabled, boosts results from episodes
        that contain entities mentioned in the query.
        """
        # First, get vector search results (get more for re-ranking)
        search_limit = limit * 2 if self.graph and use_graph else limit
        results = self.store.search(
            query=query, limit=search_limit, show=show, doc_type=doc_type
        )

        if not results:
            return []

        # If graph available, re-rank based on entity matches
        if self.graph and use_graph:
            entities = self._extract_entities_from_query(query)
            if entities:
                boosted_episodes = self._get_graph_boosted_episodes(entities)
                if boosted_episodes:
                    # Re-score: boost results from entity-matched episodes
                    for result in results:
                        if result.episode_id in boosted_episodes:
                            # Boost score by 10%
                            result.score = min(1.0, result.score * 1.1)

                    # Re-sort by score
                    results.sort(key=lambda r: r.score, reverse=True)

        return results[:limit]

    def ask(
        self,
        question: str,
        limit: int = 30,  # Increased: err on side of more context
        show: Optional[str] = None,
        doc_type: Optional[str] = None,
        include_sources: bool = True,
        use_graph: bool = True,
    ) -> RAGResponse:
        """
        Ask a question and get an AI-synthesized answer.

        Args:
            question: The question to ask
            limit: Number of sources to retrieve
            show: Filter by show slug
            include_sources: Whether to include source excerpts
            use_graph: Whether to use GraphRAG for enhanced retrieval

        Returns:
            RAGResponse with answer and sources
        """
        import time

        start_time = time.time()

        # Extract entities from question for GraphRAG
        entities_found = []
        graph_enhanced = False

        if self.graph and use_graph:
            entities_found = self._extract_entities_from_query(question)
            if entities_found:
                logger.info(f"GraphRAG: Found entities in query: {entities_found}")
                graph_enhanced = True

        # Retrieve relevant sections (with graph boosting if available)
        sources = self.search(
            query=question,
            limit=limit,
            show=show,
            doc_type=doc_type,
            use_graph=use_graph,
        )

        if not sources:
            return RAGResponse(
                answer="I couldn't find any relevant information in the indexed sources for that question.",
                sources=[],
                query=question,
                entities_found=entities_found,
                graph_enhanced=graph_enhanced,
            )

        # If no LLM, return sources only
        if not self._ensure_llm():
            source_text = "\n\n".join(
                [
                    f"**{s.episode_title}** - {s.section_header}:\n{s.text[:500]}..."
                    for s in sources[:3]
                ]
            )
            return RAGResponse(
                answer=f"Found {len(sources)} relevant sections:\n\n{source_text}",
                sources=sources,
                query=question,
                entities_found=entities_found,
                graph_enhanced=graph_enhanced,
            )

        # Build context from sources - Gemini 2.0 Flash has 1M token context
        # Err on the side of including MORE context for better grounded answers
        context_parts = []
        total_chars = 0
        max_context_chars = (
            400000  # ~100k tokens - use Gemini's large context generously
        )

        for i, source in enumerate(sources, 1):
            text = source.text
            # Only truncate extremely long sections (>5000 chars)
            if len(text) > 5000:
                text = text[:5000] + "..."

            # Stop adding if we'd exceed context limit
            if total_chars + len(text) > max_context_chars:
                break

            context_parts.append(
                f'[Source {i}] {source.episode_title} - "{source.section_header}"\n'
                f"{text}"
            )
            total_chars += len(text)

        context = "\n\n---\n\n".join(context_parts)

        # Build prompt - direct, factual synthesis
        prompt = f"""Synthesize Ray Peat's views on the question below using ONLY the transcript excerpts provided.

STYLE:
- Direct and factual, no flowery language or performance
- State what Ray believes and why (the mechanism)
- Cite specific researchers or studies he references when relevant
- Keep it concise - 2-3 paragraphs max unless the topic requires more
- If something isn't covered in the excerpts, say so

TRANSCRIPT EXCERPTS:
{context}

QUESTION: {question}

ANSWER:"""

        # Generate response
        try:
            response = self.model.generate_content(prompt)
            answer = response.text
        except Exception as e:
            answer = f"Error generating response: {e}\n\nRelevant sources were found - see below."

        # Log the query for analytics
        elapsed_ms = int((time.time() - start_time) * 1000)
        log_query(
            question=question,
            answer=answer,
            num_sources=len(sources),
            entities=entities_found,
            graph_enhanced=graph_enhanced,
            model=self._model_name or "unknown",
            response_time_ms=elapsed_ms,
        )

        return RAGResponse(
            answer=answer,
            sources=sources,
            query=question,
            entities_found=entities_found,
            graph_enhanced=graph_enhanced,
        )

    def get_stats(self):
        """Get system statistics."""
        stats = self.store.get_stats()
        stats["llm_available"] = self.llm_available
        stats["llm_model"] = self._model_name if self.llm_available else None
        stats["graph_available"] = self.graph is not None

        if self.graph:
            graph_stats = self.graph.get_stats()
            stats["graph_entities"] = graph_stats.get("total_entities", 0)
            stats["graph_mentions"] = graph_stats.get("total_mentions", 0)

        return stats


def format_response(response: RAGResponse, show_sources: bool = True) -> str:
    """Format a RAG response for display."""
    output = [response.answer]

    # Show GraphRAG info if entities were found
    if response.entities_found:
        output.append(
            f"\n\n🔗 **Entities detected:** {', '.join(response.entities_found)}"
        )

    if show_sources and response.sources:
        output.append("\n\n---\n**Sources:**")
        for i, source in enumerate(response.sources, 1):
            episode_link = f"{source.episode_id}#{source.section_anchor}"
            output.append(
                f'\n[{i}] **{source.episode_title}** - "{source.section_header}"'
                f"\n    Show: {source.show} | Score: {source.score:.2f}"
            )
            if source.audio_url:
                output.append(f"    Audio: {source.audio_url}")

    return "\n".join(output)


if __name__ == "__main__":
    import sys

    rag = RayPeatRAG()

    print("Ray Peat Radio RAG System")
    print("=" * 50)
    print("\nStats:", rag.get_stats())

    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        question = "What does Ray Peat say about thyroid and metabolism?"

    print(f"\nQuestion: {question}")
    print("-" * 50)

    response = rag.ask(question)
    print(format_response(response))
