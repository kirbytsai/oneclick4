// src/domains/auth/components/TestTokenManager.jsx

import { tokenManager } from '../utils/tokenManager.js';

function TestTokenManager() {
  const runAllTests = () => {
    console.clear();
    console.log('🚀 開始測試 tokenManager...');
    
    try {
      // 測試 1: 儲存 tokens
      console.log('\n📝 測試 1: 儲存 tokens');
      tokenManager.setTokens('fake_access_token_12345', 'fake_refresh_token_67890');
      console.log('✅ Tokens 已儲存');
      
      // 測試 2: 讀取 tokens
      console.log('\n📖 測試 2: 讀取 tokens');
      const accessToken = tokenManager.getAccessToken();
      const refreshToken = tokenManager.getRefreshToken();
      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);
      
      // 測試 3: 儲存用戶資訊
      console.log('\n👤 測試 3: 儲存用戶資訊');
      const testUser = { 
        id: 'user123', 
        email: 'test@example.com', 
        role: 'buyer',
        is_active: true 
      };
      tokenManager.setUser(testUser);
      console.log('✅ 用戶資訊已儲存');
      
      // 測試 4: 讀取用戶資訊
      console.log('\n📖 測試 4: 讀取用戶資訊');
      const storedUser = tokenManager.getUser();
      console.log('用戶資訊:', storedUser);
      
      // 測試 5: 檢查認證狀態
      console.log('\n🔐 測試 5: 檢查認證狀態');
      const isAuth = tokenManager.isAuthenticated();
      console.log('是否已認證:', isAuth);
      
      // 測試 6: 獲取認證標頭
      console.log('\n📋 測試 6: 獲取認證標頭');
      const authHeader = tokenManager.getAuthHeader();
      console.log('認證標頭:', authHeader);
      
      // 測試 7: 清除所有資料
      console.log('\n🗑️  測試 7: 清除所有資料');
      tokenManager.clear();
      console.log('已清除所有資料');
      
      // 測試 8: 驗證清除結果
      console.log('\n✅ 測試 8: 驗證清除結果');
      console.log('清除後 - Access Token:', tokenManager.getAccessToken());
      console.log('清除後 - 用戶資訊:', tokenManager.getUser());
      console.log('清除後 - 是否已認證:', tokenManager.isAuthenticated());
      
      console.log('\n🎉 所有測試完成！請檢查上面的輸出結果。');
      
    } catch (error) {
      console.error('❌ 測試失敗:', error);
    }
  };

  const checkLocalStorage = () => {
    console.clear();
    console.log('🔍 檢查 localStorage 內容:');
    console.log('auth_token:', localStorage.getItem('auth_token'));
    console.log('refresh_token:', localStorage.getItem('refresh_token'));
    console.log('user_info:', localStorage.getItem('user_info'));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 Token Manager 測試頁面</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          🚀 執行完整測試
        </button>
        
        <button 
          onClick={checkLocalStorage}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔍 檢查 localStorage
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #dee2e6'
      }}>
        <h3>📋 測試說明：</h3>
        <ol>
          <li>點擊「執行完整測試」按鈕</li>
          <li>打開瀏覽器開發者工具 (F12)</li>
          <li>查看 Console 標籤中的測試結果</li>
          <li>確認所有功能都正常運作</li>
        </ol>
        
        <p><strong>期望結果：</strong></p>
        <ul>
          <li>能夠儲存和讀取 tokens</li>
          <li>能夠儲存和讀取用戶資訊</li>
          <li>認證狀態檢查正確</li>
          <li>清除功能正常工作</li>
        </ul>
      </div>
    </div>
  );
}

export default TestTokenManager;