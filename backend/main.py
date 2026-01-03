"""
FastAPI backend for Ray Peat Encyclopedia
Provides HTTP endpoints for the frontend to interact with
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="Ray Peat Encyclopedia",
    description="RAG-powered encyclopedia of Ray Peat's work",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Ray Peat Encyclopedia API",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "api_docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Import and include routers from other modules as needed
# from .rag import router as rag_router
# app.include_router(rag_router, prefix="/api")