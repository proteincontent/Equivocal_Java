import requests
import json
import time
import sys

def test_login():
    url = "http://localhost:8080/api/auth/login"
    headers = {"Content-Type": "application/json"}
    payload = {
        "email": "test@example.com",
        "password": "password123",
        "action": "login"
    }
    
    print(f"Testing connectivity to {url}...")
    start_time = time.time()
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Time: {duration:.4f} seconds")
        print(f"Response Body: {response.text[:200]}...") # Print first 200 chars
        
        if response.status_code == 200:
            print("SUCCESS: Endpoint is reachable and responding correctly.")
        elif response.status_code == 400:
             print("SUCCESS: Endpoint reached (Bad Request is expected for invalid creds).")
        else:
            print(f"WARNING: Unexpected status code {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("ERROR: Request timed out after 10 seconds.")
    except requests.exceptions.ConnectionError:
        print("ERROR: Connection refused. Is the server running on localhost:8080?")
    except Exception as e:
        print(f"ERROR: An unexpected error occurred: {e}")

if __name__ == "__main__":
    test_login()