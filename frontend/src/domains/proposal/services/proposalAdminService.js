// src/domains/proposal/services/proposalAdminService.js

import { tokenManager } from '../../auth/utils/tokenManager.js';

// 配置後端 API 基礎 URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const proposalAdminService = {
  // 獲取所有提案（管理員視角）
  async getAllProposals(status = null) {
    try {
      let url = `${API_BASE_URL}/proposals/`;
      if (status) {
        url += `?status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足，僅管理員可執行此操作');
        }
        throw new Error(data.detail || '獲取提案列表失敗');
      }

      return { success: true, proposals: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 獲取待審核提案
  async getPendingProposals() {
    return this.getAllProposals('under_review');
  },

  // 獲取提案統計數據 (簡化版本)
  async getProposalStats() {
    try {
      // 先獲取所有提案，然後計算統計
      const allProposalsResult = await this.getAllProposals();
      
      if (!allProposalsResult.success) {
        throw new Error(allProposalsResult.error);
      }

      const proposals = allProposalsResult.proposals;

      const stats = {
        total: proposals.length,
        under_review: proposals.filter(p => p.status === 'under_review').length
      };

      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 審核提案 - 通過 (修正為符合後端 Schema)
  async approveProposal(proposalId, reviewNotes = '') {
    try {
      console.log('✅ 發送審核通過請求:', {
        proposalId,
        reviewNotes,
        endpoint: `${API_BASE_URL}/proposals/${proposalId}/review`
      });

      // 符合後端 ProposalReview schema 的格式
      const requestBody = {
        approved: true,
        reject_reason: null  // 通過時不需要拒絕原因
      };

      console.log('📤 請求體內容:', requestBody);

      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 回應狀態:', response.status);
      
      let data;
      try {
        data = await response.json();
        console.log('📥 回應內容:', data);
      } catch (parseError) {
        console.error('❌ 無法解析回應 JSON:', parseError);
        throw new Error('伺服器回應格式錯誤');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足，僅管理員可執行審核');
        }
        if (response.status === 404) {
          throw new Error('提案不存在');
        }
        if (response.status === 400) {
          throw new Error(data.detail || '提案狀態不允許審核');
        }
        if (response.status === 422) {
          // 處理 422 錯誤的詳細訊息
          const errorDetails = data.detail || '請求數據格式錯誤';
          console.error('❌ 422 錯誤詳情:', errorDetails);
          throw new Error(`數據驗證失敗: ${errorDetails}`);
        }
        throw new Error(data.detail || '審核提案失敗');
      }

      return { success: true, proposal: data };
    } catch (error) {
      console.error('❌ 審核通過錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  // 審核提案 - 拒絕 (修正為符合後端 Schema)
  async rejectProposal(proposalId, rejectionReason) {
    try {
      if (!rejectionReason || !rejectionReason.trim()) {
        throw new Error('拒絕提案時必須提供拒絕原因');
      }

      console.log('❌ 發送審核拒絕請求:', {
        proposalId,
        rejectionReason: rejectionReason.trim(),
        endpoint: `${API_BASE_URL}/proposals/${proposalId}/review`
      });

      // 符合後端 ProposalReview schema 的格式
      const requestBody = {
        approved: false,
        reject_reason: rejectionReason.trim()
      };

      console.log('📤 請求體內容:', requestBody);

      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 回應狀態:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('📥 回應內容:', data);
      } catch (parseError) {
        console.error('❌ 無法解析回應 JSON:', parseError);
        throw new Error('伺服器回應格式錯誤');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足，僅管理員可執行審核');
        }
        if (response.status === 404) {
          throw new Error('提案不存在');
        }
        if (response.status === 400) {
          throw new Error(data.detail || '提案狀態不允許審核');
        }
        if (response.status === 422) {
          const errorDetails = data.detail || '請求數據格式錯誤';
          console.error('❌ 422 錯誤詳情:', errorDetails);
          throw new Error(`數據驗證失敗: ${errorDetails}`);
        }
        throw new Error(data.detail || '拒絕提案失敗');
      }

      return { success: true, proposal: data };
    } catch (error) {
      console.error('❌ 審核拒絕錯誤:', error);
      return { success: false, error: error.message };
    }
  },

  // 管理員歸檔提案
  async archiveProposal(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足，僅管理員可執行此操作');
        }
        if (response.status === 404) {
          throw new Error('提案不存在');
        }
        if (response.status === 400) {
          throw new Error(data.detail || '提案狀態不允許歸檔');
        }
        throw new Error(data.detail || '歸檔提案失敗');
      }

      return { success: true, proposal: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 根據ID獲取提案詳情（管理員視角）
  async getProposalById(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        if (response.status === 404) {
          throw new Error('提案不存在');
        }
        if (response.status === 403) {
          throw new Error('權限不足');
        }
        throw new Error(data.detail || '獲取提案詳情失敗');
      }

      return { success: true, proposal: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 注意：後端沒有批量審核端點，所以我們移除這個功能
  // 如果需要批量審核，需要在後端添加相應的 API 端點
};