import csv
import io
import random
import uuid
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models.session import SessionStartRequest
from models.result import CTBResult
from trial_generator import DELAYS, generate_ctb_trials, generate_digit_strings

app = FastAPI(title="Exp1timeApp API — Cognitive Load × CTB Time Discounting")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://exp1timeapp-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions: dict[str, dict[str, Any]] = {}
results: list[dict[str, Any]] = []

CONDITIONS = ["HIGH", "LOW"]


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/session/start")
def start_session(req: SessionStartRequest):
    if not req.participant_id.strip() or not req.name.strip():
        raise HTTPException(status_code=400, detail="participant_id と name は必須です")
    if req.delay_condition not in DELAYS:
        raise HTTPException(status_code=400, detail=f"delay_condition は {list(DELAYS.keys())} のいずれかです")

    session_id = str(uuid.uuid4())
    condition = random.choice(CONDITIONS)
    trials = generate_ctb_trials(req.delay_condition)

    n_blocks = max(t["block"] for t in trials)
    digit_strings = generate_digit_strings(n_blocks) if condition == "HIGH" else [""] * n_blocks

    sessions[session_id] = {
        "participant_id": req.participant_id.strip(),
        "name": req.name.strip(),
        "condition": condition,
        "delay_condition": req.delay_condition,
        "delay_label": DELAYS[req.delay_condition],
        "digit_strings": digit_strings,
        "trials": trials,
        "created_at": datetime.now().isoformat(),
    }

    return {
        "session_id": session_id,
        "condition": condition,
        "delay_label": DELAYS[req.delay_condition],
        "digit_strings": digit_strings,
        "trials": trials,
    }


@app.post("/api/results")
def save_result(result: CTBResult):
    if result.session_id not in sessions:
        raise HTTPException(status_code=404, detail="セッションが見つかりません")

    session = sessions[result.session_id]
    record = result.model_dump()
    record["name"] = session.get("name", "")
    record["timestamp"] = datetime.now().isoformat()
    results.append(record)
    return {"status": "ok"}


CSV_COLUMNS = [
    "participant_id", "name", "condition",
    "delay_condition", "trial_id", "block",
    "stake", "exchange_rate",
    "allocation_today", "allocation_future",
    "response_time_ms", "timestamp",
]


@app.get("/api/results/csv")
def download_all_csv():
    if not results:
        raise HTTPException(status_code=404, detail="結果がまだありません")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"Exp1time_results_{timestamp}.csv"

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=CSV_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    for r in results:
        writer.writerow({col: r.get(col, "") for col in CSV_COLUMNS})

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
