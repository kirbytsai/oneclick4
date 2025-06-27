# scripts/test_direct_routes.py

import asyncio
import httpx

async def test_all_possible_routes():
    """測試所有可能的路由路徑"""
    async with httpx.AsyncClient() as client:
        
        print("🔍 測試所有可能的認證路由...")
        
        test_data = {"email": "test@test.com", "password": "test"}
        
        possible_routes = [
            "/auth/login",
            "/api/v1/auth/login", 
            "/auth/auth/login",
            "/api/v1/auth/auth/login",
            "/login",
            "/api/login",
            "/v1/auth/login"
        ]
        
        for route in possible_routes:
            try:
                response = await client.post(f"http://localhost:8000{route}", json=test_data)
                print(f"  {route:<30} → {response.status_code}")
                if response.status_code != 404:
                    print(f"    回應: {response.text[:100]}")
            except Exception as e:
                print(f"  {route:<30} → 錯誤: {e}")
        
        print("\n🔍 測試註冊路由...")
        register_data = {
            "email": "test2@test.com", 
            "username": "test2",
            "password": "test123456",
            "role": "buyer"
        }
        
        for route in [r.replace("login", "register") for r in possible_routes]:
            try:
                response = await client.post(f"http://localhost:8000{route}", json=register_data)
                print(f"  {route:<30} → {response.status_code}")
                if response.status_code != 404:
                    print(f"    回應: {response.text[:100]}")
            except Exception as e:
                print(f"  {route:<30} → 錯誤: {e}")

if __name__ == "__main__":
    asyncio.run(test_all_possible_routes())
    