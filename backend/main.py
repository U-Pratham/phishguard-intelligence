from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.analyzers import analyze_message, analyze_url
from backend.database import get_history, get_stats, init_db, save_scan
from backend.models import AnalysisResult, MessageScanRequest, StatsResponse, URLScanRequest

load_dotenv()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="PhishGuard Intelligence API",
    description="Explainable cybersecurity threat investigation platform (Local Heuristic Engine)",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "PhishGuard Intelligence",
        "engine": "Local Heuristic Engine",
        "version": "0.1.0",
    }


@app.post("/api/analyze/url", response_model=AnalysisResult)
def analyze_url_endpoint(payload: URLScanRequest):
    result = analyze_url(payload.url)
    scan_id = save_scan(result)
    result.id = scan_id
    return result


@app.post("/api/analyze/message", response_model=AnalysisResult)
def analyze_message_endpoint(payload: MessageScanRequest):
    result = analyze_message(payload.message)
    scan_id = save_scan(result)
    result.id = scan_id
    return result


@app.get("/api/history", response_model=list[AnalysisResult])
def history_endpoint(
    limit: int = Query(default=50, ge=1, le=200),
    scan_type: Optional[str] = Query(default=None),
):
    return get_history(limit=limit, scan_type=scan_type)


@app.get("/api/stats", response_model=StatsResponse)
def stats_endpoint():
    return get_stats()
