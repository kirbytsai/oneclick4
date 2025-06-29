// src/domains/auth/utils/tokenManager.js

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_info';

export const tokenManager = {
  // 儲存 tokens
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  // 獲取 access token
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // 獲取 refresh token
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // 儲存用戶資訊
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // 獲取用戶資訊
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // 檢查是否已登入
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  // 清除所有認證資料
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // 獲取認證標頭
  getAuthHeader() {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};