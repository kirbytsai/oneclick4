// src/domains/auth/services/authService.js

import { tokenManager } from '../utils/tokenManager.js';

// 配置你的後端 API 基礎 URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const authService = {
  // 用戶註冊
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '註冊失敗');
      }

      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 用戶登入
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '登入失敗');
      }

      // 儲存 tokens
      tokenManager.setTokens(data.access_token, data.refresh_token);

      // 獲取用戶資訊
      const userResult = await this.getCurrentUser();
      if (userResult.success) {
        tokenManager.setUser(userResult.user);
      }

      return { success: true, tokens: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 獲取當前用戶資訊
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // 如果是 401 錯誤，嘗試刷新 token
        if (response.status === 401) {
          const refreshResult = await this.refreshToken();
          if (refreshResult.success) {
            // 重新嘗試獲取用戶資訊
            return this.getCurrentUser();
          }
        }
        throw new Error(data.detail || '獲取用戶資訊失敗');
      }

      return { success: true, user: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 刷新 token
  async refreshToken() {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('沒有 refresh token');
      }

      console.log('🔄 嘗試刷新 token:', { refreshToken: refreshToken.substring(0, 20) + '...' });

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      console.log('🔄 刷新 token 回應狀態:', response.status);

      const data = await response.json();
      console.log('🔄 刷新 token 回應資料:', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Token 刷新失敗');
      }

      // 更新 tokens
      tokenManager.setTokens(data.access_token, data.refresh_token);

      return { success: true, tokens: data };
    } catch (error) {
      console.error('❌ Token 刷新錯誤:', error);
      // 刷新失敗，清除所有認證資料
      tokenManager.clear();
      return { success: false, error: error.message };
    }
  },

  // 用戶登出
  async logout() {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      
      if (refreshToken) {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...tokenManager.getAuthHeader(),
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        // 不管後端回應如何，都清除本地資料
      }

      // 清除本地認證資料
      tokenManager.clear();
      
      return { success: true };
    } catch (error) {
      // 即使出錯也要清除本地資料
      tokenManager.clear();
      return { success: false, error: error.message };
    }
  },

  // 檢查是否已登入
  isAuthenticated() {
    return tokenManager.isAuthenticated();
  },

  // 獲取當前用戶（從本地存儲）
  getCurrentUserFromStorage() {
    return tokenManager.getUser();
  }
};