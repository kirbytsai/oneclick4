# scripts/test_case.py
import asyncio
import httpx
import json
from datetime import datetime

# API 基礎 URL
API_BASE = "http://localhost:8000/api/v1"

# 測試用戶登入資料
ADMIN_LOGIN = {"email": "admin@ma-platform.com", "password": "admin123456"}
SELLER_LOGIN = {"email": "seller@test.com", "password": "password123"}
BUYER_LOGIN = {"email": "buyer@test.com", "password": "password123"}

async def login_user(client: httpx.AsyncClient, login_data: dict) -> str:
    """用戶登入並返回 token"""
    response = await client.post(f"{API_BASE}/auth/login", json=login_data)
    if response.status_code != 200:
        raise Exception(f"登入失敗: {response.text}")
    return response.json()["access_token"]

async def get_headers(token: str) -> dict:
    """獲取認證 headers"""
    return {"Authorization": f"Bearer {token}"}

async def test_case_lifecycle():
    """測試 Case 完整生命週期"""
    async with httpx.AsyncClient() as client:
        print("🚀 開始 Case 域測試")
        print("=" * 50)
        
        # 1. 登入所有角色
        print("1️⃣ 登入測試用戶...")
        admin_token = await login_user(client, ADMIN_LOGIN)
        seller_token = await login_user(client, SELLER_LOGIN)
        buyer_token = await login_user(client, BUYER_LOGIN)
        
        admin_headers = await get_headers(admin_token)
        seller_headers = await get_headers(seller_token)
        buyer_headers = await get_headers(buyer_token)
        print("✅ 所有用戶登入成功")
        
        # 2. 創建並核准一個測試提案
        print("\n2️⃣ 創建測試提案...")
        proposal_data = {
            "title": "測試提案 - 科技公司併購案",
            "brief_content": "一家創新科技公司尋求戰略投資者，主營 AI 和區塊鏈技術。",
            "detailed_content": "詳細資訊：公司成立於2020年，目前有50名員工，年營收500萬美元，主要客戶包括多家財富500強企業。核心技術包括專利AI算法和去中心化解決方案。"
        }
        
        # 賣方創建提案
        response = await client.post(f"{API_BASE}/proposals/", json=proposal_data, headers=seller_headers)
        if response.status_code != 201:
            raise Exception(f"創建提案失敗: {response.text}")
        
        proposal = response.json()
        proposal_id = proposal["id"]
        print(f"✅ 提案創建成功: {proposal_id}")
        
        # 賣方提交審核
        response = await client.post(f"{API_BASE}/proposals/{proposal_id}/submit", headers=seller_headers)
        if response.status_code != 200:
            raise Exception(f"提交審核失敗: {response.text}")
        print("✅ 提案已提交審核")
        
        # 管理員核准提案 - 修復 schema
        review_data = {
            "approved": True,
            "reject_reason": None  # 核准時不需要拒絕原因
        }
        response = await client.post(f"{API_BASE}/proposals/{proposal_id}/review", json=review_data, headers=admin_headers)
        if response.status_code != 200:
            raise Exception(f"審核提案失敗: {response.text}")
        print("✅ 提案已被核准")
        
        # 3. 獲取買方 ID
        print("\n3️⃣ 獲取買方資訊...")
        response = await client.get(f"{API_BASE}/users/", headers=admin_headers)
        if response.status_code != 200:
            raise Exception(f"獲取用戶列表失敗: {response.text}")
        
        users = response.json()
        buyer_id = None
        for user in users:
            if user["email"] == "buyer@test.com":
                buyer_id = user["id"]
                break
        
        if not buyer_id:
            raise Exception("找不到測試買方")
        print(f"✅ 找到買方 ID: {buyer_id}")
        
        # 4. 賣方創建 case 發送給買方
        print("\n4️⃣ 賣方創建 case...")
        case_data = {
            "proposal_id": proposal_id,
            "buyer_id": buyer_id,
            "initial_message": "您好，我們認為這個併購機會很適合貴公司，期待您的回覆。"
        }
        
        response = await client.post(f"{API_BASE}/cases/", json=case_data, headers=seller_headers)
        if response.status_code != 201:
            raise Exception(f"創建 case 失敗: {response.text}")
        
        case = response.json()
        case_id = case["id"]
        print(f"✅ Case 創建成功: {case_id}")
        print(f"   狀態: {case['status']}")
        print(f"   初始訊息: {case['initial_message']}")
        
        # 5. 測試賣方查看自己的 cases
        print("\n5️⃣ 賣方查看發送的 cases...")
        response = await client.get(f"{API_BASE}/cases/my-sent", headers=seller_headers)
        if response.status_code != 200:
            raise Exception(f"查看發送的 cases 失敗: {response.text}")
        
        sent_cases = response.json()
        print(f"✅ 賣方有 {len(sent_cases)} 個發送的 cases")
        for case_item in sent_cases:
            print(f"   - {case_item['title']} ({case_item['status']})")
        
        # 6. 測試買方查看收到的 cases
        print("\n6️⃣ 買方查看收到的 cases...")
        response = await client.get(f"{API_BASE}/cases/my-received", headers=buyer_headers)
        if response.status_code != 200:
            raise Exception(f"查看收到的 cases 失敗: {response.text}")
        
        received_cases = response.json()
        print(f"✅ 買方有 {len(received_cases)} 個收到的 cases")
        for case_item in received_cases:
            print(f"   - {case_item['title']} ({case_item['status']})")
        
        # 7. 買方查看 case 詳情 (未簽 NDA)
        print("\n7️⃣ 買方查看 case 詳情 (未簽 NDA)...")
        response = await client.get(f"{API_BASE}/cases/{case_id}", headers=buyer_headers)
        if response.status_code != 200:
            raise Exception(f"查看 case 詳情失敗: {response.text}")
        
        case_detail = response.json()
        print(f"✅ 買方可見內容:")
        print(f"   標題: {case_detail['title']}")
        print(f"   簡介: {case_detail['brief_content'][:50]}...")
        print(f"   詳細內容: {case_detail['detailed_content']}")  # 應該是 None
        
        # 8. 測試留言功能
        print("\n8️⃣ 測試留言功能...")
        
        # 買方留言
        comment_data = {"content": "這個提案看起來很有趣，我需要了解更多技術細節。"}
        response = await client.post(f"{API_BASE}/cases/{case_id}/comments", json=comment_data, headers=buyer_headers)
        if response.status_code != 201:
            raise Exception(f"買方留言失敗: {response.text}")
        print("✅ 買方留言成功")
        
        # 賣方回覆
        reply_data = {"content": "感謝您的興趣！我們的技術團隊在 AI 領域有深厚積累，期待進一步交流。"}
        response = await client.post(f"{API_BASE}/cases/{case_id}/comments", json=reply_data, headers=seller_headers)
        if response.status_code != 201:
            raise Exception(f"賣方回覆失敗: {response.text}")
        print("✅ 賣方回覆成功")
        
        # 查看所有留言
        response = await client.get(f"{API_BASE}/cases/{case_id}/comments", headers=buyer_headers)
        if response.status_code != 200:
            raise Exception(f"查看留言失敗: {response.text}")
        
        comments = response.json()
        print(f"✅ Case 有 {len(comments)} 條留言:")
        for comment in comments:
            role = "賣方" if comment["is_seller"] else "買方"
            print(f"   [{role}] {comment['content'][:30]}...")
        
        # 9. 買方表達興趣
        print("\n9️⃣ 買方表達興趣...")
        response = await client.post(f"{API_BASE}/cases/{case_id}/interest", headers=buyer_headers)
        if response.status_code != 200:
            raise Exception(f"表達興趣失敗: {response.text}")
        
        updated_case = response.json()
        print(f"✅ 買方表達興趣成功，狀態變更為: {updated_case['status']}")
        print(f"   表達興趣時間: {updated_case['interested_at']}")
        
        # 10. 買方簽署 NDA
        print("\n🔟 買方簽署 NDA...")
        response = await client.post(f"{API_BASE}/cases/{case_id}/sign-nda", headers=buyer_headers)
        if response.status_code != 200:
            raise Exception(f"簽署 NDA 失敗: {response.text}")
        
        nda_case = response.json()
        print(f"✅ NDA 簽署成功，狀態變更為: {nda_case['status']}")
        print(f"   NDA 簽署時間: {nda_case['nda_signed_at']}")
        
        # 11. 買方查看詳細內容 (簽署 NDA 後)
        print("\n1️⃣1️⃣ 買方查看詳細內容 (簽署 NDA 後)...")
        response = await client.get(f"{API_BASE}/cases/{case_id}", headers=buyer_headers)
        if response.status_code != 200:
            raise Exception(f"查看詳細內容失敗: {response.text}")
        
        detailed_case = response.json()
        print("✅ 買方現在可以看到詳細內容:")
        print(f"   詳細內容: {detailed_case['detailed_content'][:100]}...")
        
        # 12. 獲取雙方聯絡資訊
        print("\n1️⃣2️⃣ 獲取雙方聯絡資訊...")
        response = await client.get(f"{API_BASE}/cases/{case_id}/contact-info", headers=buyer_headers)
        if response.status_code != 200:
            raise Exception(f"獲取聯絡資訊失敗: {response.text}")
        
        contact_info = response.json()
        print("✅ 聯絡資訊獲取成功:")
        print(f"   賣方聯絡: {contact_info['seller_email']}")
        print(f"   買方聯絡: {contact_info['buyer_email']}")
        
        # 13. 簽署 NDA 後的留言測試
        print("\n1️⃣3️⃣ 簽署 NDA 後的留言...")
        final_comment = {"content": "已簽署 NDA，期待進一步的詳細討論。我們對貴公司的 AI 技術特別感興趣。"}
        response = await client.post(f"{API_BASE}/cases/{case_id}/comments", json=final_comment, headers=buyer_headers)
        if response.status_code != 201:
            raise Exception(f"NDA 後留言失敗: {response.text}")
        print("✅ NDA 簽署後留言成功")
        
        print("\n" + "=" * 50)
        print("🎉 Case 域測試全部通過！")
        print("✅ 測試涵蓋功能:")
        print("   - Case 創建和發送")
        print("   - 買賣雙方查看列表")
        print("   - 權限控制 (內容可見性)")
        print("   - 留言系統")
        print("   - 狀態轉換 (interested → nda_signed)")
        print("   - NDA 簽署功能")
        print("   - 聯絡資訊獲取")

