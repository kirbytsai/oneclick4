// src/domains/proposal/components/ProposalDetailPage.jsx
import './Proposal.css';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { proposalService } from '../services/proposalService';
import { Button, Card, Badge } from '../../../shared/ui';

function ProposalDetailPage() {
  const [proposal, setProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const isActionRef = useRef(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 載入提案詳情
  const loadProposal = async () => {
    console.log('🔄 載入提案詳情，ID:', id);
    setIsLoading(true);
    setError('');

    try {
      const result = await proposalService.getProposalById(id);
      console.log('✅ 提案詳情載入結果:', result);

      if (result.success) {
        setProposal(result.proposal);
      } else {
        setError(result.error || '載入提案詳情失敗');
      }
    } catch (error) {
      console.error('❌ 載入提案詳情錯誤:', error);
      setError('載入提案詳情時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProposal();
    }
  }, [id]);

  // 執行提案操作
  const handleProposalAction = async (action, confirmMessage = '') => {
    if (isActionRef.current || isActionLoading) {
      return;
    }

    if (confirmMessage && !confirm(confirmMessage)) {
      return;
    }

    console.log(`🔄 執行提案操作: ${action}`);
    isActionRef.current = true;
    setIsActionLoading(true);

    try {
      let result;
      switch (action) {
        case 'submit':
          result = await proposalService.submitProposal(id);
          break;
        case 'resubmit':
          result = await proposalService.resubmitProposal(id);
          break;
        case 'archive':
          result = await proposalService.archiveProposal(id);
          break;
        case 'delete':
          result = await proposalService.deleteProposal(id);
          if (result.success) {
            alert('提案已刪除');
            navigate('/proposals');
            return;
          }
          break;
        default:
          return;
      }

      console.log(`✅ 提案操作 ${action} 結果:`, result);

      if (result.success) {
        alert(`操作成功！`);
        // 重新載入提案資料
        await loadProposal();
      } else {
        alert(result.error || `執行 ${action} 操作失敗`);
      }
    } catch (error) {
      console.error(`❌ 提案操作 ${action} 錯誤:`, error);
      alert(`執行 ${action} 操作時發生錯誤`);
    } finally {
      isActionRef.current = false;
      setIsActionLoading(false);
    }
  };

  // 渲染操作按鈕
  const renderActionButtons = () => {
    if (!proposal || proposal.seller_id !== user.id) {
      return null; // 不是自己的提案不能操作
    }

    const buttons = [];

    switch (proposal.status) {
      case 'draft':
        buttons.push(
          <Button
            key="edit"
            variant="primary"
            onClick={() => navigate(`/proposals/${id}/edit`)}
          >
            編輯提案
          </Button>
        );
        buttons.push(
          <Button
            key="submit"
            variant="warning"
            loading={isActionLoading}
            onClick={() => handleProposalAction('submit', '確定要提交給管理員審核嗎？提交後將無法修改。')}
          >
            提交審核
          </Button>
        );
        buttons.push(
          <Button
            key="delete"
            variant="danger"
            loading={isActionLoading}
            onClick={() => handleProposalAction('delete', `確定要刪除提案「${proposal.title}」嗎？此操作無法復原。`)}
          >
            刪除提案
          </Button>
        );
        break;

      case 'under_review':
        // 審核中無法操作
        break;

      case 'approved':
        buttons.push(
          <Button
            key="archive"
            variant="secondary"
            loading={isActionLoading}
            onClick={() => handleProposalAction('archive', '確定要歸檔此提案嗎？')}
          >
            歸檔提案
          </Button>
        );
        break;

      case 'rejected':
        buttons.push(
          <Button
            key="resubmit"
            variant="warning"
            loading={isActionLoading}
            onClick={() => handleProposalAction('resubmit', '確定要重新提交此提案嗎？提案將回到草稿狀態供您修改。')}
          >
            重新提交
          </Button>
        );
        buttons.push(
          <Button
            key="delete"
            variant="danger"
            loading={isActionLoading}
            onClick={() => handleProposalAction('delete', `確定要刪除提案「${proposal.title}」嗎？此操作無法復原。`)}
          >
            刪除提案
          </Button>
        );
        break;

      case 'archived':
        // 已歸檔無法操作
        break;
    }

    return buttons;
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleString('zh-TW');
  };

  // 載入中
  if (isLoading) {
    return (
      <div className="proposal-detail-page">
        <div className="loading">
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="proposal-detail-page">
        <div className="error">
          <h2>載入失敗</h2>
          <p>{error}</p>
          <div className="error-actions">
            <Button onClick={loadProposal}>重新載入</Button>
            <Button variant="secondary" onClick={() => navigate('/proposals')}>
              返回提案列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 提案不存在
  if (!proposal) {
    return (
      <div className="proposal-detail-page">
        <div className="not-found">
          <h2>提案不存在</h2>
          <p>您要查看的提案不存在或已被刪除</p>
          <Button onClick={() => navigate('/proposals')}>
            返回提案列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="proposal-detail-page">
      {/* 頁面標題 */}
      <div className="page-header">
        <div className="header-content">
          <h1>{proposal.title}</h1>
          <Badge status={proposal.status} size="large" />
        </div>
        <div className="header-actions">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/proposals')}
          >
            返回列表
          </Button>
          {renderActionButtons()}
        </div>
      </div>

      {/* 提案基本資訊 */}
      <Card title="基本資訊">
        <div className="proposal-meta">
          <div className="meta-row">
            <span className="meta-label">建立時間：</span>
            <span className="meta-value">{formatDate(proposal.created_at)}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">最後更新：</span>
            <span className="meta-value">{formatDate(proposal.updated_at)}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">提案狀態：</span>
            <span className="meta-value">
              <Badge status={proposal.status} />
            </span>
          </div>
          {proposal.reviewed_at && (
            <div className="meta-row">
              <span className="meta-label">審核時間：</span>
              <span className="meta-value">{formatDate(proposal.reviewed_at)}</span>
            </div>
          )}
        </div>
      </Card>

      {/* 簡要說明 */}
      <Card title="簡要說明" subtitle="此內容對所有用戶可見">
        <div className="proposal-content">
          <p>{proposal.brief_content || '無簡要說明'}</p>
        </div>
      </Card>

      {/* 詳細內容 */}
      <Card title="詳細內容" subtitle="此內容需要簽署NDA後才能查看">
        <div className="proposal-content">
          <p>{proposal.detailed_content || '無詳細內容'}</p>
        </div>
      </Card>

      {/* 拒絕原因（如果被拒絕） */}
      {proposal.status === 'rejected' && proposal.rejection_reason && (
        <Card title="拒絕原因" variant="danger">
          <div className="rejection-content">
            <p>{proposal.rejection_reason}</p>
            <div className="rejection-tip">
              <strong>提示：</strong>您可以根據拒絕原因修改提案後重新提交。
            </div>
          </div>
        </Card>
      )}

      {/* 狀態說明 */}
      <Card title="狀態說明" variant="bordered">
        <div className="status-help">
          {proposal.status === 'draft' && (
            <p>提案處於草稿狀態，您可以隨時編輯和修改內容，完成後可提交給管理員審核。</p>
          )}
          {proposal.status === 'under_review' && (
            <p>提案已提交審核，正在等待管理員處理。審核期間無法修改內容。</p>
          )}
          {proposal.status === 'approved' && (
            <p>提案已通過審核！現在可以基於此提案創建案例，或將其歸檔保存。</p>
          )}
          {proposal.status === 'rejected' && (
            <p>提案被拒絕。您可以查看拒絕原因，修改後重新提交，或刪除此提案。</p>
          )}
          {proposal.status === 'archived' && (
            <p>提案已歸檔保存。歸檔的提案無法修改，但可以作為歷史記錄查看。</p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ProposalDetailPage;