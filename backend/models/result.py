from pydantic import BaseModel


class CTBResult(BaseModel):
    session_id: str
    participant_id: str
    condition: str         # "HIGH" | "LOW"
    delay_condition: str
    trial_id: str
    block: int
    stake: int
    exchange_rate: float
    allocation_today: int
    allocation_future: int
    response_time_ms: int