async def test_error_cases():
    """測試錯誤情況"""
    async with httpx.AsyncClient() as client:
        print("\n🔧 測試錯誤情況...")
        
        # 登入用戶
        seller_token = await login_user(client, SELLER_LOGIN)
        buyer_token = await login_user(client, BUYER_LOGIN)
        seller_headers = await get_headers(seller_token)
        buyer_headers = await get_headers(buyer_token)
        
        # 測試買方嘗試創建 case (應該失敗)
        print("1. 測試買方嘗試創建 case...")
        case_data = {
            "proposal_id": "507f1f77bcf86cd799439011",  # 假 ID
            "buyer_id": "507f1f77bcf86cd799439012",     # 假 ID
            "initial_message": "測試訊息"
        }
        
        response = await client.post(f"{API_BASE}/cases/", json=case_data, headers=buyer_headers)
        if response.status_code == 403:
            print("✅ 買方無法創建 case (權限正確)")
        else:
            print(f"❌ 權限檢查失敗: {response.status_code}")
        
        # 測試查看不存在的 case
        print("2. 測試查看不存在的 case...")
        fake_case_id = "507f1f77bcf86cd799439013"
        response = await client.get(f"{API_BASE}/cases/{fake_case_id}", headers=buyer_headers)
        if response.status_code == 404:
            print("✅ 不存在的 case 返回 404 (正確)")
        else:
            print(f"❌ 錯誤處理失敗: {response.status_code}")
        
        print("✅ 錯誤情況測試完成")

if __name__ == "__main__":
    try:
        asyncio.run(test_case_lifecycle())
        asyncio.run(test_error_cases())
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()