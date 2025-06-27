 
# M&A Platform MVP

## 🚀 快速開始

### 1. 安裝依賴
```bash
pip install -r requirements.txt
```

### 2. 設定環境變數
```bash
cp .env.example .env
# 編輯 .env 檔案，設定 MongoDB 連線等資訊
```

### 3. 啟動 MongoDB
確保 MongoDB 正在運行 (本地或 MongoDB Atlas)

### 4. 建立管理員帳號
```bash
python scripts/create_admin.py
```

### 5. 啟動 API 服務器
```bash
python -m app.main
```

服務器將在 http://localhost:8000 啟動

### 6. 查看 API 文檔
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 7. 測試 API
```bash
python scripts/test_api.py
```

## 📋 已完成功能

### User + Auth 模組
- ✅ 用戶註冊 (管理員/買方/賣方)
- ✅ 用戶登入/登出
- ✅ JWT Token 認證 (Access + Refresh Token)
- ✅ 用戶資料管理
- ✅ 角色權限控制
- ✅ 買方列表查詢 (供賣方發送 case 使用)

### API 端點
```
POST /api/v1/auth/register     # 用戶註冊
POST /api/v1/auth/login        # 用戶登入
POST /api/v1/auth/refresh      # 刷新 token
POST /api/v1/auth/logout       # 用戶登出
GET  /api/v1/auth/me           # 獲取當前用戶資訊

GET  /api/v1/users/me          # 獲取自己的資料
PUT  /api/v1/users/me          # 更新自己的資料
GET  /api/v1/users/buyers      # 獲取買方列表
GET  /api/v1/users/profile/{id} # 獲取用戶完整檔案
GET  /api/v1/users/            # 獲取所有用戶 (管理員)
DELETE /api/v1/users/{id}      # 停用用戶 (管理員)
```

## 🏗️ 模組化架構

```
app/
├── core/           # 基礎設施 (配置、資料庫、安全)
├── shared/         # 共用組件 (模型、工具)
├── domains/        # 功能域
│   ├── user/      # 用戶管理
│   ├── auth/      # 認證系統
│   ├── proposal/  # 提案管理 (待開發)
│   ├── case/      # 案例管理 (待開發)
│   └── ...
└── api/           # API 路由聚合
```

## 🔜 下一步

1. Proposal 域 - 提案生命週期管理
2. Case 域 - 案例媒合系統  
3. Notification 域 - 通知系統
4. Admin 域 - 管理功能

## 🧪 測試

使用 Swagger UI 或測試腳本來測試 API：

**管理員帳號**:
- Email: admin@ma-platform.com
- Password: admin123456

**測試用戶註冊**:
- 賣方: seller@test.com / password123
- 買方: buyer@test.com / password123