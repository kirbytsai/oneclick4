// src/components/routing/PermissionGuard.jsx
import { useAuth } from '../../domains/auth/contexts/AuthContext';

function PermissionGuard({ 
  children, 
  roles = [], 
  condition = null,
  fallback = null,
  requireAuth = true 
}) {
  const { isAuthenticated, user } = useAuth();

  // 檢查認證狀態
  if (requireAuth && !isAuthenticated) {
    return fallback;
  }

  // 檢查角色權限
  if (roles.length > 0 && user) {
    if (!roles.includes(user.role)) {
      return fallback;
    }
  }

  // 檢查自定義條件
  if (condition !== null) {
    if (typeof condition === 'function') {
      if (!condition(user)) {
        return fallback;
      }
    } else {
      if (!condition) {
        return fallback;
      }
    }
  }

  // 權限檢查通過，渲染子組件
  return children;
}

export default PermissionGuard;