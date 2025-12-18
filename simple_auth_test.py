#!/usr/bin/env python3
import requests
import json

BASE_URL = "https://soccer-challenge-55.preview.emergentagent.com/api"

def test_wrong_credentials():
    print("Testing wrong credentials...")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "admin@minicup.com", "password": "wrongpassword"},
            timeout=30
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 401
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_non_admin_access():
    print("\nTesting non-admin access...")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/countries",
            timeout=30
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code in [401, 403]
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    result1 = test_wrong_credentials()
    result2 = test_non_admin_access()
    
    print(f"\nResults:")
    print(f"Wrong credentials test: {'PASS' if result1 else 'FAIL'}")
    print(f"Non-admin access test: {'PASS' if result2 else 'FAIL'}")