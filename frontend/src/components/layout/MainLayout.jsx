// src/components/layout/MainLayout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../domains/auth/contexts/AuthContext';
import { Button, Badge } from '../../shared/ui';
import PermissionGuard from '../routing/PermissionGuard';
import './MainLayout.css';

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (confirm('確定要登出嗎？')) {
      const result = await logout();
      if (result && result.success) {
        navigate('/login', { replace: true });
      }
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  return (
    <div className="main-layout">
      {/* 統一導航欄 */}
      <nav className="main-navbar">
        <div className="navbar-container">
          {/* 左側：Logo 和主要導航 */}
          <div className="navbar-left">
            <div className="navbar-logo" onClick={() => navigate(getDashboardPath())}>
              <h1>M&A Platform</h1>
            </div>
            
            <div className="navbar-nav">
              {/* Dashboard - 根據角色動態顯示 */}
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate(getDashboardPath())}
                className={isActivePath(`/${user?.role}/dashboard`) ? 'nav-active' : ''}
              >
                🏠 主頁
              </Button>

              {/* 提案相關 */}
              <Button
                variant="ghost"
                size="small"
                onClick={() => handleNavigation('/proposals')}
                className={isActivePath('/proposals') ? 'nav-active' : ''}
              >
                📋 提案
              </Button>

              {/* 案例相關 */}
              <Button
                variant="ghost"
                size="small"
                onClick={() => handleNavigation('/cases')}
                className={isActivePath('/cases') ? 'nav-active' : ''}
              >
                💼 案例
              </Button>

              {/* 管理員專屬 */}
              <PermissionGuard roles={['admin']}>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleNavigation('/admin/users')}
                  className={isActivePath('/admin/users') ? 'nav-active' : ''}
                >
                  👥 用戶管理
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* 右側：用戶資訊和操作 */}
          <div className="navbar-right">
            {user && (
              <>
                <div className="user-info">
                  <span className="username">{user.username}</span>
                  <Badge status={user.role} size="small" />
                </div>
                
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => navigate('/profile')}
                  className={isActivePath('/profile') ? 'nav-active' : ''}
                >
                  👤 個人資料
                </Button>
                
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleLogout}
                >
                  🚪 登出
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 主要內容區域 */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;