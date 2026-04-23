from pydantic import BaseModel


class MPLRowResult(BaseModel):
    session_id: str
    participant_id: str
    condition: str        # "HIGH" | "LOW"
    delay_condition: str
    block: int
    exchange_rate: float
    future_amount: int
    row: int
    today_amount: int
    choice: str           # "A" (today) | "B" (future)
    response_time_ms: int  # time for the whole block
