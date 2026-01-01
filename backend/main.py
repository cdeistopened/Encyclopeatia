"""
FastAPI server for Ray Peat Encyclopedia
"""
import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add the rag directory to the path
import sys
rag_path = Path(__file__).parent / "rag"
sys.path.append(str(rag_path))

try:
    from inference import RayPeatRAG, RAGResponse
    RAG_AVAILABLE = True
except ImportError as e:
    print(f"RAG import failed: {e}")
    RAG_AVAILABLE = False

app = FastAPI(
    title="Ray Peat Encyclopedia",
    description="RAG-powered encyclopedia of Ray Peat's work",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG system
rag = None
if RAG_AVAILABLE:
    try:
        rag = RayPeatRAG()
        print("RAG system initialized successfully")
    except Exception as e:
        print(f"Failed to initialize RAG system: {e}")


class AskRequest(BaseModel):
    question: str
    limit: Optional[int] = 30
    show: Optional[str] = None
    doc_type: Optional[str] = None
    use_graph: Optional[bool] = True


class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5
    show: Optional[str] = None
    doc_type: Optional[str] = None
    use_graph: Optional[bool] = True


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Ray Peat Encyclopedia API",
        "version": "1.0.0",
        "rag_available": RAG_AVAILABLE,
        "rag_initialized": rag is not None
    }


@app.get("/health")
async def health():
    """Detailed health check"""
    health_data = {
        "status": "ok",
        "rag_available": RAG_AVAILABLE,
        "rag_initialized": rag is not None
    }
    
    if rag:
        try:
            stats = rag.get_stats()
            health_data.update(stats)
        except Exception as e:
            health_data["rag_error"] = str(e)
    
    return health_data


@app.post("/ask")
async def ask_question(request: AskRequest):
    """Ask a question and get an AI-synthesized answer"""
    if not rag:
        raise HTTPException(
            status_code=503, 
            detail="RAG system not available"
        )
    
    try:
        response = rag.ask(
            question=request.question,
            limit=request.limit,
            show=request.show,
            doc_type=request.doc_type,
            use_graph=request.use_graph
        )
        
        # Convert to dict for JSON serialization
        return {
            "answer": response.answer,
            "query": response.query,
            "entities_found": response.entities_found,
            "graph_enhanced": response.graph_enhanced,
            "sources": [
                {
                    "episode_id": s.episode_id,
                    "episode_title": s.episode_title,
                    "show": s.show,
                    "section_header": s.section_header,
                    "section_anchor": s.section_anchor,
                    "text": s.text,
                    "score": s.score,
                    "audio_url": s.audio_url,
                    "doc_type": s.doc_type
                }
                for s in response.sources
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
async def search(request: SearchRequest):
    """Search for relevant transcript sections"""
    if not rag:
        raise HTTPException(
            status_code=503,
            detail="RAG system not available" 
        )
    
    try:
        results = rag.search(
            query=request.query,
            limit=request.limit,
            show=request.show,
            doc_type=request.doc_type,
            use_graph=request.use_graph
        )
        
        return [
            {
                "episode_id": s.episode_id,
                "episode_title": s.episode_title,
                "show": s.show,
                "section_header": s.section_header,
                "section_anchor": s.section_anchor,
                "text": s.text,
                "score": s.score,
                "audio_url": s.audio_url,
                "doc_type": s.doc_type
            }
            for s in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
async def get_stats():
    """Get system statistics"""
    if not rag:
        return {"error": "RAG system not available"}
    
    try:
        return rag.get_stats()
    except Exception as e:
        return {"error": str(e)}


# Serve static frontend files if they exist
frontend_path = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")
    
    @app.get("/app")
    async def serve_app():
        """Serve the frontend application"""
        return FileResponse(str(frontend_path / "index.html"))


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8080))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)