from fastapi import FastAPI, APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import shutil

from models import (
    Country, CountryCreate, CountryUpdate,
    Team, TeamCreate, TeamUpdate,
    Goal, GoalCreate,
    User, UserInDB, UserCreate, UserUpdate,
    GameSession, GameSessionCreate,
    Token, LoginRequest,
    TeamStats, DailyStats, MonthlyStats, LeaderboardEntry,
    UserRole
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_admin_user
)
from database import (
    countries_collection, teams_collection, goals_collection,
    users_collection, game_sessions_collection, db
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / 'uploads' / 'shirts'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Create the main app
app = FastAPI(title="Mini Cup API", version="1.0.0")

# Mount static files for shirt designs
app.mount("/uploads", StaticFiles(directory=str(ROOT_DIR / 'uploads')), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await users_collection.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_dict = user_data.dict()
    password = user_dict.pop('password')
    user_dict['user_id'] = user_id
    user_dict['password_hash'] = get_password_hash(password)
    user_dict['created_at'] = datetime.utcnow()
    
    await users_collection.insert_one(user_dict)
    
    return User(**{k: v for k, v in user_dict.items() if k != 'password_hash'})

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: LoginRequest):
    user = await users_collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(
        data={"sub": user['user_id'], "username": user['username'], "role": user['role']}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"user_id": current_user['user_id']})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**{k: v for k, v in user.items() if k != 'password_hash'})

# ==================== ADMIN COUNTRY ROUTES ====================

@api_router.get("/admin/countries", response_model=List[Country])
async def get_all_countries_admin(current_user: dict = Depends(get_admin_user)):
    countries = await countries_collection.find().to_list(1000)
    return [Country(**country) for country in countries]

@api_router.post("/admin/countries", response_model=Country)
async def create_country(country_data: CountryCreate, current_user: dict = Depends(get_admin_user)):
    # Check if country_id exists
    existing = await countries_collection.find_one({"country_id": country_data.country_id})
    if existing:
        raise HTTPException(status_code=400, detail="Country ID already exists")
    
    country_dict = country_data.dict()
    country_dict['created_at'] = datetime.utcnow()
    
    await countries_collection.insert_one(country_dict)
    return Country(**country_dict)

