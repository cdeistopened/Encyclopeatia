"""
Vector store for Ray Peat transcript search
"""
import sqlite3
from dataclasses import dataclass
from typing import List, Optional
from pathlib import Path

from config import VECTOR_DB_PATH


@dataclass
class SearchResult:
    """Search result from vector store"""
    episode_id: str
    episode_title: str
    show: str
    section_header: str
    section_anchor: str
    text: str
    score: float
    audio_url: Optional[str] = None
    doc_type: Optional[str] = None


class RayPeatVectorStore:
    """
    Vector store for Ray Peat transcript sections
    """
    
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or VECTOR_DB_PATH
        self._ensure_db()
    
    def _ensure_db(self):
        """Ensure the database exists with required tables"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS transcript_sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                episode_id TEXT NOT NULL,
                episode_title TEXT NOT NULL,
                show TEXT NOT NULL,
                section_header TEXT NOT NULL,
                section_anchor TEXT NOT NULL,
                text TEXT NOT NULL,
                audio_url TEXT,
                doc_type TEXT,
                embedding BLOB
            )
        """)
        conn.commit()
        conn.close()
    
    def search(
        self,
        query: str,
        limit: int = 5,
        show: Optional[str] = None,
        doc_type: Optional[str] = None
    ) -> List[SearchResult]:
        """
        Search for relevant transcript sections
        For now, this is just text search until embeddings are implemented
        """
        conn = sqlite3.connect(self.db_path)
        
        # Build query
        sql = """
            SELECT episode_id, episode_title, show, section_header, 
                   section_anchor, text, audio_url, doc_type
            FROM transcript_sections
            WHERE text LIKE ?
        """
        params = [f"%{query}%"]
        
        if show:
            sql += " AND show = ?"
            params.append(show)
        
        if doc_type:
            sql += " AND doc_type = ?"
            params.append(doc_type)
        
        sql += " ORDER BY LENGTH(text) DESC LIMIT ?"
        params.append(limit)
        
        cursor = conn.execute(sql, params)
        results = []
        
        for row in cursor.fetchall():
            results.append(SearchResult(
                episode_id=row[0],
                episode_title=row[1],
                show=row[2],
                section_header=row[3],
                section_anchor=row[4],
                text=row[5],
                audio_url=row[6],
                doc_type=row[7],
                score=0.5  # Placeholder score
            ))
        
        conn.close()
        return results
    
    def get_stats(self) -> dict:
        """Get statistics about the vector store"""
        conn = sqlite3.connect(self.db_path)
        
        # Count total sections
        cursor = conn.execute("SELECT COUNT(*) FROM transcript_sections")
        total_sections = cursor.fetchone()[0]
        
        # Count by show
        cursor = conn.execute("""
            SELECT show, COUNT(*) 
            FROM transcript_sections 
            GROUP BY show
        """)
        shows = dict(cursor.fetchall())
        
        conn.close()
        
        return {
            "total_sections": total_sections,
            "shows": shows,
            "vector_store_path": str(self.db_path)
        }