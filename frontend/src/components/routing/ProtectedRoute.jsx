// src/components/routing/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../domains/auth/contexts/AuthContext';

function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 等待認證狀態確定
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>載入中...</div>
      </div>
    );
  }

  // 檢查是否需要登入
  if (requireAuth && !isAuthenticated) {
    // 保存當前路徑，登入後可以回到這裡
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 檢查角色權限
  if (allowedRoles.length > 0 && user) {
    if (!allowedRoles.includes(user.role)) {
      // 未授權，重定向到登入頁
      return <Navigate to="/login" replace />;
    }
  }

  // 權限檢查通過，渲染子組件
  return children;
}

export default ProtectedRoute;