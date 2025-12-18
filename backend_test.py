#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Mini Cup Game
Tests all endpoints including health, public game routes, authentication, admin routes, and statistics.
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Configuration
BASE_URL = "https://soccer-challenge-55.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@minicup.com"
ADMIN_PASSWORD = "admin123"

class MiniCupAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_token = None
        self.test_results = []
        self.session = requests.Session()
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })
    
    def make_request(self, method, endpoint, headers=None, json_data=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.request(
                method=method,
                url=url,
                headers=headers,
                json=json_data,
                params=params,
                timeout=30
            )
            return response
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed for {method} {endpoint}: {str(e)}")
            return None
    
    def get_auth_headers(self):
        """Get authorization headers with admin token"""
        if not self.admin_token:
            return {}
        return {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_health_check(self):
        """Test 1: Health Check"""
        print("\n🔍 Testing Health Check...")
        
        response = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                self.log_test("Health Check", True, "API is healthy", data)
            else:
                self.log_test("Health Check", False, f"Unexpected response: {data}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Health Check", False, f"Failed with status: {status_code}")
    
    def test_public_endpoints(self):
        """Test 2-5: Public Game Endpoints"""
        print("\n🔍 Testing Public Game Endpoints...")
        
        # Test GET /api/countries
        response = self.make_request("GET", "/countries")
        if response and response.status_code == 200:
            countries = response.json()
            if len(countries) == 6:
                self.log_test("Get Countries", True, f"Retrieved {len(countries)} countries", countries[:2])
            else:
                self.log_test("Get Countries", False, f"Expected 6 countries, got {len(countries)}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Countries", False, f"Failed with status: {status_code}")
        
        # Test GET /api/teams
        response = self.make_request("GET", "/teams")
        if response and response.status_code == 200:
            teams = response.json()
            if len(teams) == 32:  # Updated to match actual seed data
                self.log_test("Get All Teams", True, f"Retrieved {len(teams)} teams", {"sample_team": teams[0] if teams else None})
            else:
                self.log_test("Get All Teams", False, f"Expected 32 teams, got {len(teams)}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get All Teams", False, f"Failed with status: {status_code}")
        
        # Test GET /api/countries/argentina/teams
        response = self.make_request("GET", "/countries/argentina/teams")
        if response and response.status_code == 200:
            argentina_teams = response.json()
            if len(argentina_teams) == 8:
                self.log_test("Get Argentina Teams", True, f"Retrieved {len(argentina_teams)} Argentina teams", {"sample": argentina_teams[0] if argentina_teams else None})
            else:
                self.log_test("Get Argentina Teams", False, f"Expected 8 Argentina teams, got {len(argentina_teams)}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Argentina Teams", False, f"Failed with status: {status_code}")
        
        # Test GET /api/leaderboard
        response = self.make_request("GET", "/leaderboard")
        if response and response.status_code == 200:
            leaderboard = response.json()
            if leaderboard and isinstance(leaderboard, list):
                # Check if sorted by goals (descending)
                is_sorted = all(leaderboard[i]['goals'] >= leaderboard[i+1]['goals'] 
                              for i in range(len(leaderboard)-1))
                if is_sorted:
                    self.log_test("Get Leaderboard", True, f"Retrieved sorted leaderboard with {len(leaderboard)} teams", {"top_team": leaderboard[0] if leaderboard else None})
                else:
                    self.log_test("Get Leaderboard", False, "Leaderboard not sorted by goals")
            else:
                self.log_test("Get Leaderboard", False, "Invalid leaderboard response")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Leaderboard", False, f"Failed with status: {status_code}")
    
    def test_game_session_creation(self):
        """Test 6: Game Session Creation"""
        print("\n🔍 Testing Game Session Creation...")
        
        # Create a game session
        session_data = {
            "team_id": "arg1",
            "score": 5,
            "user_id": None
        }
        
        response = self.make_request("POST", "/game/session", json_data=session_data)
        if response and response.status_code == 200:
            session = response.json()
            if session.get("team_id") == "arg1" and session.get("score") == 5:
                self.log_test("Create Game Session", True, "Game session created successfully", session)
                
                # Test multiple sessions for different teams
                session_data2 = {"team_id": "bra1", "score": 3}
                response2 = self.make_request("POST", "/game/session", json_data=session_data2)
                if response2 and response2.status_code == 200:
                    self.log_test("Create Multiple Sessions", True, "Multiple game sessions work")
                else:
                    self.log_test("Create Multiple Sessions", False, "Failed to create second session")
            else:
                self.log_test("Create Game Session", False, f"Unexpected session data: {session}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Create Game Session", False, f"Failed with status: {status_code}")
    
    def test_authentication(self):
        """Test 7: Authentication"""
        print("\n🔍 Testing Authentication...")
        
        # Test login with correct credentials
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", json_data=login_data)
        if response and response.status_code == 200:
            token_data = response.json()
            if "access_token" in token_data and token_data.get("token_type") == "bearer":
                self.admin_token = token_data["access_token"]
                self.log_test("Admin Login", True, "Successfully logged in as admin", {"token_type": token_data["token_type"]})
            else:
                self.log_test("Admin Login", False, f"Invalid token response: {token_data}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Admin Login", False, f"Failed with status: {status_code}")
        
        # Test login with wrong credentials
        wrong_login = {
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        }
        
        response = self.make_request("POST", "/auth/login", json_data=wrong_login)
        if response and response.status_code == 401:
            self.log_test("Wrong Credentials", True, "Correctly rejected wrong credentials")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Wrong Credentials", False, f"Expected 401, got: {status_code}")
        
        # Test GET /api/auth/me with valid token
        if self.admin_token:
            headers = self.get_auth_headers()
            response = self.make_request("GET", "/auth/me", headers=headers)
            if response and response.status_code == 200:
                user_info = response.json()
                if user_info.get("email") == ADMIN_EMAIL and user_info.get("role") == "admin":
                    self.log_test("Get User Info", True, "Retrieved user info successfully", user_info)
                else:
                    self.log_test("Get User Info", False, f"Unexpected user info: {user_info}")
            else:
                status_code = response.status_code if response else "No response"
                self.log_test("Get User Info", False, f"Failed with status: {status_code}")
    
    def test_admin_country_management(self):
        """Test 8: Admin Country Management"""
        print("\n🔍 Testing Admin Country Management...")
        
        if not self.admin_token:
            self.log_test("Admin Country Tests", False, "No admin token available")
            return
        
        headers = self.get_auth_headers()
        
        # Test GET /api/admin/countries
        response = self.make_request("GET", "/admin/countries", headers=headers)
        if response and response.status_code == 200:
            countries = response.json()
            self.log_test("Admin Get Countries", True, f"Retrieved {len(countries)} countries as admin")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Admin Get Countries", False, f"Failed with status: {status_code}")
        
        # Test POST /api/admin/countries (create new country)
        test_country_id = f"test_{uuid.uuid4().hex[:8]}"
        new_country = {
            "country_id": test_country_id,
            "name": "Test Country",
            "flag": "🏳️",
            "color": "#FF0000"
        }
        
        response = self.make_request("POST", "/admin/countries", headers=headers, json_data=new_country)
        if response and response.status_code == 200:
            created_country = response.json()
            self.log_test("Create Country", True, f"Created country: {created_country['name']}")
            
            # Test PUT /api/admin/countries/{id} (update country)
            update_data = {"name": "Updated Test Country"}
            response = self.make_request("PUT", f"/admin/countries/{test_country_id}", headers=headers, json_data=update_data)
            if response and response.status_code == 200:
                updated_country = response.json()
                if updated_country.get("name") == "Updated Test Country":
                    self.log_test("Update Country", True, "Successfully updated country name")
                else:
                    self.log_test("Update Country", False, "Country name not updated correctly")
            else:
                status_code = response.status_code if response else "No response"
                self.log_test("Update Country", False, f"Failed with status: {status_code}")
            
            # Test DELETE country without teams
            response = self.make_request("DELETE", f"/admin/countries/{test_country_id}", headers=headers)
            if response and response.status_code == 200:
                self.log_test("Delete Country", True, "Successfully deleted test country")
            else:
                status_code = response.status_code if response else "No response"
                self.log_test("Delete Country", False, f"Failed with status: {status_code}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Create Country", False, f"Failed with status: {status_code}")
        
        # Test non-admin access (should fail with 403)
        response = self.make_request("GET", "/admin/countries")  # No auth headers
        if response and response.status_code == 401:
            self.log_test("Non-Admin Access", True, "Correctly blocked non-admin access")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Non-Admin Access", False, f"Expected 401, got: {status_code}")
    
    def test_admin_team_management(self):
        """Test 9: Admin Team Management"""
        print("\n🔍 Testing Admin Team Management...")
        
        if not self.admin_token:
            self.log_test("Admin Team Tests", False, "No admin token available")
            return
        
        headers = self.get_auth_headers()
        
        # Test GET /api/admin/teams
        response = self.make_request("GET", "/admin/teams", headers=headers)
        if response and response.status_code == 200:
            teams = response.json()
            self.log_test("Admin Get Teams", True, f"Retrieved {len(teams)} teams as admin")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Admin Get Teams", False, f"Failed with status: {status_code}")
        
        # Test POST /api/admin/teams (create new team)
        test_team_id = f"test_{uuid.uuid4().hex[:8]}"
        new_team = {
            "team_id": test_team_id,
            "name": "Test Team FC",
            "country_id": "argentina",  # Use existing country
            "color": "#00FF00"
        }
        
        response = self.make_request("POST", "/admin/teams", headers=headers, json_data=new_team)
        if response and response.status_code == 200:
            created_team = response.json()
            self.log_test("Create Team", True, f"Created team: {created_team['name']}")
            
            # Test PUT /api/admin/teams/{id} (update team)
            update_data = {"name": "Updated Test Team FC"}
            response = self.make_request("PUT", f"/admin/teams/{test_team_id}", headers=headers, json_data=update_data)
            if response and response.status_code == 200:
                updated_team = response.json()
                if updated_team.get("name") == "Updated Test Team FC":
                    self.log_test("Update Team", True, "Successfully updated team name")
                else:
                    self.log_test("Update Team", False, "Team name not updated correctly")
            else:
                status_code = response.status_code if response else "No response"
                self.log_test("Update Team", False, f"Failed with status: {status_code}")
            
            # Test DELETE team
            response = self.make_request("DELETE", f"/admin/teams/{test_team_id}", headers=headers)
            if response and response.status_code == 200:
                self.log_test("Delete Team", True, "Successfully deleted test team")
            else:
                status_code = response.status_code if response else "No response"
                self.log_test("Delete Team", False, f"Failed with status: {status_code}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Create Team", False, f"Failed with status: {status_code}")
    
    def test_admin_user_management(self):
        """Test 10: Admin User Management"""
        print("\n🔍 Testing Admin User Management...")
        
        if not self.admin_token:
            self.log_test("Admin User Tests", False, "No admin token available")
            return
        
        headers = self.get_auth_headers()
        
        # Test GET /api/admin/users
        response = self.make_request("GET", "/admin/users", headers=headers)
        if response and response.status_code == 200:
            users = response.json()
            self.log_test("Admin Get Users", True, f"Retrieved {len(users)} users as admin")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Admin Get Users", False, f"Failed with status: {status_code}")
        
        # Test creating new user via POST /api/auth/register
        test_user_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
        new_user = {
            "username": f"testuser_{uuid.uuid4().hex[:8]}",
            "email": test_user_email,
            "password": "testpassword123",
            "role": "user"
        }
        
        response = self.make_request("POST", "/auth/register", json_data=new_user)
        if response and response.status_code == 200:
            created_user = response.json()
            user_id = created_user.get("user_id")
            self.log_test("Create User", True, f"Created user: {created_user['username']}")
            
            if user_id:
                # Test PUT /api/admin/users/{id} (update user role)
                update_data = {"role": "admin"}
                response = self.make_request("PUT", f"/admin/users/{user_id}", headers=headers, json_data=update_data)
                if response and response.status_code == 200:
                    updated_user = response.json()
                    if updated_user.get("role") == "admin":
                        self.log_test("Update User Role", True, "Successfully updated user role to admin")
                    else:
                        self.log_test("Update User Role", False, "User role not updated correctly")
                else:
                    status_code = response.status_code if response else "No response"
                    self.log_test("Update User Role", False, f"Failed with status: {status_code}")
                
                # Test DELETE user
                response = self.make_request("DELETE", f"/admin/users/{user_id}", headers=headers)
                if response and response.status_code == 200:
                    self.log_test("Delete User", True, "Successfully deleted test user")
                else:
                    status_code = response.status_code if response else "No response"
                    self.log_test("Delete User", False, f"Failed with status: {status_code}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Create User", False, f"Failed with status: {status_code}")
    
    def test_statistics_endpoints(self):
        """Test 11: Statistics Endpoints"""
        print("\n🔍 Testing Statistics Endpoints...")
        
        if not self.admin_token:
            self.log_test("Statistics Tests", False, "No admin token available")
            return
        
        headers = self.get_auth_headers()
        
        # Test GET /api/stats/teams
        response = self.make_request("GET", "/stats/teams", headers=headers)
        if response and response.status_code == 200:
            team_stats = response.json()
            if isinstance(team_stats, list) and len(team_stats) > 0:
                sample_stat = team_stats[0]
                required_fields = ['team_id', 'team_name', 'total_goals', 'total_games', 'average_score', 'best_score']
                has_all_fields = all(field in sample_stat for field in required_fields)
                if has_all_fields:
                    self.log_test("Get Team Stats", True, f"Retrieved stats for {len(team_stats)} teams", {"sample": sample_stat})
                else:
                    self.log_test("Get Team Stats", False, "Missing required fields in team stats")
            else:
                self.log_test("Get Team Stats", False, "No team stats returned")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Team Stats", False, f"Failed with status: {status_code}")
        
        # Test GET /api/stats/daily?days=7
        response = self.make_request("GET", "/stats/daily", headers=headers, params={"days": 7})
        if response and response.status_code == 200:
            daily_stats = response.json()
            self.log_test("Get Daily Stats", True, f"Retrieved daily stats for 7 days: {len(daily_stats)} entries")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Daily Stats", False, f"Failed with status: {status_code}")
        
        # Test GET /api/stats/monthly?months=3
        response = self.make_request("GET", "/stats/monthly", headers=headers, params={"months": 3})
        if response and response.status_code == 200:
            monthly_stats = response.json()
            self.log_test("Get Monthly Stats", True, f"Retrieved monthly stats for 3 months: {len(monthly_stats)} entries")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Get Monthly Stats", False, f"Failed with status: {status_code}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting Mini Cup Backend API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 80)
        
        # Run all test suites
        self.test_health_check()
        self.test_public_endpoints()
        self.test_game_session_creation()
        self.test_authentication()
        self.test_admin_country_management()
        self.test_admin_team_management()
        self.test_admin_user_management()
        self.test_statistics_endpoints()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"✅ PASSED: {passed}")
        print(f"❌ FAILED: {failed}")
        print(f"📈 SUCCESS RATE: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n" + "=" * 80)
        return failed == 0

def main():
    """Main test runner"""
    tester = MiniCupAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()