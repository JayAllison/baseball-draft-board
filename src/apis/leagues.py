from fastapi import APIRouter
from pydantic import BaseModel
from datetime import date
import databutton as db

router = APIRouter()

class AgeGroup(BaseModel):
    name: str
    birthdateStart: date | None
    birthdateEnd: date | None

class CreateLeagueRequest(BaseModel):
    leagueName: str
    numberOfGroups: int
    ageGroups: list[AgeGroup]

class CreateLeagueResponse(BaseModel):
    id: str
    leagueName: str
    numberOfGroups: int
    ageGroups: list[AgeGroup]

@router.post("/create-league")
def create_league(body: CreateLeagueRequest) -> CreateLeagueResponse:
    # Get existing leagues or initialize empty list
    try:
        leagues = db.storage.json.get("leagues", default=[])
    except:
        leagues = []
    
    # Create new league with ID
    new_league = {
        "id": str(len(leagues) + 1),  # Simple ID generation
        "leagueName": body.leagueName,
        "numberOfGroups": body.numberOfGroups,
        "ageGroups": [{
            "name": group.name,
            "birthdateStart": group.birthdateStart.isoformat() if group.birthdateStart else None,
            "birthdateEnd": group.birthdateEnd.isoformat() if group.birthdateEnd else None
        } for group in body.ageGroups]
    }
    
    # Add to leagues and save
    leagues.append(new_league)
    db.storage.json.put("leagues", leagues)
    
    # Return the created league
    return CreateLeagueResponse(
        id=new_league["id"],
        leagueName=new_league["leagueName"],
        numberOfGroups=new_league["numberOfGroups"],
        ageGroups=[AgeGroup(
            name=group["name"],
            birthdateStart=date.fromisoformat(group["birthdateStart"]) if group["birthdateStart"] else None,
            birthdateEnd=date.fromisoformat(group["birthdateEnd"]) if group["birthdateEnd"] else None
        ) for group in new_league["ageGroups"]]
    )