@api_router.put("/admin/countries/{country_id}", response_model=Country)
async def update_country(country_id: str, country_data: CountryUpdate, current_user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in country_data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await countries_collection.find_one_and_update(
        {"country_id": country_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Country not found")
    
    return Country(**result)

@api_router.delete("/admin/countries/{country_id}")
async def delete_country(country_id: str, current_user: dict = Depends(get_admin_user)):
    # Check if country has teams
    teams_count = await teams_collection.count_documents({"country_id": country_id})
    if teams_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete country with {teams_count} teams")
    
    result = await countries_collection.delete_one({"country_id": country_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Country not found")
    
    return {"message": "Country deleted successfully"}

# ==================== ADMIN TEAM ROUTES ====================

@api_router.get("/admin/teams", response_model=List[Team])
async def get_all_teams_admin(current_user: dict = Depends(get_admin_user)):
    teams = await teams_collection.find().to_list(1000)
    
    # Enrich with country data
    for team in teams:
        country = await countries_collection.find_one({"country_id": team['country_id']})
        if country:
            team['country_name'] = country['name']
            team['flag'] = country['flag']
    
    return [Team(**team) for team in teams]

@api_router.post("/admin/teams", response_model=Team)
async def create_team(team_data: TeamCreate, current_user: dict = Depends(get_admin_user)):
    # Check if team_id exists
    existing = await teams_collection.find_one({"team_id": team_data.team_id})
    if existing:
        raise HTTPException(status_code=400, detail="Team ID already exists")
    
    # Verify country exists
    country = await countries_collection.find_one({"country_id": team_data.country_id})
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    
    team_dict = team_data.dict()
    team_dict['goals'] = 0
    team_dict['created_at'] = datetime.utcnow()
    team_dict['country_name'] = country['name']
    team_dict['flag'] = country['flag']
    
    await teams_collection.insert_one(team_dict)
    return Team(**team_dict)

@api_router.put("/admin/teams/{team_id}", response_model=Team)
async def update_team(team_id: str, team_data: TeamUpdate, current_user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in team_data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    # If updating country, verify it exists
    if 'country_id' in update_data:
        country = await countries_collection.find_one({"country_id": update_data['country_id']})
        if not country:
            raise HTTPException(status_code=404, detail="Country not found")
        update_data['country_name'] = country['name']
        update_data['flag'] = country['flag']
    
    result = await teams_collection.find_one_and_update(
        {"team_id": team_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return Team(**result)

@api_router.delete("/admin/teams/{team_id}")
async def delete_team(team_id: str, current_user: dict = Depends(get_admin_user)):
    result = await teams_collection.delete_one({"team_id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Delete associated goals
    await goals_collection.delete_many({"team_id": team_id})
    await game_sessions_collection.delete_many({"team_id": team_id})
    
    return {"message": "Team deleted successfully"}

@api_router.post("/admin/teams/{team_id}/shirt")
async def upload_shirt_design(team_id: str, file: UploadFile = File(...), current_user: dict = Depends(get_admin_user)):
    # Verify team exists
    team = await teams_collection.find_one({"team_id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save file
    file_extension = file.filename.split('.')[-1]
    filename = f"{team_id}_{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    with file_path.open('wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update team with shirt URL
    shirt_url = f"/uploads/shirts/{filename}"
    await teams_collection.update_one(
        {"team_id": team_id},
        {"$set": {"shirt_design_url": shirt_url}}
    )
    
    return {"shirt_design_url": shirt_url}

# ==================== ADMIN USER ROUTES ====================

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(current_user: dict = Depends(get_admin_user)):
    users = await users_collection.find().to_list(1000)
    return [User(**{k: v for k, v in user.items() if k != 'password_hash'}) for user in users]

@api_router.put("/admin/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserUpdate, current_user: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in user_data.dict().items() if v is not None}
    
    if 'password' in update_data:
        update_data['password_hash'] = get_password_hash(update_data.pop('password'))
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await users_collection.find_one_and_update(
        {"user_id": user_id},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**{k: v for k, v in result.items() if k != 'password_hash'})

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    if user_id == current_user['user_id']:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await users_collection.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

# ==================== PUBLIC GAME ROUTES ====================

@api_router.get("/countries", response_model=List[Country])
async def get_countries():
    countries = await countries_collection.find().to_list(1000)
    return [Country(**country) for country in countries]

@api_router.get("/countries/{country_id}/teams", response_model=List[Team])
async def get_country_teams(country_id: str):
    teams = await teams_collection.find({"country_id": country_id}).to_list(1000)
    
    # Enrich with country data
    country = await countries_collection.find_one({"country_id": country_id})
    for team in teams:
        if country:
            team['country_name'] = country['name']
            team['flag'] = country['flag']
    
    return [Team(**team) for team in teams]

@api_router.get("/teams", response_model=List[Team])
async def get_all_teams():
    teams = await teams_collection.find().to_list(1000)
    
    # Enrich with country data
    for team in teams:
        country = await countries_collection.find_one({"country_id": team['country_id']})
        if country:
            team['country_name'] = country['name']
            team['flag'] = country['flag']
    
    return [Team(**team) for team in teams]

@api_router.post("/game/session", response_model=GameSession)
async def create_game_session(session_data: GameSessionCreate):
    # Verify team exists
    team = await teams_collection.find_one({"team_id": session_data.team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Create game session
    session_id = str(uuid.uuid4())
    session_dict = session_data.dict()
    session_dict['session_id'] = session_id
    session_dict['team_name'] = team['name']
    session_dict['timestamp'] = datetime.utcnow()
    
    await game_sessions_collection.insert_one(session_dict)
    
    # Update team goals
    await teams_collection.update_one(
        {"team_id": session_data.team_id},
        {"$inc": {"goals": session_data.score}}
    )
    
    # Create goal record for each goal scored
    if session_data.score > 0:
        goal_dict = {
            'goal_id': str(uuid.uuid4()),
            'team_id': session_data.team_id,
            'team_name': team['name'],
            'score': session_data.score,
            'user_id': session_data.user_id,
            'timestamp': datetime.utcnow()
        }
        await goals_collection.insert_one(goal_dict)
    
    return GameSession(**session_dict)

@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard():
    teams = await teams_collection.find().sort("goals", -1).to_list(1000)
    
    leaderboard = []
    for idx, team in enumerate(teams):
        country = await countries_collection.find_one({"country_id": team['country_id']})
        leaderboard.append(LeaderboardEntry(
            rank=idx + 1,
            team_id=team['team_id'],
            team_name=team['name'],
            country_name=country['name'] if country else '',
            flag=country['flag'] if country else '',
            goals=team['goals'],
            color=team['color']
        ))
    
    return leaderboard

# ==================== STATS ROUTES ====================

@api_router.get("/stats/teams", response_model=List[TeamStats])
async def get_team_stats(current_user: dict = Depends(get_admin_user)):
    teams = await teams_collection.find().to_list(1000)
    
    stats = []
    for team in teams:
        country = await countries_collection.find_one({"country_id": team['country_id']})
        sessions = await game_sessions_collection.find({"team_id": team['team_id']}).to_list(10000)
        
        total_games = len(sessions)
        best_score = max([s['score'] for s in sessions], default=0)
        average_score = sum([s['score'] for s in sessions]) / total_games if total_games > 0 else 0
        
        stats.append(TeamStats(
            team_id=team['team_id'],
            team_name=team['name'],
            country_name=country['name'] if country else '',
            total_goals=team['goals'],
            total_games=total_games,
            average_score=round(average_score, 2),
            best_score=best_score
        ))
    
    return stats

@api_router.get("/stats/daily", response_model=List[DailyStats])
async def get_daily_stats(days: int = 30, current_user: dict = Depends(get_admin_user)):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "total_goals": {"$sum": "$score"},
            "total_games": {"$sum": 1},
            "unique_teams": {"$addToSet": "$team_id"}
        }},
        {"$project": {
            "date": "$_id",
            "total_goals": 1,
            "total_games": 1,
            "unique_teams": {"$size": "$unique_teams"}
        }},
        {"$sort": {"date": 1}}
    ]
    
    results = await game_sessions_collection.aggregate(pipeline).to_list(1000)
    return [DailyStats(**{k: v for k, v in r.items() if k != '_id'}) for r in results]

@api_router.get("/stats/monthly", response_model=List[MonthlyStats])
async def get_monthly_stats(months: int = 12, current_user: dict = Depends(get_admin_user)):
    start_date = datetime.utcnow() - timedelta(days=months * 30)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m", "date": "$timestamp"}},
            "total_goals": {"$sum": "$score"},
            "total_games": {"$sum": 1},
            "unique_teams": {"$addToSet": "$team_id"}
        }},
        {"$project": {
            "month": "$_id",
            "total_goals": 1,
            "total_games": 1,
            "unique_teams": {"$size": "$unique_teams"}
        }},
        {"$sort": {"month": 1}}
    ]
    
    results = await game_sessions_collection.aggregate(pipeline).to_list(1000)
    return [MonthlyStats(**{k: v for k, v in r.items() if k != '_id'}) for r in results]

# ==================== ROOT & HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Mini Cup API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    from database import client
    client.close()