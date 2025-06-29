// src/domains/auth/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { tokenManager } from '../utils/tokenManager.js';

// 建立 Context
const AuthContext = createContext();

// AuthProvider 組件
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化認證狀態
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
  console.log('🔄 initializeAuth 開始');
  try {
    // 檢查本地是否有 token
    const hasToken = tokenManager.isAuthenticated();
    console.log('🔑 hasToken:', hasToken);
    
    if (hasToken) {
      const storedUser = tokenManager.getUser();
      console.log('👤 storedUser:', storedUser);
      
      if (storedUser) {
        // 有本地用戶資料，先設置狀態
        console.log('✅ 設置本地用戶狀態');
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // 然後嘗試從後端獲取最新用戶資料（驗證 token 是否仍有效）
        console.log('🌐 驗證 token 有效性');
        const result = await authService.getCurrentUser();
        console.log('🌐 getCurrentUser result:', result);
        
        if (result.success) {
          console.log('✅ Token 有效，更新用戶資料');
          setUser(result.user);
          tokenManager.setUser(result.user);
        } else {
          console.log('❌ Token 無效，清除狀態');
          // Token 無效，清除狀態
          handleLogout();
        }
      } else {
        // 有 token 但沒有用戶資料，嘗試獲取
        console.log('🌐 有 token 但無用戶資料，嘗試獲取');
        const result = await authService.getCurrentUser();
        console.log('🌐 getCurrentUser result:', result);
        
        if (result.success) {
          console.log('✅ 獲取用戶資料成功');
          setUser(result.user);
          setIsAuthenticated(true);
          tokenManager.setUser(result.user);
        } else {
          console.log('❌ 獲取用戶資料失敗');
          handleLogout();
        }
      }
    } else {
      console.log('❌ 無 token');
    }
  } catch (error) {
    console.error('❌ 初始化認證狀態失敗:', error);
    handleLogout();
  } finally {
    console.log('🏁 initializeAuth 完成，設置 isLoading = false');
    setIsLoading(false);
  }
};

  // 登入
 const login = async (email, password) => {
  console.log('🔐 登入開始:', email);
  try {
    setIsLoading(true);
    const result = await authService.login(email, password);
    console.log('🔐 login result:', result);
    
    if (result.success) {
      const userResult = await authService.getCurrentUser();
      console.log('👤 getCurrentUser after login:', userResult);
      
      if (userResult.success) {
        console.log('✅ 登入成功，設置用戶狀態:', userResult.user);
        setUser(userResult.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    }
    
    return { success: false, error: result.error || '登入失敗' };
  } catch (error) {
    console.error('❌ 登入錯誤:', error);
    return { success: false, error: error.message };
  } finally {
    setIsLoading(false);
  }
};

const logout = async () => {
  console.log('🚪 登出開始');
  try {
    setIsLoading(true);
    await authService.logout();
    console.log('🌐 後端登出完成');
  } catch (error) {
    console.error('❌ 登出錯誤:', error);
  } finally {
    // 清除認證狀態
    console.log('🧹 清除本地狀態');
    handleLogout();
    setIsLoading(false);
    console.log('✅ 登出完成');
    return { success: true };
  }
};

const handleLogout = () => {
  console.log('🧹 handleLogout 執行');
  setUser(null);
  setIsAuthenticated(false);
  tokenManager.clear();
  console.log('🧹 所有狀態已清除');
};
  // 註冊
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // 檢查用戶角色
  const hasRole = (role) => {
    return user?.role === role;
  };

  // 檢查是否為管理員
  const isAdmin = () => {
    return hasRole('admin');
  };

  // 檢查是否為賣方
  const isSeller = () => {
    return hasRole('seller');
  };

  // 檢查是否為買方
  const isBuyer = () => {
    return hasRole('buyer');
  };

  // Context 值
  const value = {
    // 狀態
    user,
    isAuthenticated,
    isLoading,
    
    // 方法
    login,
    logout,
    register,
    
    // 角色檢查
    hasRole,
    isAdmin,
    isSeller,
    isBuyer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必須在 AuthProvider 內使用');
  }
  return context;
}