// src/components/PageSwitcher.jsx - 更新版本
import { useState, useEffect } from 'react';
import { useAuth } from '../domains/auth/contexts/AuthContext';
import LoginPage from '../domains/auth/components/LoginPage';
import RegisterPage from '../domains/auth/components/RegisterPage';
import UserProfilePage from '../domains/auth/components/UserProfilePage';
import ComponentShowcase from './ComponentShowcase';
import { Button } from '../shared/ui';

function PageSwitcher() {
  const { isAuthenticated, user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');

  // 自動跳轉邏輯
  useEffect(() => {
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('profile');
    } else if (!isAuthenticated && (currentPage === 'profile')) {
      setCurrentPage('login');
    }
  }, [isAuthenticated, currentPage]);

  const handleLogout = async () => {
    await logout();
    setCurrentPage('login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'profile':
        return <UserProfilePage />;
      case 'showcase':
        return <ComponentShowcase />;
      default:
        return <LoginPage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* 導航欄 */}
      <nav style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 24px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            M&A Platform
          </h1>
          
          {/* 導航按鈕 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setCurrentPage('showcase')}
              style={{ 
                color: currentPage === 'showcase' ? '#ffc107' : 'white',
                border: currentPage === 'showcase' ? '1px solid #ffc107' : '1px solid transparent'
              }}
            >
              UI 組件庫
            </Button>
            
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage('login')}
                  style={{ 
                    color: currentPage === 'login' ? '#ffc107' : 'white',
                    border: currentPage === 'login' ? '1px solid #ffc107' : '1px solid transparent'
                  }}
                >
                  登入
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setCurrentPage('register')}
                  style={{ 
                    color: currentPage === 'register' ? '#ffc107' : 'white',
                    border: currentPage === 'register' ? '1px solid #ffc107' : '1px solid transparent'
                  }}
                >
                  註冊
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="small"
                onClick={() => setCurrentPage('profile')}
                style={{ 
                  color: currentPage === 'profile' ? '#ffc107' : 'white',
                  border: currentPage === 'profile' ? '1px solid #ffc107' : '1px solid transparent'
                }}
              >
                個人資料
              </Button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                歡迎，{user?.username} ({user?.role})
              </span>
              <Button
                variant="ghost"
                size="small"
                onClick={handleLogout}
                style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                登出
              </Button>
            </>
          ) : (
            <span style={{ fontSize: '14px', opacity: 0.9 }}>
              未登入
            </span>
          )}
        </div>
      </nav>

      {/* 頁面內容 */}
      <main>
        {renderPage()}
      </main>

      {/* 開發狀態指示器 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>當前頁面: <strong>{currentPage}</strong></div>
        <div>認證狀態: <strong>{isAuthenticated ? '已登入' : '未登入'}</strong></div>
        {user && <div>用戶角色: <strong>{user.role}</strong></div>}
      </div>
    </div>
  );
}

export default PageSwitcher;