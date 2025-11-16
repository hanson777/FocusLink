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
            primary_key=True, \
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
    friend_reqs: Optional[List["Friend"]] = Relationship(back_populates="friend_req")
    friends: Optional[List["Friend"]] = Relationship(back_populates="user")
    blocked_websites: Optional[List["BlockedWebsites"]] = Relationship(back_populates="user")

    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"


class StudySession(SQLModel, table=True):
    __tablename__ = "studies"
    uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True, \
            default=uuid.uuid4,
        )
    )

    user_uid: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("users.uid"),
            nullable=False
        )
    )

    status: str
    focus_minutes: int
    stop: bool
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

    user: Optional[User] = Relationship(back_populates="studies")

    def __repr__(self):
        return f"<StudySession(user_uid={self.user_uid}, status={self.status})>"


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
    user: Optional[User] = Relationship(back_populates="friends")
    friend_req_uid: Optional[uuid.UUID] = Field(foreign_key="users.uid")
    friend_req: Optional[User] = Relationship(back_populates="friend_reqs")
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
        return f"<Friend(user_uid={self.user_uid}, friend_req_uid={self.friend_req_uid})>"


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

