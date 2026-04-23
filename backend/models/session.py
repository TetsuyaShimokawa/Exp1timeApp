from pydantic import BaseModel


class SessionStartRequest(BaseModel):
    participant_id: str
    name: str
