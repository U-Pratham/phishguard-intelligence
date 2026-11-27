import asyncio
import os
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.analyzers import analyze_message, analyze_url, extract_urls_from_message
from backend.database import get_history, get_stats, init_db, save_scan
from backend.fusion import fuse_evidence
from backend.ml.predictor import is_model_available, load_model_metadata, predict_url_ml
from backend.models import AnalysisResult, MessageScanRequest, StatsResponse, URLScanRequest
from backend.providers import ThreatIntelProvider, URLhausProvider

load_dotenv()


def get_active_providers() -> list[ThreatIntelProvider]:
    return [URLhausProvider()]


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="PhishGuard Intelligence API",
    description="Explainable cybersecurity threat investigation platform (Heuristics + ML + Threat Intelligence)",
    version="0.5.0",
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
    urlhaus_configured = bool((os.getenv("URLHAUS_AUTH_KEY") or os.getenv("URLHAUS_API_KEY") or "").strip())
    ml_loaded = is_model_available()
    return {
        "status": "ok",
        "service": "PhishGuard Intelligence",
        "engine": "Local Heuristics + ML Classifier + Evidence Fusion",
        "providers": {
            "urlhaus": "configured" if urlhaus_configured else "missing_key",
            "ml_classifier": "loaded" if ml_loaded else "unavailable",
        },
        "version": "0.5.0",
    }


@app.get("/api/ml/metrics")
def ml_metrics_endpoint():
    metadata = load_model_metadata()
    if not metadata:
        return {"available": False, "detail": "Model metadata not found. Run training script first."}
    return {"available": True, **metadata}


@app.post("/api/analyze/url", response_model=AnalysisResult)
async def analyze_url_endpoint(payload: URLScanRequest):
    local_result = analyze_url(payload.url)
    ml_result, ml_evidence = predict_url_ml(payload.url)
    providers = get_active_providers()
    provider_outputs = await asyncio.gather(*(p.check_url(payload.url) for p in providers))
    fused = fuse_evidence(
        local_result,
        list(provider_outputs),
        ml_result=ml_result,
        ml_evidence=ml_evidence,
    )
    scan_id = save_scan(fused)
    fused.id = scan_id
    return fused


@app.post("/api/analyze/message", response_model=AnalysisResult)
async def analyze_message_endpoint(payload: MessageScanRequest):
    local_result = analyze_message(payload.message)
    urls = extract_urls_from_message(payload.message)[:2]
    provider_outputs = []
    if urls:
        providers = get_active_providers()
        tasks = [p.check_url(u) for u in urls for p in providers]
        provider_outputs = list(await asyncio.gather(*tasks))
    fused = fuse_evidence(local_result, provider_outputs)
    scan_id = save_scan(fused)
    fused.id = scan_id
    return fused


@app.get("/api/history", response_model=list[AnalysisResult])
def history_endpoint(
    limit: int = Query(default=50, ge=1, le=200),
    scan_type: Optional[str] = Query(default=None),
):
    return get_history(limit=limit, scan_type=scan_type)


@app.get("/api/stats", response_model=StatsResponse)
def stats_endpoint():
    return get_stats()
