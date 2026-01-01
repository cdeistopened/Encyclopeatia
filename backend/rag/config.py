"""
Configuration for the Ray Peat RAG system
"""
import os
from pathlib import Path

# Directory paths
RAG_DIR = Path(__file__).parent
DATA_DIR = RAG_DIR / "data"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

# Model configuration
GEMINI_MODEL = "gemini-2.0-flash-exp"

# Vector store configuration
VECTOR_DB_PATH = DATA_DIR / "vector_store.db"
EMBEDDINGS_MODEL = "all-MiniLM-L6-v2"

# Knowledge graph configuration
KNOWLEDGE_GRAPH_PATH = DATA_DIR / "knowledge_graph.json"

# API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8080))