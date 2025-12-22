from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'mini_cup_db')]

# Collections
countries_collection = db.countries
teams_collection = db.teams
goals_collection = db.goals
users_collection = db.users
game_sessions_collection = db.game_sessions
config_collection = db.config
