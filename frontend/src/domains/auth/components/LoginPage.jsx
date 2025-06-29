// src/domains/auth/components/LoginPage.jsx

import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './LoginPage.css';

function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSubmittingRef = useRef(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // 處理輸入變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除該欄位的錯誤
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 表單驗證
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email 為必填';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email 格式不正確';
    }
    
    if (!formData.password) {
      newErrors.password = '密碼為必填';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要 6 個字元';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🎯 新增：根據用戶角色獲取正確的 dashboard 路徑
  const getDashboardPath = (userRole) => {
    if (!userRole) return '/dashboard';
    return `/${userRole}/dashboard`;
  };

  // 🎯 修正處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 handleSubmit 開始');
    
    // 防止重複提交
    if (isSubmittingRef.current || isLoading) {
      console.log('🚫 防止重複提交');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ 表單驗證失敗');
      return;
    }
    
    setMessage('');
    isSubmittingRef.current = true;
    
    try {
      console.log('🔐 調用 login 函數');
      const result = await login(formData.email, formData.password);
      console.log('🔐 login 函數返回結果:', result);
      
      if (result.success) {
        console.log('✅ 登入成功，開始跳轉流程');
        setMessage('登入成功！正在跳轉...');
        
        // 🎯 重要修正：需要等待 AuthContext 更新用戶狀態
        // 使用短暫延遲讓 AuthContext 的狀態更新完成
        setTimeout(async () => {
          // 從 AuthContext 獲取最新的用戶資訊
          const currentUser = JSON.parse(localStorage.getItem('user_info'));
          console.log('👤 當前用戶資訊:', currentUser);
          
          if (currentUser && currentUser.role) {
            const dashboardPath = getDashboardPath(currentUser.role);
            console.log('🧭 根據角色跳轉到:', dashboardPath);
            navigate(dashboardPath, { replace: true });
          } else {
            console.log('🧭 無角色資訊，跳轉到通用 dashboard');
            navigate('/dashboard', { replace: true });
          }
        }, 100); // 短暫延遲確保狀態更新
        
      } else {
        console.log('❌ 登入失敗:', result.error);
        setMessage(result.error || '登入失敗，請檢查您的帳號密碼');
        isSubmittingRef.current = false;
      }
    } catch (error) {
      console.log('💥 登入過程發生錯誤:', error);
      setMessage('發生未預期的錯誤，請稍後再試');
      isSubmittingRef.current = false;
    }
  };

  // 快速填入測試帳號
  const fillTestAccount = (type) => {
    if (isSubmittingRef.current || isLoading) {
      return;
    }
    
    if (type === 'seller') {
      setFormData({
        email: 'seller@test.com',
        password: 'password123'
      });
    } else if (type === 'buyer') {
      setFormData({
        email: 'buyer@test.com',
        password: 'password123'
      });
    } else if (type === 'admin') {
      setFormData({
        email: 'admin@ma-platform.com',
        password: 'admin123456'
      });
    }
    setErrors({});
    setMessage('');
  };

  // 跳轉到註冊頁面
  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>M&A Platform</h1>
          <p>登入您的帳號</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="請輸入您的 Email"
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="請輸入您的密碼"
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading || isSubmittingRef.current}
          >
            {isLoading ? '登入中...' : '登入'}
          </button>

          {message && (
            <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>

        {/* 測試帳號快速填入 */}
        <div className="test-accounts">
          <p>測試帳號 (開發用):</p>
          <div className="test-buttons">
            <button 
              type="button" 
              onClick={() => fillTestAccount('seller')}
              className="test-button seller"
              disabled={isLoading || isSubmittingRef.current}
            >
              賣方帳號
            </button>
            <button 
              type="button" 
              onClick={() => fillTestAccount('buyer')}
              className="test-button buyer"
              disabled={isLoading || isSubmittingRef.current}
            >
              買方帳號
            </button>
            <button 
              type="button" 
              onClick={() => fillTestAccount('admin')}
              className="test-button admin"
              disabled={isLoading || isSubmittingRef.current}
            >
              管理員帳號
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>還沒有帳號？ 
            <button 
              type="button"
              onClick={goToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0',
                fontSize: 'inherit'
              }}
            >
              立即註冊
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;