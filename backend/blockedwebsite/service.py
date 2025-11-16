from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from .schemas import BlockedWebsiteCreateModel, BlockedWebsiteUpdateModel
from sqlmodel import select
from backend.db.models import BlockedWebsites


class BlockedWebsiteService:
    async def create_blocked_website(self, blocked_website: BlockedWebsiteCreateModel, user_uid: str, session: AsyncSession):
        blocked_website_dict = blocked_website.model_dump()
        blocked_website_obj = BlockedWebsites(**blocked_website_dict)
        blocked_website_obj.user_uid = user_uid
        session.add(blocked_website_obj)
        await session.commit()
        await session.refresh(blocked_website_obj)
        return blocked_website_obj

    async def get_all_blocked_websites(self, session: AsyncSession):
        statement = select(BlockedWebsites)
        result = await session.exec(statement)
        blocked_websites = result.all()
        return blocked_websites

    async def get_blocked_website(self, uid: str, session: AsyncSession):
        statement = select(BlockedWebsites).where(BlockedWebsites.uid == uid)
        result = await session.exec(statement)
        blocked_website = result.first()
        return blocked_website

    async def update_blocked_website(self, blocked_website: BlockedWebsiteUpdateModel, session: AsyncSession):
        blocked_website_to_update = await self.get_blocked_website(blocked_website.uid, session)
        if blocked_website_to_update:
            for key, value in blocked_website.model_dump().items():
                setattr(blocked_website_to_update, key, value)
            await session.commit()
            await session.refresh(blocked_website_to_update)
            return blocked_website_to_update
        else:
            raise HTTPException(status_code=404, detail="Blocked website not found")

    async def delete_blocked_website(self, uid: str, session: AsyncSession):
        website_to_delete = await self.get_blocked_website(uid, session)
        if website_to_delete:
            await session.delete(website_to_delete)
            await session.commit()
            return {"message": "Blocked website deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Blocked website not found")
