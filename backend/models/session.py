from pydantic import BaseModel


class SessionStartRequest(BaseModel):
    participant_id: str
    name: str
    delay_condition: str  # "1week" | "1month" | "3months"
