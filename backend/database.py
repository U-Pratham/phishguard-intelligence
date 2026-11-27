import json
import os
import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Optional

from backend.models import AnalysisResult, EvidenceItem, StatsResponse

DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "phishguard.db"


def get_db_path() -> str:
    return os.getenv("DATABASE_URL", str(DEFAULT_DB_PATH))


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with closing(get_connection()) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scan_type TEXT NOT NULL,
                submitted_input TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                verdict TEXT NOT NULL,
                detection_source TEXT NOT NULL,
                evidence_json TEXT NOT NULL,
                explanation TEXT NOT NULL,
                recommended_actions_json TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                report_json TEXT
            )
            """
        )
        try:
            conn.execute("ALTER TABLE scans ADD COLUMN report_json TEXT")
        except sqlite3.OperationalError:
            pass
        conn.commit()


def save_scan(result: AnalysisResult) -> int:
    report_payload = result.model_dump()
    with closing(get_connection()) as conn:
        cursor = conn.execute(
            """
            INSERT INTO scans (
                scan_type,
                submitted_input,
                risk_score,
                verdict,
                detection_source,
                evidence_json,
                explanation,
                recommended_actions_json,
                timestamp,
                report_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                result.scan_type,
                result.submitted_input,
                result.risk_score,
                result.verdict,
                result.detection_source,
                json.dumps([item.model_dump() for item in result.evidence]),
                result.explanation,
                json.dumps(result.recommended_actions),
                result.timestamp,
                json.dumps(report_payload),
            ),
        )
        conn.commit()
        return int(cursor.lastrowid)


def get_history(limit: int = 50, scan_type: Optional[str] = None) -> list[AnalysisResult]:
    query = "SELECT * FROM scans"
    params: list = []
    if scan_type in ("url", "message"):
        query += " WHERE scan_type = ?"
        params.append(scan_type)
    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    with closing(get_connection()) as conn:
        rows = conn.execute(query, params).fetchall()

    results: list[AnalysisResult] = []
    for row in rows:
        report_json = row["report_json"] if "report_json" in row.keys() else None
        if report_json:
            data = json.loads(report_json)
            data["id"] = row["id"]
            results.append(AnalysisResult(**data))
            continue

        evidence_raw = json.loads(row["evidence_json"])
        actions_raw = json.loads(row["recommended_actions_json"])
        results.append(
            AnalysisResult(
                id=row["id"],
                scan_type=row["scan_type"],
                submitted_input=row["submitted_input"],
                risk_score=row["risk_score"],
                verdict=row["verdict"],
                detection_source=row["detection_source"],
                evidence=[EvidenceItem(**item) for item in evidence_raw],
                explanation=row["explanation"],
                recommended_actions=actions_raw,
                timestamp=row["timestamp"],
            )
        )
    return results


def get_stats() -> StatsResponse:
    with closing(get_connection()) as conn:
        row = conn.execute(
            """
            SELECT
                COUNT(*) AS total_scans,
                SUM(CASE WHEN scan_type = 'url' THEN 1 ELSE 0 END) AS url_scans,
                SUM(CASE WHEN scan_type = 'message' THEN 1 ELSE 0 END) AS message_scans,
                SUM(CASE WHEN verdict = 'HIGH RISK' THEN 1 ELSE 0 END) AS high_risk_count,
                SUM(CASE WHEN verdict = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_count,
                SUM(CASE WHEN verdict = 'LOW RISK' THEN 1 ELSE 0 END) AS low_risk_count,
                COALESCE(AVG(risk_score), 0.0) AS average_risk_score
            FROM scans
            """
        ).fetchone()

    return StatsResponse(
        total_scans=row["total_scans"] or 0,
        url_scans=row["url_scans"] or 0,
        message_scans=row["message_scans"] or 0,
        high_risk_count=row["high_risk_count"] or 0,
        suspicious_count=row["suspicious_count"] or 0,
        low_risk_count=row["low_risk_count"] or 0,
        average_risk_score=round(float(row["average_risk_score"] or 0.0), 1),
    )
