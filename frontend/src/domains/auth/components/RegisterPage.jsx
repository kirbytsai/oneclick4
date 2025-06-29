// src/domains/auth/components/RegisterPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🎯 新增
import { useAuth } from '../contexts/AuthContext.jsx';
import './RegisterPage.css';

function RegisterPage() { // 🎯 移除 onNavigate prop
  const { register, login, isLoading } = useAuth();
  const navigate = useNavigate(); // 🎯 新增
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' // 預設為買方
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
    
    // Email 驗證
    if (!formData.email) {
      newErrors.email = 'Email 為必填';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email 格式不正確';
    }
    
    // 用戶名驗證
    if (!formData.username) {
      newErrors.username = '用戶名為必填';
    } else if (formData.username.length < 3) {
      newErrors.username = '用戶名至少需要 3 個字元';
    } else if (formData.username.length > 20) {
      newErrors.username = '用戶名最多 20 個字元';
    }
    
    // 密碼驗證
    if (!formData.password) {
      newErrors.password = '密碼為必填';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要 6 個字元';
    }
    
    // 確認密碼驗證
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '請確認密碼';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '密碼不一致';
    }
    
    // 角色驗證
    if (!formData.role) {
      newErrors.role = '請選擇角色';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🎯 修正處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setMessage('');
    
    try {
      // 準備註冊資料
      const registerData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role
      };
      
      const result = await register(registerData);
      
      if (result.success) {
        setMessage('✅ 註冊成功！正在自動登入...');
        
        // 註冊成功後自動登入
        try {
          const loginResult = await login(formData.email, formData.password);
          if (loginResult.success) {
            setMessage('✅ 註冊成功並已自動登入！正在跳轉...');
            
            // 🎯 跳轉到對應的 dashboard
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1000);
            
          } else {
            setMessage('✅ 註冊成功！請手動登入。');
            // 如果自動登入失敗，跳轉到登入頁面
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } catch (loginError) {
          setMessage('✅ 註冊成功！請手動登入。');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setMessage(`❌ 註冊失敗：${result.error}`);
      }
    } catch (error) {
      setMessage('❌ 發生未預期的錯誤，請稍後再試');
    }
  };

  // 🎯 新增跳轉到登入頁面函數
  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>加入 M&A Platform</h1>
          <p>建立您的新帳號</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
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
            <label htmlFor="username">用戶名 *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="請輸入用戶名 (3-20 個字元)"
              disabled={isLoading}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role">角色 *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role ? 'error' : ''}
              disabled={isLoading}
            >
              <option value="buyer">買方 (尋找投資/收購機會)</option>
              <option value="seller">賣方 (提供投資/出售項目)</option>
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="請輸入密碼 (至少 6 個字元)"
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">確認密碼 *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="請再次輸入密碼"
              disabled={isLoading}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? '註冊中...' : '建立帳號'}
          </button>

          {message && (
            <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>

        <div className="register-footer">
          <p>已經有帳號了？ 
            <button 
              type="button"
              onClick={goToLogin} // 🎯 修正這裡
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
              立即登入
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;