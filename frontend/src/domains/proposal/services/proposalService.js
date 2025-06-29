// src/domains/proposal/services/proposalService.js

import { tokenManager } from '../../auth/utils/tokenManager.js';

// 配置後端 API 基礎 URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const proposalService = {
  // 獲取我的提案列表
  async getMyProposals(status = null) {
    try {
      let url = `${API_BASE_URL}/proposals/my`;
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
        // 如果是 401 錯誤，token 可能過期
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        throw new Error(data.detail || '獲取提案列表失敗');
      }

      return { success: true, proposals: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 根據 ID 獲取單個提案
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

  // 建立新提案
  async createProposal(proposalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
        body: JSON.stringify(proposalData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足，只有賣方可以建立提案');
        }
        throw new Error(data.detail || '建立提案失敗');
      }

      return { success: true, proposal: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 更新提案
  async updateProposal(proposalId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足，只能編輯自己的提案');
        }
        if (response.status === 404) {
          throw new Error('提案不存在');
        }
        throw new Error(data.detail || '更新提案失敗');
      }

      return { success: true, proposal: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 提交提案給管理員審核
  async submitProposal(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/submit`, {
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
          throw new Error('權限不足，只能提交自己的提案');
        }
        if (response.status === 400) {
          throw new Error(data.detail || '提案狀態不允許提交');
        }
        throw new Error(data.detail || '提交提案失敗');
      }

      return { success: true, proposal: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 重新提交被拒絕的提案（將狀態改回草稿）
  async resubmitProposal(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/resubmit`, {
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
          throw new Error('權限不足，只能重新提交自己的提案');
        }
        if (response.status === 400) {
          throw new Error(data.detail || '提案狀態不允許重新提交');
        }
        throw new Error(data.detail || '重新提交失敗');
      }

      return { success: true, proposal: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 刪除提案
  async deleteProposal(proposalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...tokenManager.getAuthHeader(),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          throw new Error('認證已過期，請重新登入');
        }
        if (response.status === 403) {
          throw new Error('權限不足，只能刪除自己的提案');
        }
        if (response.status === 404) {
          throw new Error('提案不存在');
        }
        if (response.status === 400) {
          throw new Error(data.detail || '提案狀態不允許刪除');
        }
        throw new Error(data.detail || '刪除提案失敗');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 歸檔提案
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
          throw new Error('權限不足，只能歸檔自己的提案');
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
  }
};