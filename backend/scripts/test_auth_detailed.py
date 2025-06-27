# scripts/test_auth_detailed.py

import asyncio
import httpx
import sys
import os

# 添加 backend 目錄到 Python 路徑
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

API_BASE = "http://localhost:8000"

async def test_auth_detailed():
    """詳細測試認證功能"""
    async with httpx.AsyncClient() as client:
        
        print("🧪 開始詳細認證測試...")
        
        # 1. 測試現有用戶登入
        print("\n📝 步驟 1: 測試現有用戶登入")
        
        admin_data = {"email": "admin@ma-platform.com", "password": "admin123456"}
        
        try:
            response = await client.post(f"{API_BASE}/auth/login", json=admin_data)
            print(f"狀態碼: {response.status_code}")
            print(f"回應內容: {response.text}")
            
            if response.status_code == 200:
                print("✅ 管理員登入成功！")
                token_data = response.json()
                print(f"Access Token: {token_data.get('access_token', 'N/A')[:50]}...")
                
                # 測試使用 token
                headers = {"Authorization": f"Bearer {token_data['access_token']}"}
                me_response = await client.get(f"{API_BASE}/auth/me", headers=headers)
                print(f"獲取用戶資訊: {me_response.status_code}")
                if me_response.status_code == 200:
                    user_info = me_response.json()
                    print(f"用戶資訊: {user_info.get('email')} - {user_info.get('role')}")
                
            else:
                print(f"❌ 管理員登入失敗")
                
        except Exception as e:
            print(f"❌ 登入測試失敗: {e}")
        
        # 2. 測試賣方用戶登入
        print("\n📝 步驟 2: 測試賣方用戶登入")
        
        seller_data = {"email": "seller@test.com", "password": "password123"}
        
        try:
            response = await client.post(f"{API_BASE}/auth/login", json=seller_data)
            print(f"狀態碼: {response.status_code}")
            print(f"回應內容: {response.text}")
            
            if response.status_code == 200:
                print("✅ 賣方登入成功！")
                token_data = response.json()
                
                # 測試提案功能
                headers = {"Authorization": f"Bearer {token_data['access_token']}"}
                proposals_response = await client.get(f"{API_BASE}/proposals/my", headers=headers)
                print(f"獲取提案列表: {proposals_response.status_code}")
                
            else:
                print(f"❌ 賣方登入失敗")
                
        except Exception as e:
            print(f"❌ 賣方登入測試失敗: {e}")
        
        # 3. 測試註冊功能
        print("\n📝 步驟 3: 測試註冊功能")
        
        new_user_data = {
            "email": "newuser@test.com",
            "username": "newuser",
            "password": "password123",
            "role": "buyer",
            "company_name": "Test Company"
        }
        
        try:
            response = await client.post(f"{API_BASE}/auth/register", json=new_user_data)
            print(f"狀態碼: {response.status_code}")
            print(f"回應內容: {response.text}")
            
            if response.status_code == 201:
                print("✅ 用戶註冊成功！")
                
                # 嘗試用新用戶登入
                login_data = {"email": "newuser@test.com", "password": "password123"}
                login_response = await client.post(f"{API_BASE}/auth/login", json=login_data)
                print(f"新用戶登入: {login_response.status_code}")
                
            else:
                print(f"❌ 用戶註冊失敗")
                
        except Exception as e:
            print(f"❌ 註冊測試失敗: {e}")

if __name__ == "__main__":
    asyncio.run(test_auth_detailed())