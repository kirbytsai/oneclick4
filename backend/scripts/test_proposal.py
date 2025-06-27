# scripts/test_proposal.py

import asyncio
import httpx

API_BASE = "http://localhost:8000"

# 測試帳號
admin_data = {"email": "admin@ma-platform.com", "password": "admin123456"}
seller_data = {"email": "seller@test.com", "password": "password123"}

async def test_proposal_lifecycle():
    """測試提案完整生命週期"""
    async with httpx.AsyncClient() as client:
        
        print("🧪 開始測試 Proposal 生命週期...")
        
        # 1. 登入賣方帳號
        print("\n📝 步驟 1: 賣方登入")
        login_response = await client.post(f"{API_BASE}/auth/login", json=seller_data)
        if login_response.status_code != 200:
            print(f"❌ 賣方登入失敗: {login_response.text}")
            return
        
        seller_token = login_response.json()["access_token"]
        seller_headers = {"Authorization": f"Bearer {seller_token}"}
        print("✅ 賣方登入成功")
        
        # 2. 建立提案
        print("\n📝 步驟 2: 建立提案")
        proposal_data = {
            "title": "科技公司併購案",
            "brief_content": "一間成立3年的AI新創公司，專注於電商推薦系統，月活躍用戶50萬。",
            "detailed_content": "詳細內容：公司成立於2021年，團隊30人，年營收2000萬，主要客戶包括知名電商平台。技術核心為機器學習推薦算法，已申請多項專利。"
        }
        
        create_response = await client.post(
            f"{API_BASE}/proposals/", 
            json=proposal_data, 
            headers=seller_headers
        )
        
        if create_response.status_code != 201:
            print(f"❌ 建立提案失敗: {create_response.text}")
            return
        
        proposal = create_response.json()
        proposal_id = proposal["id"]
        print(f"✅ 提案建立成功，ID: {proposal_id}")
        print(f"   狀態: {proposal['status']}")
        
        # 3. 更新提案
        print("\n📝 步驟 3: 更新提案")
        update_data = {
            "title": "科技公司併購案 (已更新)",
            "brief_content": "一間成立3年的AI新創公司，專注於電商推薦系統，月活躍用戶100萬。"
        }
        
        update_response = await client.put(
            f"{API_BASE}/proposals/{proposal_id}", 
            json=update_data, 
            headers=seller_headers
        )
        
        if update_response.status_code != 200:
            print(f"❌ 更新提案失敗: {update_response.text}")
            return
        
        print("✅ 提案更新成功")
        
        # 4. 查看我的提案列表
        print("\n📝 步驟 4: 查看我的提案列表")
        my_proposals_response = await client.get(
            f"{API_BASE}/proposals/my", 
            headers=seller_headers
        )
        
        if my_proposals_response.status_code != 200:
            print(f"❌ 獲取提案列表失敗: {my_proposals_response.text}")
            return
        
        my_proposals = my_proposals_response.json()
        print(f"✅ 獲取到 {len(my_proposals)} 個提案")
        
        # 5. 提交審核
        print("\n📝 步驟 5: 提交審核")
        submit_response = await client.post(
            f"{API_BASE}/proposals/{proposal_id}/submit", 
            headers=seller_headers
        )
        
        if submit_response.status_code != 200:
            print(f"❌ 提交審核失敗: {submit_response.text}")
            return
        
        submitted_proposal = submit_response.json()
        print(f"✅ 提案提交審核成功，狀態: {submitted_proposal['status']}")
        
        # 6. 嘗試編輯審核中的提案 (應該失敗)
        print("\n📝 步驟 6: 嘗試編輯審核中的提案")
        edit_response = await client.put(
            f"{API_BASE}/proposals/{proposal_id}", 
            json={"title": "不應該能編輯"}, 
            headers=seller_headers
        )
        
        if edit_response.status_code == 400:
            print("✅ 審核中的提案無法編輯 (符合預期)")
        else:
            print(f"❌ 審核中的提案居然可以編輯: {edit_response.text}")
        
        # 7. 管理員登入
        print("\n📝 步驟 7: 管理員登入")
        admin_login_response = await client.post(f"{API_BASE}/auth/login", json=admin_data)
        if admin_login_response.status_code != 200:
            print(f"❌ 管理員登入失敗: {admin_login_response.text}")
            return
        
        admin_token = admin_login_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("✅ 管理員登入成功")
        
        # 8. 管理員查看所有提案
        print("\n📝 步驟 8: 管理員查看所有提案")
        all_proposals_response = await client.get(
            f"{API_BASE}/proposals/", 
            headers=admin_headers
        )
        
        if all_proposals_response.status_code != 200:
            print(f"❌ 獲取所有提案失敗: {all_proposals_response.text}")
            return
        
        all_proposals = all_proposals_response.json()
        print(f"✅ 管理員獲取到 {len(all_proposals)} 個提案")
        
        # 9. 管理員審核通過提案
        print("\n📝 步驟 9: 管理員審核通過提案")
        review_data = {"approved": True}
        
        review_response = await client.post(
            f"{API_BASE}/proposals/{proposal_id}/review", 
            json=review_data, 
            headers=admin_headers
        )
        
        if review_response.status_code != 200:
            print(f"❌ 審核提案失敗: {review_response.text}")
            return
        
        reviewed_proposal = review_response.json()
        print(f"✅ 提案審核通過，狀態: {reviewed_proposal['status']}")
        
        # 10. 最終檢查提案狀態
        print("\n📝 步驟 10: 最終檢查提案狀態")
        final_check_response = await client.get(
            f"{API_BASE}/proposals/{proposal_id}", 
            headers=seller_headers
        )
        
        if final_check_response.status_code != 200:
            print(f"❌ 獲取最終提案狀態失敗: {final_check_response.text}")
            return
        
        final_proposal = final_check_response.json()
        print(f"✅ 最終提案狀態: {final_proposal['status']}")
        print(f"   審核時間: {final_proposal['reviewed_at']}")
        print(f"   審核者: {final_proposal['reviewed_by']}")
        
        print("\n🎉 Proposal 生命週期測試完成！")

