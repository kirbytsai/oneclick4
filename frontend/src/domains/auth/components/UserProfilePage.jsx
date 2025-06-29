// src/domains/auth/components/UserProfilePage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authService } from '../services/authService.js';
import './UserProfilePage.css';

function UserProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // 獲取最新用戶資訊
  const fetchUserProfile = async () => {
    // 如果沒有用戶，就不要發送請求
    if (!user) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authService.getCurrentUser();
      
      if (result.success) {
        setProfileData(result.user);
        setLastUpdated(new Date());
      } else {
        setError(result.error || '獲取用戶資訊失敗');
      }
    } catch (error) {
      setError('網路錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 頁面載入時獲取用戶資訊
  useEffect(() => {
    if (user) {
      setProfileData(user);
      // 只有在已登入狀態下才獲取最新資料
      fetchUserProfile();
    }
  }, [user]);

  // 處理登出
  const handleLogout = async () => {
    if (confirm('確定要登出嗎？')) {
      await logout();
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleString('zh-TW');
  };

  // 角色顯示
  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': '👑 管理員',
      'seller': '🏢 賣方',
      'buyer': '💰 買方'
    };
    return roleMap[role] || role;
  };

  // 角色描述
  const getRoleDescription = (role) => {
    const descMap = {
      'admin': '系統管理員，擁有所有權限',
      'seller': '提供投資項目和出售機會',
      'buyer': '尋找投資和收購機會'
    };
    return descMap[role] || '';
  };

  if (authLoading) {
    return (
      <div className="profile-container">
        <div className="loading-card">
          <h2>⏳ 載入中...</h2>
        </div>
      </div>
    );
  }

  if (!user && !profileData) {
    return (
      <div className="profile-container">
        <div className="error-card">
          <h2>❌ 未登入</h2>
          <p>請先登入以查看個人資訊</p>
        </div>
      </div>
    );
  }

  const displayData = profileData || user;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {displayData?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="header-info">
            <h1>{displayData?.username || '未知用戶'}</h1>
            <p className="role">{getRoleDisplay(displayData?.role)}</p>
            <p className="role-desc">{getRoleDescription(displayData?.role)}</p>
          </div>
          <button onClick={fetchUserProfile} className="refresh-button" disabled={isLoading || !user}>
            {isLoading ? '⏳' : '🔄'}
          </button>
        </div>

        <div className="profile-content">
          <div className="info-section">
            <h3>📋 基本資訊</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Email</label>
                <span>{displayData?.email || '未知'}</span>
              </div>
              <div className="info-item">
                <label>用戶名</label>
                <span>{displayData?.username || '未知'}</span>
              </div>
              <div className="info-item">
                <label>角色</label>
                <span>{getRoleDisplay(displayData?.role)}</span>
              </div>
              <div className="info-item">
                <label>帳號狀態</label>
                <span className={displayData?.is_active ? 'active' : 'inactive'}>
                  {displayData?.is_active ? '✅ 啟用' : '❌ 停用'}
                </span>
              </div>
              <div className="info-item">
                <label>用戶 ID</label>
                <span className="user-id">{displayData?.id || '未知'}</span>
              </div>
              <div className="info-item">
                <label>建立時間</label>
                <span>{formatDate(displayData?.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="status-section">
            <h3>🔄 同步狀態</h3>
            <div className="status-grid">
              <div className="status-item">
                <label>本地資料</label>
                <span>{user ? '✅ 已快取' : '❌ 無快取'}</span>
              </div>
              <div className="status-item">
                <label>最後更新</label>
                <span>{lastUpdated ? formatDate(lastUpdated) : '未更新'}</span>
              </div>
              <div className="status-item">
                <label>資料來源</label>
                <span>{profileData ? '🌐 伺服器' : '💾 本地快取'}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button 
            onClick={fetchUserProfile} 
            disabled={isLoading || !user} 
            className="action-button refresh"
          >
            {isLoading ? '⏳ 更新中...' : '🔄 重新整理'}
          </button>
          <button onClick={handleLogout} className="action-button logout">
            🚪 登出
          </button>
        </div>

        <div className="profile-footer">
          <p>🔐 您的資訊受到嚴格保護</p>
          <p>如有問題請聯繫系統管理員</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;