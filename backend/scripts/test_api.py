"""
簡單的 API 測試腳本
"""
import asyncio
import httpx
import json


API_BASE = "http://localhost:8000/api/v1"


async def test_auth_flow():
    """測試完整的認證流程"""
    async with httpx.AsyncClient() as client:
        
        print("🚀 開始測試 M&A Platform API")
        print("=" * 50)
        
        # 1. 測試健康檢查
        print("1. 測試健康檢查...")
        response = await client.get("http://localhost:8000/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
        
        # 2. 註冊賣方用戶
        print("2. 註冊賣方用戶...")
        seller_data = {
            "email": "seller@test.com",
            "username": "test_seller",
            "password": "password123",
            "role": "seller",
            "company_name": "Test Seller Company",
            "contact_person": "John Seller"
        }
        
        response = await client.post(f"{API_BASE}/auth/register", json=seller_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ 賣方註冊成功")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ 註冊失敗: {response.text}")
        print()
        
        # 3. 註冊買方用戶
        print("3. 註冊買方用戶...")
        buyer_data = {
            "email": "buyer@test.com",
            "username": "test_buyer",
            "password": "password123",
            "role": "buyer",
            "company_name": "Test Buyer Company",
            "contact_person": "Jane Buyer"
        }
        
        response = await client.post(f"{API_BASE}/auth/register", json=buyer_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ 買方註冊成功")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ 註冊失敗: {response.text}")
        print()
        
        # 4. 賣方登入
        print("4. 賣方登入...")
        login_data = {
            "email": "seller@test.com",
            "password": "password123"
        }
        
        response = await client.post(f"{API_BASE}/auth/login", json=login_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            tokens = response.json()
            seller_token = tokens["access_token"]
            print("✅ 賣方登入成功")
            print(f"Access Token: {seller_token[:50]}...")
        else:
            print(f"❌ 登入失敗: {response.text}")
            return
        print()
        
        # 5. 測試受保護的端點
        print("5. 測試受保護的端點...")
        headers = {"Authorization": f"Bearer {seller_token}"}
        
        response = await client.get(f"{API_BASE}/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ 獲取用戶資訊成功")
            print(f"User Info: {response.json()}")
        else:
            print(f"❌ 獲取用戶資訊失敗: {response.text}")
        print()
        
        # 6. 賣方查看買方列表
        print("6. 賣方查看買方列表...")
        response = await client.get(f"{API_BASE}/users/buyers", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            buyers = response.json()
            print("✅ 獲取買方列表成功")
            print(f"買方數量: {len(buyers)}")
            if buyers:
                print(f"第一個買方: {buyers[0]}")
        else:
            print(f"❌ 獲取買方列表失敗: {response.text}")
        print()
        
        # 7. 測試 token 刷新
        print("7. 測試 token 刷新...")
        refresh_data = {
            "refresh_token": tokens["refresh_token"]
        }
        
        response = await client.post(f"{API_BASE}/auth/refresh", json=refresh_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            new_tokens = response.json()
            print("✅ Token 刷新成功")
            print(f"New Access Token: {new_tokens['access_token'][:50]}...")
        else:
            print(f"❌ Token 刷新失敗: {response.text}")
        print()
        
        print("🎉 測試完成！")


if __name__ == "__main__":
    print("請確保 API 服務器正在運行 (python -m app.main)")
    print("開始測試...")
    asyncio.run(test_auth_flow())