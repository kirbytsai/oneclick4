// src/domains/auth/components/TestAuthContext.jsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function TestAuthContext() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    hasRole, 
    isAdmin, 
    isSeller, 
    isBuyer 
  } = useAuth();
  
  const [loginForm, setLoginForm] = useState({
    email: 'seller@test.com',
    password: 'password123'
  });
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('登入中...');
    
    const result = await login(loginForm.email, loginForm.password);
    
    if (result.success) {
      setMessage('✅ 登入成功！');
    } else {
      setMessage(`❌ 登入失敗: ${result.error}`);
    }
  };

  const handleLogout = async () => {
    setMessage('登出中...');
    await logout();
    setMessage('✅ 已登出');
  };

  const testRoles = () => {
    if (!user) {
      setMessage('❌ 請先登入');
      return;
    }

    const roleInfo = [
      `當前角色: ${user.role}`,
      `是否為管理員: ${isAdmin() ? '是' : '否'}`,
      `是否為賣方: ${isSeller() ? '是' : '否'}`,
      `是否為買方: ${isBuyer() ? '是' : '否'}`,
      `是否有 admin 權限: ${hasRole('admin') ? '是' : '否'}`,
      `是否有 seller 權限: ${hasRole('seller') ? '是' : '否'}`,
      `是否有 buyer 權限: ${hasRole('buyer') ? '是' : '否'}`,
    ].join('\n');

    setMessage(`🔍 角色檢查結果:\n${roleInfo}`);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>⏳ 正在初始化認證狀態...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 AuthContext 測試頁面</h2>

      {/* 當前狀態顯示 */}
      <div style={statusBoxStyle}>
        <h3>📊 當前認證狀態</h3>
        <p><strong>是否已登入:</strong> {isAuthenticated ? '✅ 是' : '❌ 否'}</p>
        <p><strong>載入中:</strong> {isLoading ? '⏳ 是' : '✅ 否'}</p>
        
        {user ? (
          <div>
            <p><strong>用戶資訊:</strong></p>
            <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        ) : (
          <p><strong>用戶資訊:</strong> 未登入</p>
        )}
      </div>

      {/* 登入表單 */}
      {!isAuthenticated ? (
        <div style={sectionStyle}>
          <h3>🔑 登入測試</h3>
          <form onSubmit={handleLogin} style={{ marginBottom: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label>Email: </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>密碼: </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <button type="submit" style={buttonStyle}>
              🔑 登入
            </button>
          </form>
          
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <p>測試帳號:</p>
            <ul>
              <li>seller@test.com / password123 (賣方)</li>
              <li>admin@ma-platform.com / admin123456 (管理員)</li>
            </ul>
          </div>
        </div>
      ) : (
        <div style={sectionStyle}>
          <h3>👋 歡迎, {user?.email}!</h3>
          <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>
            🚪 登出
          </button>
          <button onClick={testRoles} style={buttonStyle}>
            🔍 測試角色權限
          </button>
        </div>
      )}

      {/* 訊息顯示 */}
      {message && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#e9ecef',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>
      )}

      {/* 說明文字 */}
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#6c757d' }}>
        <h3>📋 測試項目說明:</h3>
        <ul>
          <li><strong>初始化:</strong> 頁面載入時自動檢查認證狀態</li>
          <li><strong>登入:</strong> 測試全局登入功能</li>
          <li><strong>角色檢查:</strong> 測試各種角色權限檢查方法</li>
          <li><strong>登出:</strong> 測試全局登出功能</li>
          <li><strong>狀態同步:</strong> 所有狀態變更應該立即反映在 UI 上</li>
        </ul>
      </div>
    </div>
  );
}

const statusBoxStyle = {
  backgroundColor: '#f8f9fa',
  padding: '15px',
  borderRadius: '5px',
  border: '1px solid #dee2e6',
  marginBottom: '20px'
};

const sectionStyle = {
  backgroundColor: '#fff',
  padding: '15px',
  borderRadius: '5px',
  border: '1px solid #dee2e6',
  marginBottom: '20px'
};

const buttonStyle = {
  padding: '8px 16px',
  margin: '5px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const inputStyle = {
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ced4da',
  width: '250px'
};

export default TestAuthContext;