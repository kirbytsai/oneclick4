# scripts/debug_test.py

import asyncio
import httpx
import json

API_BASE = "http://localhost:8000"

async def debug_system():
    """除錯系統狀態"""
    async with httpx.AsyncClient() as client:
        
        print("🔍 開始系統除錯...")
        
        # 1. 檢查服務器是否運行
        print("\n📝 步驟 1: 檢查服務器狀態")
        try:
            response = await client.get("http://localhost:8000/")
            print(f"✅ 服務器運行正常，狀態碼: {response.status_code}")
        except Exception as e:
            print(f"❌ 服務器連接失敗: {e}")
            return
        
        # 2. 檢查 API 文檔是否可訪問
        print("\n📝 步驟 2: 檢查 API 文檔")
        try:
            response = await client.get("http://localhost:8000/docs")
            print(f"✅ API 文檔可訪問，狀態碼: {response.status_code}")
        except Exception as e:
            print(f"❌ API 文檔訪問失敗: {e}")
        
        # 3. 檢查 auth 路由是否存在
        print("\n📝 步驟 3: 檢查認證路由")
        try:
            # 嘗試不正確的登入，看看路由是否存在
            test_login = {"email": "test@test.com", "password": "wrong"}
            response = await client.post(f"{API_BASE}/auth/login", json=test_login)
            print(f"✅ 認證路由存在，狀態碼: {response.status_code}")
            print(f"   回應內容: {response.text[:200]}")
        except Exception as e:
            print(f"❌ 認證路由測試失敗: {e}")
        
        # 4. 嘗試建立管理員帳號
        print("\n📝 步驟 4: 檢查是否需要建立管理員帳號")
        admin_data = {"email": "admin@ma-platform.com", "password": "admin123456"}
        
        try:
            login_response = await client.post(f"{API_BASE}/auth/login", json=admin_data)
            if login_response.status_code == 200:
                print("✅ 管理員帳號已存在且可登入")
            else:
                print(f"❌ 管理員登入失敗: {login_response.status_code}")
                print(f"   回應: {login_response.text}")
                
                # 嘗試註冊管理員
                print("   嘗試註冊管理員...")
                register_data = {
                    "email": "admin@ma-platform.com",
                    "password": "admin123456",
                    "full_name": "Admin User",
                    "role": "admin"
                }
                
                register_response = await client.post(f"{API_BASE}/auth/register", json=register_data)
                print(f"   註冊回應: {register_response.status_code} - {register_response.text[:200]}")
                
        except Exception as e:
            print(f"❌ 管理員檢查失敗: {e}")
        
        # 5. 檢查測試用戶
        print("\n📝 步驟 5: 檢查測試賣方帳號")
        seller_data = {"email": "seller@test.com", "password": "password123"}
        
        try:
            login_response = await client.post(f"{API_BASE}/auth/login", json=seller_data)
            if login_response.status_code == 200:
                print("✅ 測試賣方帳號已存在且可登入")
            else:
                print(f"❌ 測試賣方登入失敗: {login_response.status_code}")
                print(f"   回應: {login_response.text}")
                
                # 嘗試註冊測試賣方
                print("   嘗試註冊測試賣方...")
                register_data = {
                    "email": "seller@test.com",
                    "password": "password123",
                    "full_name": "Test Seller",
                    "role": "seller"
                }
                
                register_response = await client.post(f"{API_BASE}/auth/register", json=register_data)
                print(f"   註冊回應: {register_response.status_code} - {register_response.text[:200]}")
                
        except Exception as e:
            print(f"❌ 測試賣方檢查失敗: {e}")
        
        # 6. 檢查 proposal 路由是否註冊
        print("\n📝 步驟 6: 檢查 Proposal 路由")
        try:
            # 先登入取得 token（如果可以的話）
            login_response = await client.post(f"{API_BASE}/auth/login", json=seller_data)
            if login_response.status_code == 200:
                token = login_response.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}
                
                # 測試 proposal 路由
                response = await client.get(f"{API_BASE}/proposals/my", headers=headers)
                print(f"✅ Proposal 路由存在，狀態碼: {response.status_code}")
            else:
                print("❌ 無法取得 token，跳過 Proposal 路由測試")
                
        except Exception as e:
            print(f"❌ Proposal 路由測試失敗: {e}")

async def main():
    """主函數"""
    await debug_system()
    print("\n🎯 除錯完成！請根據上述結果修正問題。")

if __name__ == "__main__":
    asyncio.run(main())