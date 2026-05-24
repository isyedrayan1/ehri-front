from pydantic import BaseModel


class Alert(BaseModel):
    level: str
    message: str
    precautions: list[str]
    vulnerable_groups: list[str]
