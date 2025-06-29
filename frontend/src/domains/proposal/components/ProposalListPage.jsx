// src/domains/proposal/components/ProposalListPage.jsx
import './Proposal.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { proposalService } from '../services/proposalService';
import { Button, Card, Badge } from '../../../shared/ui';

function ProposalListPage() {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // 狀態過濾選項
  const statusOptions = [
    { value: '', label: '全部狀態' },
    { value: 'draft', label: '草稿' },
    { value: 'under_review', label: '審核中' },
    { value: 'approved', label: '已通過' },
    { value: 'rejected', label: '已拒絕' },
    { value: 'archived', label: '已歸檔' }
  ];

  // 載入提案列表
  const loadProposals = async (status = '') => {
    console.log('🔄 載入提案列表，狀態篩選:', status);
    setIsLoading(true);
    setError('');
    
    try {
      const result = await proposalService.getMyProposals(status || null);
      console.log('✅ 提案列表載入結果:', result);
      
      if (result.success) {
        setProposals(result.proposals);
      } else {
        setError(result.error || '載入提案列表失敗');
      }
    } catch (error) {
      console.error('❌ 載入提案列表錯誤:', error);
      setError('載入提案列表時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 頁面載入時取得提案列表
  useEffect(() => {
    loadProposals(selectedStatus);
  }, [selectedStatus]);

  // 刪除提案
  const handleDeleteProposal = async (proposalId, proposalTitle) => {
    if (!confirm(`確定要刪除提案「${proposalTitle}」嗎？此操作無法復原。`)) {
      return;
    }

    console.log('🗑️ 刪除提案:', proposalId);
    setIsDeleting(proposalId);

    try {
      const result = await proposalService.deleteProposal(proposalId);
      console.log('✅ 刪除提案結果:', result);

      if (result.success) {
        // 重新載入列表
        await loadProposals(selectedStatus);
      } else {
        alert(result.error || '刪除提案失敗');
      }
    } catch (error) {
      console.error('❌ 刪除提案錯誤:', error);
      alert('刪除提案時發生錯誤');
    } finally {
      setIsDeleting(null);
    }
  };

  // 快速操作按鈕
  const handleQuickAction = async (proposalId, action) => {
    console.log(`🔄 執行快速操作: ${action}，提案ID: ${proposalId}`);

    try {
      let result;
      switch (action) {
        case 'submit':
          result = await proposalService.submitProposal(proposalId);
          break;
        case 'resubmit':
          result = await proposalService.resubmitProposal(proposalId);
          break;
        case 'archive':
          result = await proposalService.archiveProposal(proposalId);
          break;
        default:
          return;
      }

      console.log(`✅ 快速操作 ${action} 結果:`, result);

      if (result.success) {
        // 重新載入列表
        await loadProposals(selectedStatus);
      } else {
        alert(result.error || `執行 ${action} 操作失敗`);
      }
    } catch (error) {
      console.error(`❌ 快速操作 ${action} 錯誤:`, error);
      alert(`執行 ${action} 操作時發生錯誤`);
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
        onClick={() => navigate(`/proposals/${proposal.id}`)}
      >
        查看詳情
      </Button>
    );

    // 根據狀態顯示不同操作
    switch (proposal.status) {
      case 'draft':
        buttons.push(
          <Button
            key="edit"
            size="small"
            onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
          >
            編輯
          </Button>
        );
        buttons.push(
          <Button
            key="submit"
            size="small"
            variant="warning"
            onClick={() => handleQuickAction(proposal.id, 'submit')}
          >
            提交審核
          </Button>
        );
        buttons.push(
          <Button
            key="delete"
            size="small"
            variant="danger"
            loading={isDeleting === proposal.id}
            onClick={() => handleDeleteProposal(proposal.id, proposal.title)}
          >
            刪除
          </Button>
        );
        break;

      case 'under_review':
        // 審核中只能查看，無其他操作
        break;

      case 'approved':
        buttons.push(
          <Button
            key="archive"
            size="small"
            variant="secondary"
            onClick={() => handleQuickAction(proposal.id, 'archive')}
          >
            歸檔
          </Button>
        );
        break;

      case 'rejected':
        buttons.push(
          <Button
            key="resubmit"
            size="small"
            variant="warning"
            onClick={() => handleQuickAction(proposal.id, 'resubmit')}
          >
            重新提交
          </Button>
        );
        buttons.push(
          <Button
            key="delete"
            size="small"
            variant="danger"
            loading={isDeleting === proposal.id}
            onClick={() => handleDeleteProposal(proposal.id, proposal.title)}
          >
            刪除
          </Button>
        );
        break;

      case 'archived':
        // 已歸檔只能查看
        break;
    }

    return buttons;
  };

  return (
    <div className="proposal-list-page">
      {/* 頁面標題和操作 */}
      <div className="page-header">
        <h1>我的提案</h1>
        <Button 
          variant="primary" 
          onClick={() => navigate('/proposals/new')}
        >
          建立新提案
        </Button>
      </div>

      {/* 狀態篩選 */}
      <div className="filters">
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
          總共 {proposals.length} 個提案
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
          <Button onClick={() => loadProposals(selectedStatus)}>
            重新載入
          </Button>
        </div>
      )}

      {/* 提案列表 */}
      {!isLoading && !error && (
        <div className="proposals-grid">
          {proposals.length === 0 ? (
            <div className="empty-state">
              <h3>尚無提案</h3>
              <p>開始建立您的第一個提案吧！</p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/proposals/new')}
              >
                建立新提案
              </Button>
            </div>
          ) : (
            proposals.map(proposal => (
              <Card
                key={proposal.id}
                title={proposal.title}
                subtitle={`建立於 ${new Date(proposal.created_at).toLocaleDateString('zh-TW')}`}
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
                  {proposal.rejection_reason && (
                    <div className="rejection-reason">
                      <strong>拒絕原因：</strong>
                      <p>{proposal.rejection_reason}</p>
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

export default ProposalListPage;