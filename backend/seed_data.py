import asyncio
from database import (
    countries_collection, teams_collection, users_collection
)
from auth import get_password_hash
from datetime import datetime

async def seed_database():
    print("🌱 Seeding database...")
    
    # Clear existing data
    await countries_collection.delete_many({})
    await teams_collection.delete_many({})
    
    # Seed countries
    countries_data = [
        {'country_id': 'argentina', 'name': 'Argentina', 'flag': '🇦🇷', 'color': '#75AADB', 'created_at': datetime.utcnow()},
        {'country_id': 'brazil', 'name': 'Brazil', 'flag': '🇧🇷', 'color': '#009B3A', 'created_at': datetime.utcnow()},
        {'country_id': 'uruguay', 'name': 'Uruguay', 'flag': '🇺🇾', 'color': '#0038A8', 'created_at': datetime.utcnow()},
        {'country_id': 'spain', 'name': 'Spain', 'flag': '🇪🇸', 'color': '#C60B1E', 'created_at': datetime.utcnow()},
        {'country_id': 'england', 'name': 'England', 'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'color': '#C8102E', 'created_at': datetime.utcnow()},
        {'country_id': 'italy', 'name': 'Italy', 'flag': '🇮🇹', 'color': '#009246', 'created_at': datetime.utcnow()},
    ]
    
    await countries_collection.insert_many(countries_data)
    print(f"✅ Seeded {len(countries_data)} countries")
    
    # Seed teams
    teams_data = [
        # Argentina teams
        {'team_id': 'arg1', 'name': 'Gallinas', 'country_id': 'argentina', 'flag': '🇦🇷', 'color': '#FFD700', 'goals': 15678901, 'created_at': datetime.utcnow()},
        {'team_id': 'arg2', 'name': 'Bosta', 'country_id': 'argentina', 'flag': '🇦🇷', 'color': '#003F87', 'goals': 14234567, 'created_at': datetime.utcnow()},
        {'team_id': 'arg3', 'name': 'Acade', 'country_id': 'argentina', 'flag': '🇦🇷', 'color': '#EE2737', 'goals': 13456789, 'created_at': datetime.utcnow()},
        {'team_id': 'arg4', 'name': 'Rojo', 'country_id': 'argentina', 'flag': '🇦🇷', 'color': '#E30613', 'goals': 12789012, 'created_at': datetime.utcnow()},
        {'team_id': 'arg5', 'name': 'Rosario', 'country_id': 'argentina', 'flag': '🇦🇷', 'color': '#FFCD00', 'goals': 11901234, 'created_at': datetime.utcnow()},
        {'team_id': 'arg6', 'name': 'NOB', 'country_id': 'argentina', 'flag': '🇦🇷', 'color': '#CC0000', 'goals': 10678901, 'created_at': datetime.utcnow()},
        {'team_id': 'arg7', 'name': 'Santo', 'country_id': 'argentina', 'flag': '🇦🇷', 'color': '#8B0000', 'goals': 9456789, 'created_at': datetime.utcnow()},
        {'team_id': 'arg8', 'name': 'Globo', 'country_id': 'argentina', 'flag': '🇦🇷', 'color': '#00A3E0', 'goals': 8234567, 'created_at': datetime.utcnow()},
        
        # Brazil teams
        {'team_id': 'bra1', 'name': 'Verdao', 'country_id': 'brazil', 'flag': '🇧🇷', 'color': '#046A38', 'goals': 18901234, 'created_at': datetime.utcnow()},
        {'team_id': 'bra2', 'name': 'Mengao', 'country_id': 'brazil', 'flag': '🇧🇷', 'color': '#E31E24', 'goals': 17678901, 'created_at': datetime.utcnow()},
        {'team_id': 'bra3', 'name': 'Flu', 'country_id': 'brazil', 'flag': '🇧🇷', 'color': '#7D2F3B', 'goals': 16456789, 'created_at': datetime.utcnow()},
        {'team_id': 'bra4', 'name': 'Galo', 'country_id': 'brazil', 'flag': '🇧🇷', 'color': '#000000', 'goals': 15234567, 'created_at': datetime.utcnow()},
        {'team_id': 'bra5', 'name': 'Colorado', 'country_id': 'brazil', 'flag': '🇧🇷', 'color': '#E4002B', 'goals': 14012345, 'created_at': datetime.utcnow()},
        {'team_id': 'bra6', 'name': 'Tricolor', 'country_id': 'brazil', 'flag': '🇧🇷', 'color': '#FF0000', 'goals': 12890123, 'created_at': datetime.utcnow()},
        
        # Uruguay teams
        {'team_id': 'uru1', 'name': 'Bolso', 'country_id': 'uruguay', 'flag': '🇺🇾', 'color': '#FFD700', 'goals': 9678901, 'created_at': datetime.utcnow()},
        {'team_id': 'uru2', 'name': 'Carbonero', 'country_id': 'uruguay', 'flag': '🇺🇾', 'color': '#000000', 'goals': 8456789, 'created_at': datetime.utcnow()},
        
        # Spain teams
        {'team_id': 'esp1', 'name': 'Cule', 'country_id': 'spain', 'flag': '🇪🇸', 'color': '#A50044', 'goals': 20123456, 'created_at': datetime.utcnow()},
        {'team_id': 'esp2', 'name': 'Merengue', 'country_id': 'spain', 'flag': '🇪🇸', 'color': '#FEBE10', 'goals': 19890123, 'created_at': datetime.utcnow()},
        {'team_id': 'esp3', 'name': 'Colchonero', 'country_id': 'spain', 'flag': '🇪🇸', 'color': '#CE3524', 'goals': 16678901, 'created_at': datetime.utcnow()},
        {'team_id': 'esp4', 'name': 'Los Che', 'country_id': 'spain', 'flag': '🇪🇸', 'color': '#FFE500', 'goals': 14456789, 'created_at': datetime.utcnow()},
        {'team_id': 'esp5', 'name': 'Palanganas', 'country_id': 'spain', 'flag': '🇪🇸', 'color': '#00A650', 'goals': 13234567, 'created_at': datetime.utcnow()},
        {'team_id': 'esp6', 'name': 'Leones', 'country_id': 'spain', 'flag': '🇪🇸', 'color': '#003399', 'goals': 12012345, 'created_at': datetime.utcnow()},
        
        # England teams
        {'team_id': 'eng1', 'name': 'Diablos', 'country_id': 'england', 'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'color': '#DA291C', 'goals': 22345678, 'created_at': datetime.utcnow()},
        {'team_id': 'eng2', 'name': 'Ciudadanos', 'country_id': 'england', 'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'color': '#6CABDD', 'goals': 21123456, 'created_at': datetime.utcnow()},
        {'team_id': 'eng3', 'name': 'Rojos', 'country_id': 'england', 'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'color': '#C8102E', 'goals': 18901234, 'created_at': datetime.utcnow()},
        {'team_id': 'eng4', 'name': 'Azules', 'country_id': 'england', 'flag': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'color': '#034694', 'goals': 17678901, 'created_at': datetime.utcnow()},
        
        # Italy teams
        {'team_id': 'ita1', 'name': 'Diavolo', 'country_id': 'italy', 'flag': '🇮🇹', 'color': '#FB090B', 'goals': 19456789, 'created_at': datetime.utcnow()},
        {'team_id': 'ita2', 'name': 'Nerazzurri', 'country_id': 'italy', 'flag': '🇮🇹', 'color': '#010E80', 'goals': 18234567, 'created_at': datetime.utcnow()},
        {'team_id': 'ita3', 'name': 'Vecchia Signora', 'country_id': 'italy', 'flag': '🇮🇹', 'color': '#000000', 'goals': 17012345, 'created_at': datetime.utcnow()},
        {'team_id': 'ita4', 'name': 'Toro', 'country_id': 'italy', 'flag': '🇮🇹', 'color': '#8B2323', 'goals': 14890123, 'created_at': datetime.utcnow()},
        {'team_id': 'ita5', 'name': 'Azzurri', 'country_id': 'italy', 'flag': '🇮🇹', 'color': '#0066CC', 'goals': 13678901, 'created_at': datetime.utcnow()},
        {'team_id': 'ita6', 'name': 'Lupi', 'country_id': 'italy', 'flag': '🇮🇹', 'color': '#8B0000', 'goals': 12456789, 'created_at': datetime.utcnow()},
    ]
    
    await teams_collection.insert_many(teams_data)
    print(f"✅ Seeded {len(teams_data)} teams")
    
    # Create default admin user
    existing_admin = await users_collection.find_one({"email": "admin@minicup.com"})
    if not existing_admin:
        admin_user = {
            'user_id': 'admin-001',
            'username': 'admin',
            'email': 'admin@minicup.com',
            'password_hash': get_password_hash('admin123'),
            'role': 'admin',
            'created_at': datetime.utcnow()
        }
        await users_collection.insert_one(admin_user)
        print("✅ Created default admin user (email: admin@minicup.com, password: admin123)")
    else:
        print("⚠️  Admin user already exists")
    
    print("✨ Database seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())
