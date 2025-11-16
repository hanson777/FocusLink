from pydantic import BaseModel, ConfigDict
import uuid


class BlockedWebsiteCreateModel(BaseModel):
    url: str


class BlockedWebsiteModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    uid: uuid.UUID
    url: str


class BlockedWebsiteUpdateModel(BaseModel):
    url: str


