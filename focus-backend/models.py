from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from uuid import uuid4

def generate_uuid():
    return str(uuid4())


class User(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)

    # relationships
    daily_goals = relationship("DailyGoal", back_populates="user")
    friends = relationship("Friend", back_populates="user")
    study_sessions = relationship("StudySession", back_populates="user")


class DailyGoal(Base):
    __tablename__ = "daily_goals"

    uid = Column(String, primary_key=True, default=generate_uuid)
    user_uid = Column(String, ForeignKey("users.uid"), nullable=False)

    minutes_goal = Column(Integer, nullable=False)
    session_goal = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())

    user = relationship("User", back_populates="daily_goals")


class Friend(Base):
    __tablename__ = "friends"

    uid = Column(String, primary_key=True, default=generate_uuid)
    user_uid = Column(String, ForeignKey("users.uid"), nullable=False)
    friend_uid = Column(String, nullable=False)
    friend_username = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="friends")


class StudySession(Base):
    __tablename__ = "study_sessions"

    uid = Column(String, primary_key=True, default=generate_uuid)
    user_uid = Column(String, ForeignKey("users.uid"), nullable=False)

    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    studying_duration = Column(Integer, default=0)  # minutes

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="study_sessions")