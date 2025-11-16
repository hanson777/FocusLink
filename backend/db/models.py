import uuid
import sqlalchemy.dialects.postgresql as pg
from sqlmodel import SQLModel, Field, Column, Relationship
from sqlalchemy import ForeignKey
from datetime import datetime
from typing import Optional, List


class User(SQLModel, table=True):
    __tablename__ = "users"
    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    username: str
    email: str
    first_name: str
    last_name: str
    password_hash: str
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        ))

    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        )
    )

    studies: Optional[List["StudySession"]] = Relationship(back_populates="user")
    tasks: Optional[List["Task"]] = Relationship(back_populates="user")
    user_status: Optional[List["UserStatus"]] = Relationship(back_populates="user")
    friends: Optional[List["Friend"]] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"foreign_keys": "Friend.user_uid"}
    )
    added_by: Optional[List["Friend"]] = Relationship(
        back_populates="friend",
        sa_relationship_kwargs={"foreign_keys": "Friend.friend_uid"}
    )
    blocked_websites: Optional[List["BlockedWebsites"]] = Relationship(back_populates="user")
    study_sessions: Optional[List["StudySession"]] = Relationship(back_populates="user")

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"


class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True, \
            default=uuid.uuid4,
        )
    )

    user_uid: Optional[uuid.UUID] = Field(foreign_key="users.uid")
    title: str
    description: str
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        ))

    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
        )
    )

    user: Optional[User] = Relationship(back_populates="tasks")

    def __repr__(self):
        return f"<Task(user_uid={self.user_uid}, title={self.title})>"


class UserStatus(SQLModel, table=True):
    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        ))
    user_uid: Optional[uuid.UUID] = Field(foreign_key="users.uid")
    status: str = Field(default="on_break")
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        ))

    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        )
    )

    user: Optional[User] = Relationship(back_populates="user_status")

    def __repr__(self):
        return f"<UserStatus(user_uid={self.user_uid}, status={self.status})>"


class Friend(SQLModel, table=True):
    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )

    user_uid: Optional[uuid.UUID] = Field(foreign_key="users.uid")
    user: Optional[User] = Relationship(
        back_populates="friends",
        sa_relationship_kwargs={"foreign_keys": "[Friend.user_uid]"}
    )
    friend_uid: Optional[uuid.UUID] = Field(foreign_key="users.uid")
    friend: Optional[User] = Relationship(
        back_populates="added_by",
        sa_relationship_kwargs={"foreign_keys": "[Friend.friend_uid]"}
    )
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        ))

    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        )
    )

    def __repr__(self):
        return f"<Friend(user_uid={self.user_uid}, friend_uid={self.friend_uid})>"


class BlockedWebsites(SQLModel, table=True):
    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        ))
    url: str
    user_uid: Optional[uuid.UUID] = Field(foreign_key="users.uid")
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        ))

    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        )
    )

    user: Optional[User] = Relationship(back_populates="blocked_websites")

    def __repr__(self):
        return f"<BlockedWebsites(user_uid={self.user_uid}, url={self.url})>"


class StudySession(SQLModel, table=True):
    __tablename__ = "studysession"
    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        ))
    user_uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("users.uid"),
            nullable=False
        )
    )
    start_time: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        )
    )
    end_time: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        )
    )
    studying_duration: int
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now(),
        )
    )
    
    user: Optional[User] = Relationship(back_populates="study_sessions")
    
    def __repr__(self):
        return f"<StudySession(user_uid={self.user_uid}, duration={self.studying_duration})>"
