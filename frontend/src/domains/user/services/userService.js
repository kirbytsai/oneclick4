// src/domains/user/services/userService.js
import { tokenManager } from '../../auth/utils/tokenManager';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const userService = {
  /**
   * 獲取買方列表 (賣方和管理員可用)
   */
  async getBuyers() {
    try {
      console.log('🔄 獲取買方列表 API 呼叫開始');
      
      const response = await fetch(`${API_BASE_URL}/users/buyers`, {
        method: 'GET',
        headers: {
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 獲取買方列表回應狀態:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足：只有賣方和管理員可以查看買方列表');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '獲取買方列表失敗');
      }

      const result = await response.json();
      console.log('📥 獲取買方列表回應內容:', result);
      
      // 後端直接回傳陣列
      if (Array.isArray(result)) {
        console.log('✅ 獲取買方列表成功，數量:', result.length);
        return { success: true, data: result };
      } else {
        console.error('❌ 買方列表回應格式錯誤，預期陣列:', result);
        return { success: false, error: '回應格式錯誤' };
      }
    } catch (error) {
      console.error('❌ 獲取買方列表錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 獲取我的用戶資料
   */
  async getMyProfile() {
    try {
      console.log('🔄 獲取我的用戶資料...');
      
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 獲取用戶資料回應狀態:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('請重新登入');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '獲取用戶資料失敗');
      }

      const result = await response.json();
      console.log('✅ 獲取用戶資料成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 獲取用戶資料錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 更新我的用戶資料
   */
  async updateMyProfile(userData) {
    try {
      console.log('🔄 更新用戶資料...', userData);
      
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
        body: JSON.stringify(userData),
      });

      console.log('📥 更新用戶資料回應狀態:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('請重新登入');
        }
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 422) {
          console.error('❌ 422 錯誤詳情:', errorData.detail);
          throw new Error(`資料驗證失敗: ${errorData.detail}`);
        }
        throw new Error(errorData.detail || '更新用戶資料失敗');
      }

      const result = await response.json();
      console.log('✅ 更新用戶資料成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 更新用戶資料錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 獲取用戶檔案 (用於 NDA 後的資訊交換)
   */
  async getUserProfile(userId) {
    try {
      console.log('🔄 獲取用戶檔案:', userId);
      
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
        method: 'GET',
        headers: {
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 獲取用戶檔案回應狀態:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足');
        }
        if (response.status === 404) {
          throw new Error('用戶不存在');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '獲取用戶檔案失敗');
      }

      const result = await response.json();
      console.log('✅ 獲取用戶檔案成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 獲取用戶檔案錯誤:', error);
      return { success: false, error: error.message };
    }
  }
};