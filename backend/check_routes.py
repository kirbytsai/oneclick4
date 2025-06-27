# check_routes.py (放在 backend 目錄下執行)

from app.main import app

print("🔍 檢查已註冊的路由...")

# 列出所有路由
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        methods = list(route.methods) if route.methods else []
        print(f"  {methods} {route.path}")
    elif hasattr(route, 'path'):
        print(f"  {route.path}")

print("\n🔍 檢查 API 路由器...")

# 檢查 api router
from app.api.v1.router import api_router

print(f"API 路由器有 {len(api_router.routes)} 個路由:")
for route in api_router.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        methods = list(route.methods) if route.methods else []
        print(f"  {methods} {route.path}")
    elif hasattr(route, 'path'):
        print(f"  {route.path}")

# 檢查各個域的路由器
print("\n🔍 檢查各域路由器...")

try:
    from app.domains.auth.api import router as auth_router
    print(f"Auth 路由器有 {len(auth_router.routes)} 個路由")
    for route in auth_router.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            methods = list(route.methods) if route.methods else []
            print(f"  {methods} {route.path}")
except Exception as e:
    print(f"❌ Auth 路由器載入失敗: {e}")

try:
    from app.domains.user.api import router as user_router
    print(f"User 路由器有 {len(user_router.routes)} 個路由")
except Exception as e:
    print(f"❌ User 路由器載入失敗: {e}")

try:
    from app.domains.proposal.api import router as proposal_router
    print(f"Proposal 路由器有 {len(proposal_router.routes)} 個路由")
except Exception as e:
    print(f"❌ Proposal 路由器載入失敗: {e}")