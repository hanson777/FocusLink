from pydantic import BaseModel

class StudySessionCreateModel(BaseModel):
    title: str
    description: str
    start_date: str
    end_date: str