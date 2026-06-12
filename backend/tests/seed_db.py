import asyncio
import uuid
from datetime import datetime, timedelta

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from backend.db.main import engine, init_db
from backend.db.models import (
    User,
    UserStatus,
    Task,
    StudySession,
    BlockedWebsites,
    Friend,
)


async def seed_users(session: AsyncSession):
    try:
        result = await session.exec(select(User).where(User.email == "test1@example.com"))
        if result.first():
            print("[users] Seed users already exist, skipping.")
            return []

        users = []

        u1 = User(
            uid=uuid.uuid4(),
            username="testuser1",
            email="test1@example.com",
            first_name="Test",
            last_name="One",
            password_hash="fake-hash-1",
            is_verified=True,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        u2 = User(
            uid=uuid.uuid4(),
            username="testuser2",
            email="test2@example.com",
            first_name="Test",
            last_name="Two",
            password_hash="fake-hash-2",
            is_verified=True,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        u3 = User(
            uid=uuid.uuid4(),
            username="testuser3",
            email="test3@example.com",
            first_name="Test",
            last_name="Three",
            password_hash="fake-hash-3",
            is_verified=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        session.add(u1)
        session.add(u2)
        session.add(u3)
        await session.flush()

        users.extend([u1, u2, u3])
        print("[users] Created 3 users.")
        return users
    except Exception as e:
        print(f"[users] Error seeding users: {e}")
        return []


async def seed_statuses(session: AsyncSession, users):
    try:
        for u in users:
            status = UserStatus(
                user_uid=u.uid,
                status="studying" if u.username != "testuser3" else "on_break",
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
            session.add(status)
        print("[status] Added statuses for users.")
    except Exception as e:
        print(f"[status] Error seeding user statuses: {e}")


async def seed_tasks(session: AsyncSession, users):
    try:
        for u in users:
            task = Task(
                user_uid=u.uid,
                minutes_goal=120,
                session_goal=3,
                current_minutes=30,
                current_sessions=1,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
            session.add(task)
        print("[tasks] Added daily goals for users.")
    except Exception as e:
        print(f"[tasks] Error seeding tasks: {e}")


async def seed_study_sessions(session: AsyncSession, users):
    try:
        now = datetime.now()
        for idx, u in enumerate(users):
            # create 5 days of sessions for streak testing
            for day_offset in range(5):
                start = now - timedelta(days=day_offset, hours=1 + idx)
                end = start + timedelta(minutes=60 + idx * 15)
                ss = StudySession(
                    user_uid=u.uid,
                    start_time=start,
                    end_time=end,
                    studying_duration=int((end - start).total_seconds() // 60),
                    created_at=start,
                    updated_at=end,
                )
                session.add(ss)
        print("[sessions] Added study sessions.")
    except Exception as e:
        print(f"[sessions] Error seeding study sessions: {e}")


async def seed_blocked_websites(session: AsyncSession, users):
    try:
        urls = ["https://youtube.com", "https://twitter.com", "https://reddit.com"]
        for i, u in enumerate(users):
            bw = BlockedWebsites(
                user_uid=u.uid,
                url=urls[i % len(urls)],
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
            session.add(bw)
        print("[blocked_websites] Added blocked sites.")
    except Exception as e:
        print(f"[blocked_websites] Error seeding blocked websites: {e}")


async def seed_friends(session: AsyncSession, users):
    try:
        if len(users) < 2:
            print("[friends] Not enough users to create friendships.")
            return

        # user1 -> user2, user1 -> user3
        f1 = Friend(
            user_uid=users[0].uid,
            friend_uid=users[1].uid,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        f2 = Friend(
            user_uid=users[0].uid,
            friend_uid=users[2].uid,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        session.add(f1)
        session.add(f2)
        print("[friends] Added friendships for testuser1.")
    except Exception as e:
        print(f"[friends] Error seeding friends: {e}")


async def main():
    try:
        print("[init] Creating tables (if not exist)...")
        await init_db()
    except Exception as e:
        print(f"[init] Error during init_db: {e}")
        return

    async with AsyncSession(engine) as session:
        try:
            users = await seed_users(session)
            await seed_statuses(session, users)
            await seed_tasks(session, users)
            await seed_study_sessions(session, users)
            await seed_blocked_websites(session, users)
            await seed_friends(session, users)

            await session.commit()
            print("[done] Database seeding completed.")
        except Exception as e:
            await session.rollback()
            print(f"[main] Error during seeding transaction, rolled back: {e}")


if __name__ == "__main__":
    asyncio.run(main())


