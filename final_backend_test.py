#!/usr/bin/env python3
"""
Final Comprehensive Backend API Tests for Mini Cup Game
"""

import requests
import json
import uuid

BASE_URL = "https://goal-keeper-30.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@minicup.com"
ADMIN_PASSWORD = "admin123"

def test_all_endpoints():
    """Run all backend tests"""
    results = []
    admin_token = None
    
    print("🚀 Mini Cup Backend API Comprehensive Test")
    print(f"📍 Base URL: {BASE_URL}")
    print("=" * 80)
    
    # 1. Health Check
    print("\n🔍 1. Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=30)
        if response.status_code == 200 and response.json().get("status") == "healthy":
            print("✅ PASS: Health Check - API is healthy")
            results.append(("Health Check", True))
        else:
            print(f"❌ FAIL: Health Check - Unexpected response: {response.json()}")
            results.append(("Health Check", False))
    except Exception as e:
        print(f"❌ FAIL: Health Check - Error: {e}")
        results.append(("Health Check", False))
    
    # 2. Public Endpoints
    print("\n🔍 2. Testing Public Game Endpoints...")
    
    # Countries
    try:
        response = requests.get(f"{BASE_URL}/countries", timeout=30)
        if response.status_code == 200:
            countries = response.json()
            if len(countries) == 6:
                print(f"✅ PASS: Get Countries - Retrieved {len(countries)} countries")
                results.append(("Get Countries", True))
            else:
                print(f"❌ FAIL: Get Countries - Expected 6, got {len(countries)}")
                results.append(("Get Countries", False))
        else:
            print(f"❌ FAIL: Get Countries - Status: {response.status_code}")
            results.append(("Get Countries", False))
    except Exception as e:
        print(f"❌ FAIL: Get Countries - Error: {e}")
        results.append(("Get Countries", False))
    
    # Teams
    try:
        response = requests.get(f"{BASE_URL}/teams", timeout=30)
        if response.status_code == 200:
            teams = response.json()
            if len(teams) == 32:
                print(f"✅ PASS: Get All Teams - Retrieved {len(teams)} teams")
                results.append(("Get All Teams", True))
            else:
                print(f"❌ FAIL: Get All Teams - Expected 32, got {len(teams)}")
                results.append(("Get All Teams", False))
        else:
            print(f"❌ FAIL: Get All Teams - Status: {response.status_code}")
            results.append(("Get All Teams", False))
    except Exception as e:
        print(f"❌ FAIL: Get All Teams - Error: {e}")
        results.append(("Get All Teams", False))
    
    # Argentina Teams
    try:
        response = requests.get(f"{BASE_URL}/countries/argentina/teams", timeout=30)
        if response.status_code == 200:
            argentina_teams = response.json()
            if len(argentina_teams) == 8:
                print(f"✅ PASS: Get Argentina Teams - Retrieved {len(argentina_teams)} teams")
                results.append(("Get Argentina Teams", True))
            else:
                print(f"❌ FAIL: Get Argentina Teams - Expected 8, got {len(argentina_teams)}")
                results.append(("Get Argentina Teams", False))
        else:
            print(f"❌ FAIL: Get Argentina Teams - Status: {response.status_code}")
            results.append(("Get Argentina Teams", False))
    except Exception as e:
        print(f"❌ FAIL: Get Argentina Teams - Error: {e}")
        results.append(("Get Argentina Teams", False))
    
    # Leaderboard
    try:
        response = requests.get(f"{BASE_URL}/leaderboard", timeout=30)
        if response.status_code == 200:
            leaderboard = response.json()
            if leaderboard and isinstance(leaderboard, list):
                is_sorted = all(leaderboard[i]['goals'] >= leaderboard[i+1]['goals'] 
                              for i in range(len(leaderboard)-1))
                if is_sorted:
                    print(f"✅ PASS: Get Leaderboard - Retrieved sorted leaderboard with {len(leaderboard)} teams")
                    results.append(("Get Leaderboard", True))
                else:
                    print("❌ FAIL: Get Leaderboard - Not sorted by goals")
                    results.append(("Get Leaderboard", False))
            else:
                print("❌ FAIL: Get Leaderboard - Invalid response")
                results.append(("Get Leaderboard", False))
        else:
            print(f"❌ FAIL: Get Leaderboard - Status: {response.status_code}")
            results.append(("Get Leaderboard", False))
    except Exception as e:
        print(f"❌ FAIL: Get Leaderboard - Error: {e}")
        results.append(("Get Leaderboard", False))
    
    # 3. Game Session Creation
    print("\n🔍 3. Testing Game Session Creation...")
    try:
        session_data = {"team_id": "arg1", "score": 5}
        response = requests.post(f"{BASE_URL}/game/session", json=session_data, timeout=30)
        if response.status_code == 200:
            session = response.json()
            if session.get("team_id") == "arg1" and session.get("score") == 5:
                print("✅ PASS: Create Game Session - Session created successfully")
                results.append(("Create Game Session", True))
            else:
                print(f"❌ FAIL: Create Game Session - Unexpected data: {session}")
                results.append(("Create Game Session", False))
        else:
            print(f"❌ FAIL: Create Game Session - Status: {response.status_code}")
            results.append(("Create Game Session", False))
    except Exception as e:
        print(f"❌ FAIL: Create Game Session - Error: {e}")
        results.append(("Create Game Session", False))
    
    # 4. Authentication
    print("\n🔍 4. Testing Authentication...")
    
    # Correct login
    try:
        login_data = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=30)
        if response.status_code == 200:
            token_data = response.json()
            if "access_token" in token_data:
                admin_token = token_data["access_token"]
                print("✅ PASS: Admin Login - Successfully logged in")
                results.append(("Admin Login", True))
            else:
                print(f"❌ FAIL: Admin Login - No token in response: {token_data}")
                results.append(("Admin Login", False))
        else:
            print(f"❌ FAIL: Admin Login - Status: {response.status_code}")
            results.append(("Admin Login", False))
    except Exception as e:
        print(f"❌ FAIL: Admin Login - Error: {e}")
        results.append(("Admin Login", False))
    
    # Wrong credentials
    try:
        wrong_login = {"email": ADMIN_EMAIL, "password": "wrongpassword"}
        response = requests.post(f"{BASE_URL}/auth/login", json=wrong_login, timeout=30)
        if response.status_code == 401:
            print("✅ PASS: Wrong Credentials - Correctly rejected")
            results.append(("Wrong Credentials", True))
        else:
            print(f"❌ FAIL: Wrong Credentials - Expected 401, got {response.status_code}")
            results.append(("Wrong Credentials", False))
    except Exception as e:
        print(f"❌ FAIL: Wrong Credentials - Error: {e}")
        results.append(("Wrong Credentials", False))
    
    # Get user info
    if admin_token:
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=30)
            if response.status_code == 200:
                user_info = response.json()
                if user_info.get("email") == ADMIN_EMAIL:
                    print("✅ PASS: Get User Info - Retrieved successfully")
                    results.append(("Get User Info", True))
                else:
                    print(f"❌ FAIL: Get User Info - Unexpected data: {user_info}")
                    results.append(("Get User Info", False))
            else:
                print(f"❌ FAIL: Get User Info - Status: {response.status_code}")
                results.append(("Get User Info", False))
        except Exception as e:
            print(f"❌ FAIL: Get User Info - Error: {e}")
            results.append(("Get User Info", False))
    
    # 5. Admin Endpoints (if we have token)
    if admin_token:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        print("\n🔍 5. Testing Admin Country Management...")
        
        # Get countries as admin
        try:
            response = requests.get(f"{BASE_URL}/admin/countries", headers=headers, timeout=30)
            if response.status_code == 200:
                countries = response.json()
                print(f"✅ PASS: Admin Get Countries - Retrieved {len(countries)} countries")
                results.append(("Admin Get Countries", True))
            else:
                print(f"❌ FAIL: Admin Get Countries - Status: {response.status_code}")
                results.append(("Admin Get Countries", False))
        except Exception as e:
            print(f"❌ FAIL: Admin Get Countries - Error: {e}")
            results.append(("Admin Get Countries", False))
        
        # Test non-admin access
        try:
            response = requests.get(f"{BASE_URL}/admin/countries", timeout=30)  # No auth
            if response.status_code in [401, 403]:
                print(f"✅ PASS: Non-Admin Access - Correctly blocked (HTTP {response.status_code})")
                results.append(("Non-Admin Access", True))
            else:
                print(f"❌ FAIL: Non-Admin Access - Expected 401/403, got {response.status_code}")
                results.append(("Non-Admin Access", False))
        except Exception as e:
            print(f"❌ FAIL: Non-Admin Access - Error: {e}")
            results.append(("Non-Admin Access", False))
        
        print("\n🔍 6. Testing Admin Team Management...")
        
        # Get teams as admin
        try:
            response = requests.get(f"{BASE_URL}/admin/teams", headers=headers, timeout=30)
            if response.status_code == 200:
                teams = response.json()
                print(f"✅ PASS: Admin Get Teams - Retrieved {len(teams)} teams")
                results.append(("Admin Get Teams", True))
            else:
                print(f"❌ FAIL: Admin Get Teams - Status: {response.status_code}")
                results.append(("Admin Get Teams", False))
        except Exception as e:
            print(f"❌ FAIL: Admin Get Teams - Error: {e}")
            results.append(("Admin Get Teams", False))
        
        print("\n🔍 7. Testing Statistics Endpoints...")
        
        # Team stats
        try:
            response = requests.get(f"{BASE_URL}/stats/teams", headers=headers, timeout=30)
            if response.status_code == 200:
                team_stats = response.json()
                if isinstance(team_stats, list) and len(team_stats) > 0:
                    print(f"✅ PASS: Get Team Stats - Retrieved stats for {len(team_stats)} teams")
                    results.append(("Get Team Stats", True))
                else:
                    print("❌ FAIL: Get Team Stats - No stats returned")
                    results.append(("Get Team Stats", False))
            else:
                print(f"❌ FAIL: Get Team Stats - Status: {response.status_code}")
                results.append(("Get Team Stats", False))
        except Exception as e:
            print(f"❌ FAIL: Get Team Stats - Error: {e}")
            results.append(("Get Team Stats", False))
        
        # Daily stats
        try:
            response = requests.get(f"{BASE_URL}/stats/daily?days=7", headers=headers, timeout=30)
            if response.status_code == 200:
                daily_stats = response.json()
                print(f"✅ PASS: Get Daily Stats - Retrieved {len(daily_stats)} entries")
                results.append(("Get Daily Stats", True))
            else:
                print(f"❌ FAIL: Get Daily Stats - Status: {response.status_code}")
                results.append(("Get Daily Stats", False))
        except Exception as e:
            print(f"❌ FAIL: Get Daily Stats - Error: {e}")
            results.append(("Get Daily Stats", False))
        
        # Monthly stats
        try:
            response = requests.get(f"{BASE_URL}/stats/monthly?months=3", headers=headers, timeout=30)
            if response.status_code == 200:
                monthly_stats = response.json()
                print(f"✅ PASS: Get Monthly Stats - Retrieved {len(monthly_stats)} entries")
                results.append(("Get Monthly Stats", True))
            else:
                print(f"❌ FAIL: Get Monthly Stats - Status: {response.status_code}")
                results.append(("Get Monthly Stats", False))
        except Exception as e:
            print(f"❌ FAIL: Get Monthly Stats - Error: {e}")
            results.append(("Get Monthly Stats", False))
    
    # Print Summary
    print("\n" + "=" * 80)
    print("📊 FINAL TEST SUMMARY")
    print("=" * 80)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    failed = total - passed
    
    print(f"✅ PASSED: {passed}")
    print(f"❌ FAILED: {failed}")
    print(f"📈 SUCCESS RATE: {(passed/total*100):.1f}%")
    
    if failed > 0:
        print("\n🔍 FAILED TESTS:")
        for test_name, success in results:
            if not success:
                print(f"  • {test_name}")
    
    print("\n" + "=" * 80)
    return failed == 0

if __name__ == "__main__":
    success = test_all_endpoints()
    if success:
        print("🎉 All backend tests passed!")
    else:
        print("💥 Some backend tests failed!")