async def test_rejection_flow():
    """測試拒絕流程"""
    async with httpx.AsyncClient() as client:
        
        print("\n🧪 開始測試拒絕流程...")
        
        # 1. 賣方登入並建立提案
        login_response = await client.post(f"{API_BASE}/auth/login", json=seller_data)
        seller_token = login_response.json()["access_token"]
        seller_headers = {"Authorization": f"Bearer {seller_token}"}
        
        proposal_data = {
            "title": "將被拒絕的提案",
            "brief_content": "這個提案會被拒絕",
            "detailed_content": "詳細內容"
        }
        
        create_response = await client.post(
            f"{API_BASE}/proposals/", 
            json=proposal_data, 
            headers=seller_headers
        )
        
        proposal_id = create_response.json()["id"]
        
        # 2. 提交審核
        await client.post(f"{API_BASE}/proposals/{proposal_id}/submit", headers=seller_headers)
        
        # 3. 管理員登入並審核拒絕
        admin_login_response = await client.post(f"{API_BASE}/auth/login", json=admin_data)
        admin_token = admin_login_response.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        review_data = {
            "approved": False, 
            "reject_reason": "內容不夠詳細，請補充更多資訊"
        }
        
        review_response = await client.post(
            f"{API_BASE}/proposals/{proposal_id}/review", 
            json=review_data, 
            headers=admin_headers
        )
        
        rejected_proposal = review_response.json()
        print(f"✅ 提案被拒絕，狀態: {rejected_proposal['status']}")
        print(f"   拒絕原因: {rejected_proposal['reject_reason']}")
        
        # 4. 賣方重新提交
        resubmit_response = await client.post(
            f"{API_BASE}/proposals/{proposal_id}/resubmit", 
            headers=seller_headers
        )
        
        resubmitted_proposal = resubmit_response.json()
        print(f"✅ 提案重新提交，狀態: {resubmitted_proposal['status']}")
        
        print("🎉 拒絕流程測試完成！")

async def main():
    """主測試函數"""
    try:
        await test_proposal_lifecycle()
        await test_rejection_flow()
        print("\n🎯 所有測試完成！")
    except Exception as e:
        print(f"\n❌ 測試過程中發生錯誤: {e}")

if __name__ == "__main__":
    asyncio.run(main())