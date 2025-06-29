// src/domains/case/services/caseService.js
import { tokenManager } from '../../auth/utils/tokenManager';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const caseService = {
  // === 基本 CRUD 操作 ===
  
  /**
   * 建立新 Case (賣方功能)
   * @param {Object} data - { proposal_id, buyer_id, initial_message? }
   */
  async createCase(data) {
    try {
      console.log('🔄 建立 Case API 呼叫開始:', data);
      
      const response = await fetch(`${API_BASE_URL}/cases/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      console.log('📥 建立 Case 回應狀態:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('📥 建立 Case 回應內容:', result);
      } catch (parseError) {
        console.error('❌ JSON 解析錯誤:', parseError);
        throw new Error('伺服器回應格式錯誤');
      }

      if (!response.ok) {
        if (response.status === 422) {
          console.error('❌ 422 錯誤詳情:', result.detail);
          throw new Error(`資料驗證失敗: ${result.detail}`);
        }
        throw new Error(result.detail || '建立 Case 失敗');
      }

      console.log('✅ 建立 Case 成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 建立 Case 錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 獲取我發送的 Cases (賣方功能)
   */
  async getMySentCases() {
    try {
      console.log('🔄 獲取我發送的 Cases...');
      
      const response = await fetch(`${API_BASE_URL}/cases/my-sent`, {
        method: 'GET',
        headers: {
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 獲取發送 Cases 回應狀態:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          // Token 可能過期，觸發重新登入
          throw new Error('請重新登入');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '獲取發送 Cases 失敗');
      }

      const result = await response.json();
      console.log('✅ 獲取發送 Cases 成功，數量:', result.length);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 獲取發送 Cases 錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 獲取我收到的 Cases (買方功能)
   */
  async getMyReceivedCases() {
    try {
      console.log('🔄 獲取我收到的 Cases...');
      
      const response = await fetch(`${API_BASE_URL}/cases/my-received`, {
        method: 'GET',
        headers: {
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 獲取收到 Cases 回應狀態:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('請重新登入');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '獲取收到 Cases 失敗');
      }

      const result = await response.json();
      console.log('✅ 獲取收到 Cases 成功，數量:', result.length);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 獲取收到 Cases 錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 獲取 Case 詳情
   * @param {string} caseId 
   */
  async getCaseById(caseId) {
    try {
      console.log('🔄 獲取 Case 詳情:', caseId);
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
        method: 'GET',
        headers: {
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 獲取 Case 詳情回應狀態:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('請重新登入');
        }
        if (response.status === 404) {
          throw new Error('Case 不存在');
        }
        if (response.status === 403) {
          throw new Error('權限不足');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '獲取 Case 詳情失敗');
      }

      const result = await response.json();
      console.log('✅ 獲取 Case 詳情成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 獲取 Case 詳情錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  // === 狀態操作 ===

  /**
   * 表達興趣 (買方功能)
   * @param {string} caseId 
   */
  async expressInterest(caseId) {
    try {
      console.log('🔄 表達興趣:', caseId);
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 表達興趣回應狀態:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '表達興趣失敗');
      }

      const result = await response.json();
      console.log('✅ 表達興趣成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 表達興趣錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 拒絕 Case (買方功能)
   * @param {string} caseId 
   */
  async rejectCase(caseId) {
    try {
      console.log('🔄 拒絕 Case:', caseId);
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 拒絕 Case 回應狀態:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '拒絕 Case 失敗');
      }

      const result = await response.json();
      console.log('✅ 拒絕 Case 成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 拒絕 Case 錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 簽署 NDA (買方功能)
   * @param {string} caseId 
   */
  async signNDA(caseId) {
    try {
      console.log('🔄 簽署 NDA:', caseId);
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/sign-nda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 簽署 NDA 回應狀態:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '簽署 NDA 失敗');
      }

      const result = await response.json();
      console.log('✅ 簽署 NDA 成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 簽署 NDA 錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 獲取聯絡資訊 (NDA 簽署後)
   * @param {string} caseId 
   */
  async getContactInfo(caseId) {
    try {
      console.log('🔄 獲取聯絡資訊:', caseId);
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/contact-info`, {
        method: 'GET',
        headers: {
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 獲取聯絡資訊回應狀態:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '獲取聯絡資訊失敗');
      }

      const result = await response.json();
      console.log('✅ 獲取聯絡資訊成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 獲取聯絡資訊錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  // === 留言功能 ===

  /**
   * 建立留言
   * @param {string} caseId 
   * @param {Object} data - { content }
   */
  async createComment(caseId, data) {
    try {
      console.log('🔄 建立留言:', { caseId, data });
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      console.log('📥 建立留言回應狀態:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 422) {
          console.error('❌ 422 錯誤詳情:', errorData.detail);
          throw new Error(`資料驗證失敗: ${errorData.detail}`);
        }
        throw new Error(errorData.detail || '建立留言失敗');
      }

      const result = await response.json();
      console.log('✅ 建立留言成功');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 建立留言錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 獲取 Case 留言
   * @param {string} caseId 
   */
  async getCaseComments(caseId) {
    try {
      console.log('🔄 獲取 Case 留言:', caseId);
      
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/comments`, {
        method: 'GET',
        headers: {
          ...tokenManager.getAuthHeader(),
        },
      });

      console.log('📥 獲取留言回應狀態:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || '獲取留言失敗');
      }

      const result = await response.json();
      console.log('✅ 獲取留言成功，數量:', result.length);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ 獲取留言錯誤:', error);
      return { success: false, error: error.message };
    }
  }
};