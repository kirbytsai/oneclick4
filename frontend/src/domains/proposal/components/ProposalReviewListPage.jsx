// src/domains/proposal/components/ProposalReviewListPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { proposalAdminService } from '../services/proposalAdminService';
import { Button, Card, Badge } from '../../../shared/ui';
import './Proposal.css';
import './AdminProposal.css';

function ProposalReviewListPage() {
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('under_review');
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // 狀態篩選選項（管理員視角）
  const statusOptions = [
    { value: 'under_review', label: '待審核' },
    { value: 'approved', label: '已通過' },
    { value: 'rejected', label: '已拒絕' },
    { value: 'archived', label: '已歸檔' },
    { value: '', label: '全部狀態' }
  ];

  // 載入提案列表和統計
  const loadData = async (status = 'under_review') => {
    console.log('🔄 載入管理員提案資料，狀態篩選:', status);
    setIsLoading(true);
    setError('');
    
    try {
      // 並行載入提案列表和統計數據
      const [proposalsResult, statsResult] = await Promise.all([
        proposalAdminService.getAllProposals(status || null),
        proposalAdminService.getProposalStats()
      ]);

      console.log('✅ 提案列表結果:', proposalsResult);
      console.log('✅ 統計數據結果:', statsResult);
      
      if (proposalsResult.success) {
        setProposals(proposalsResult.proposals);
      } else {
        throw new Error(proposalsResult.error);
      }

      if (statsResult.success) {
        setStats(statsResult.stats);
      }
      
    } catch (error) {
      console.error('❌ 載入資料錯誤:', error);
      setError('載入資料時發生錯誤：' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 頁面載入時取得資料
  useEffect(() => {
    loadData(selectedStatus);
  }, [selectedStatus]);

  // 快速審核操作
  const handleQuickReview = async (proposalId, action) => {
    console.log(`🔄 執行快速審核: ${action}，提案ID: ${proposalId}`);
    setIsActionLoading(true);

    try {
      let result;
      if (action === 'approve') {
        result = await proposalAdminService.approveProposal(proposalId);
      } else if (action === 'quick_reject') {
        const reason = prompt('請輸入拒絕原因：');
        if (!reason) {
          setIsActionLoading(false);
          return;
        }
        result = await proposalAdminService.rejectProposal(proposalId, reason);
      } else if (action === 'archive') {
        result = await proposalAdminService.archiveProposal(proposalId);
      }

      console.log(`✅ 快速審核 ${action} 結果:`, result);

      if (result.success) {
        alert(`審核成功！`);
        await loadData(selectedStatus);
      } else {
        alert(result.error || `審核失敗`);
      }
    } catch (error) {
      console.error(`❌ 快速審核 ${action} 錯誤:`, error);
      alert(`審核時發生錯誤`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 渲染操作按鈕
  const renderActionButtons = (proposal) => {
    const buttons = [];

    // 查看詳情按鈕（所有狀態都有）
    buttons.push(
      <Button
        key="view"
        size="small"
        variant="secondary"
        onClick={() => navigate(`/admin/proposals/${proposal.id}`)}
      >
        查看詳情
      </Button>
    );

    // 根據狀態顯示不同操作
    if (proposal.status === 'under_review') {
      buttons.push(
        <Button
          key="approve"
          size="small"
          variant="success"
          loading={isActionLoading}
          onClick={() => handleQuickReview(proposal.id, 'approve')}
        >
          通過
        </Button>
      );
      buttons.push(
        <Button
          key="reject"
          size="small"
          variant="danger"
          loading={isActionLoading}
          onClick={() => handleQuickReview(proposal.id, 'quick_reject')}
        >
          拒絕
        </Button>
      );
    } else if (proposal.status === 'approved') {
      buttons.push(
        <Button
          key="archive"
          size="small"
          variant="secondary"
          loading={isActionLoading}
          onClick={() => handleQuickReview(proposal.id, 'archive')}
        >
          歸檔
        </Button>
      );
    }

    return buttons;
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  return (
    <div className="proposal-review-list-page">
      {/* 頁面標題 */}
      <div className="page-header">
        <h1>提案審核管理</h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/admin/dashboard')}
        >
          返回管理員主頁
        </Button>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="stats-cards">
          <Card title="待審核" variant="warning">
            <div className="stat-number">{stats.under_review || 0}</div>
            <div className="stat-label">個提案等待審核</div>
          </Card>
          <Card title="總提案數" variant="primary">
            <div className="stat-number">{stats.total || 0}</div>
            <div className="stat-label">個提案總數</div>
          </Card>
        </div>
      )}

      {/* 篩選區域 */}
      <div className="filters">
        <div className="filter-left">
          <div className="filter-group">
            <label htmlFor="status-filter">狀態篩選：</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="stats">
            顯示 {proposals.length} 個提案
          </div>
        </div>
      </div>

      {/* 載入狀態 */}
      {isLoading && (
        <div className="loading">
          <p>載入中...</p>
        </div>
      )}

      {/* 錯誤狀態 */}
      {error && (
        <div className="error">
          <p>錯誤：{error}</p>
          <Button onClick={() => loadData(selectedStatus)}>
            重新載入
          </Button>
        </div>
      )}

      {/* 提案列表 */}
      {!isLoading && !error && (
        <div className="proposals-grid">
          {proposals.length === 0 ? (
            <div className="empty-state">
              <h3>無相關提案</h3>
              <p>
                {selectedStatus === 'under_review' 
                  ? '目前沒有待審核的提案' 
                  : `沒有${statusOptions.find(opt => opt.value === selectedStatus)?.label}的提案`
                }
              </p>
            </div>
          ) : (
            proposals.map(proposal => (
              <Card
                key={proposal.id}
                title={proposal.title}
                subtitle={
                  <div className="proposal-meta">
                    <span>提案者：{proposal.seller_name || '未知'}</span>
                    <span>提交時間：{formatDate(proposal.created_at)}</span>
                    {proposal.reviewed_at && (
                      <span>審核時間：{formatDate(proposal.reviewed_at)}</span>
                    )}
                  </div>
                }
                hoverable
                headerAction={<Badge status={proposal.status} />}
                footer={
                  <div className="proposal-actions">
                    {renderActionButtons(proposal)}
                  </div>
                }
              >
                <div className="proposal-content">
                  <p className="brief-content">
                    {proposal.brief_content?.length > 150 
                      ? proposal.brief_content.substring(0, 150) + '...'
                      : proposal.brief_content || '無摘要內容'
                    }
                  </p>
                  {proposal.reject_reason && (
                    <div className="rejection-reason">
                      <strong>拒絕原因：</strong>
                      <p>{proposal.reject_reason}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ProposalReviewListPage;