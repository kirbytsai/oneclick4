// src/domains/auth/components/TestAuthService.jsx

import { useState } from 'react';
import { authService } from '../services/authService.js';

function TestAuthService() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, success, message, data = null) => {
    const result = {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(`${success ? '✅' : '❌'} ${test}:`, message, data);
  };

  const clearResults = () => {
    setTestResults([]);
    console.clear();
  };

  // 測試登入功能
  const testLogin = async () => {
    setIsLoading(true);
    addResult('開始登入測試', true, '使用 seller@test.com 帳號登入...');
    
    try {
      const result = await authService.login('seller@test.com', 'password123');
      
      if (result.success) {
        addResult('登入測試', true, '登入成功！', result.tokens);
        
        // 檢查是否已儲存用戶資訊
        const user = authService.getCurrentUserFromStorage();
        addResult('用戶資訊檢查', !!user, user ? '已儲存用戶資訊' : '未儲存用戶資訊', user);
        
      } else {
        addResult('登入測試', false, result.error);
      }
    } catch (error) {
      addResult('登入測試', false, `登入異常: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  // 測試獲取當前用戶
  const testGetCurrentUser = async () => {
    setIsLoading(true);
    addResult('開始用戶資訊測試', true, '獲取當前用戶資訊...');
    
    try {
      const result = await authService.getCurrentUser();
      
      if (result.success) {
        addResult('用戶資訊測試', true, '獲取用戶資訊成功！', result.user);
      } else {
        addResult('用戶資訊測試', false, result.error);
      }
    } catch (error) {
      addResult('用戶資訊測試', false, `獲取用戶資訊異常: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  // 測試 Token 刷新
  const testRefreshToken = async () => {
    setIsLoading(true);
    addResult('開始 Token 刷新測試', true, '嘗試刷新 token...');
    
    try {
      const result = await authService.refreshToken();
      
      if (result.success) {
        addResult('Token 刷新測試', true, 'Token 刷新成功！', result.tokens);
      } else {
        addResult('Token 刷新測試', false, result.error);
      }
    } catch (error) {
      addResult('Token 刷新測試', false, `Token 刷新異常: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  // 測試登出功能
  const testLogout = async () => {
    setIsLoading(true);
    addResult('開始登出測試', true, '執行登出...');
    
    try {
      const result = await authService.logout();
      
      if (result.success) {
        addResult('登出測試', true, '登出成功！');
        
        // 檢查是否已清除資料
        const isAuth = authService.isAuthenticated();
        const user = authService.getCurrentUserFromStorage();
        addResult('清除檢查', !isAuth && !user, isAuth ? '認證資料未清除' : '認證資料已清除');
        
      } else {
        addResult('登出測試', false, result.error);
      }
    } catch (error) {
      addResult('登出測試', false, `登出異常: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  // 完整測試流程
  const runCompleteTest = async () => {
    clearResults();
    setIsLoading(true);
    
    addResult('完整測試開始', true, '執行完整的認證流程測試...');
    
    try {
      // 1. 先登出（清除可能存在的資料）
      await authService.logout();
      addResult('清理', true, '清除現有認證資料');
      
      // 2. 測試登入
      addResult('步驟 1', true, '測試登入功能...');
      const loginResult = await authService.login('seller@test.com', 'password123');
      if (!loginResult.success) {
        addResult('完整測試', false, `登入失敗: ${loginResult.error}`);
        setIsLoading(false);
        return;
      }
      addResult('登入', true, '登入成功');
      
      // 3. 測試獲取用戶資訊
      addResult('步驟 2', true, '測試獲取用戶資訊...');
      const userResult = await authService.getCurrentUser();
      if (!userResult.success) {
        addResult('獲取用戶資訊', false, userResult.error);
      } else {
        addResult('獲取用戶資訊', true, '用戶資訊獲取成功', userResult.user);
      }
      
      // 4. 測試 Token 刷新
      addResult('步驟 3', true, '測試 Token 刷新...');
      const refreshResult = await authService.refreshToken();
      if (!refreshResult.success) {
        addResult('Token 刷新', false, refreshResult.error);
      } else {
        addResult('Token 刷新', true, 'Token 刷新成功');
      }
      
      // 5. 測試登出
      addResult('步驟 4', true, '測試登出功能...');
      const logoutResult = await authService.logout();
      if (!logoutResult.success) {
        addResult('登出', false, logoutResult.error);
      } else {
        addResult('登出', true, '登出成功');
      }
      
      addResult('完整測試完成', true, '🎉 所有功能測試完成！');
      
    } catch (error) {
      addResult('完整測試', false, `測試過程中發生異常: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 Auth Service API 測試</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={runCompleteTest} disabled={isLoading} style={buttonStyle}>
          🚀 執行完整測試
        </button>
        <button onClick={testLogin} disabled={isLoading} style={buttonStyle}>
          🔑 測試登入
        </button>
        <button onClick={testGetCurrentUser} disabled={isLoading} style={buttonStyle}>
          👤 測試獲取用戶
        </button>
        <button onClick={testRefreshToken} disabled={isLoading} style={buttonStyle}>
          🔄 測試刷新 Token
        </button>
        <button onClick={testLogout} disabled={isLoading} style={buttonStyle}>
          🚪 測試登出
        </button>
        <button onClick={clearResults} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
          🗑️ 清除結果
        </button>
      </div>

      {isLoading && <p>⏳ 測試進行中...</p>}

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #dee2e6',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h3>📋 測試結果：</h3>
        {testResults.length === 0 ? (
          <p>尚未執行測試</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{
              padding: '8px',
              margin: '5px 0',
              backgroundColor: result.success ? '#d1ecf1' : '#f8d7da',
              border: `1px solid ${result.success ? '#bee5eb' : '#f5c6cb'}`,
              borderRadius: '3px'
            }}>
              <strong>{result.timestamp}</strong> - 
              <span style={{ color: result.success ? '#0c5460' : '#721c24' }}>
                {result.success ? ' ✅ ' : ' ❌ '}{result.test}: {result.message}
              </span>
              {result.data && (
                <pre style={{ 
                  fontSize: '12px', 
                  marginTop: '5px', 
                  backgroundColor: '#ffffff',
                  padding: '5px',
                  borderRadius: '3px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>📝 測試說明：</strong></p>
        <ul>
          <li>確保後端正在 localhost:8000 運行</li>
          <li>使用測試帳號：seller@test.com / password123</li>
          <li>打開開發者工具查看詳細 console 輸出</li>
          <li>如果測試失敗，檢查網路連線和後端狀態</li>
        </ul>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '8px 16px',
  margin: '5px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
};

export default TestAuthService;