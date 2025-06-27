# scripts/check_api_docs.py

import asyncio
import httpx
import json

async def check_api_docs():
    """檢查 API 文檔中的實際端點"""
    async with httpx.AsyncClient() as client:
        
        print("🔍 檢查 OpenAPI 文檔...")
        
        try:
            # 獲取 OpenAPI 規格
            response = await client.get("http://localhost:8000/openapi.json")
            if response.status_code == 200:
                api_spec = response.json()
                
                print("📋 可用的 API 端點：")
                for path, methods in api_spec.get("paths", {}).items():
                    for method, details in methods.items():
                        if method.upper() in ['GET', 'POST', 'PUT', 'DELETE']:
                            tags = details.get('tags', [])
                            summary = details.get('summary', '')
                            print(f"  {method.upper():<6} {path:<40} {summary}")
                
                # 檢查認證相關端點
                print("\n🔍 搜尋認證相關端點：")
                for path, methods in api_spec.get("paths", {}).items():
                    if 'auth' in path.lower() or 'login' in path.lower():
                        for method in methods:
                            if method.upper() in ['GET', 'POST', 'PUT', 'DELETE']:
                                print(f"  找到: {method.upper()} {path}")
                
            else:
                print(f"❌ 無法獲取 OpenAPI 文檔: {response.status_code}")
                
        except Exception as e:
            print(f"❌ 檢查 API 文檔失敗: {e}")

if __name__ == "__main__":
    asyncio.run(check_api_docs())