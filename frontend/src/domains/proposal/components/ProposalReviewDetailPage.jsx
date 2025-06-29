// src/domains/proposal/components/ProposalReviewDetailPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { proposalAdminService } from '../services/proposalAdminService';
import { Button, Card, Badge, Input } from '../../../shared/ui';
import './Proposal.css';
import './AdminProposal.css';

function ProposalReviewDetailPage() {
  const [proposal, setProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const isReviewingRef = useRef(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 載入提案詳情
  const loadProposal = async () => {
    console.log('🔄 載入提案詳情（管理員視角），ID:', id);
    setIsLoading(true);
    setError('');

    try {
      const result = await proposalAdminService.getProposalById(id);
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

  // 審核提案 - 通過
  const handleApproveProposal = async () => {
    if (isReviewingRef.current || isReviewing) {
      return;
    }

    const confirmMessage = `確定要通過提案「${proposal.title}」嗎？`;
    if (!confirm(confirmMessage)) {
      return;
    }

    console.log('✅ 通過提案審核');
    isReviewingRef.current = true;
    setIsReviewing(true);

    try {
      const result = await proposalAdminService.approveProposal(id);
      console.log('✅ 通過審核結果:', result);

      if (result.success) {
        alert('提案審核通過！');
        // 重新載入提案資料
        await loadProposal();
      } else {
        alert(result.error || '審核失敗');
      }
    } catch (error) {
      console.error('❌ 通過審核錯誤:', error);
      alert('審核時發生錯誤');
    } finally {
      isReviewingRef.current = false;
      setIsReviewing(false);
    }
  };

  // 審核提案 - 拒絕
  const handleRejectProposal = async () => {
    if (isReviewingRef.current || isReviewing) {
      return;
    }

    if (!rejectionReason.trim()) {
      alert('請輸入拒絕原因');
      return;
    }

    const confirmMessage = `確定要拒絕提案「${proposal.title}」嗎？\n拒絕原因：${rejectionReason}`;
    if (!confirm(confirmMessage)) {
      return;
    }

    console.log('❌ 拒絕提案審核');
    isReviewingRef.current = true;
    setIsReviewing(true);

    try {
      const result = await proposalAdminService.rejectProposal(id, rejectionReason);
      console.log('✅ 拒絕審核結果:', result);

      if (result.success) {
        alert('提案已拒絕！');
        // 重新載入提案資料
        await loadProposal();
        setRejectionReason('');
        setShowRejectForm(false);
      } else {
        alert(result.error || '拒絕失敗');
      }
    } catch (error) {
      console.error('❌ 拒絕審核錯誤:', error);
      alert('拒絕時發生錯誤');
    } finally {
      isReviewingRef.current = false;
      setIsReviewing(false);
    }
  };

  // 歸檔提案
  const handleArchiveProposal = async () => {
    if (isReviewingRef.current || isReviewing) {
      return;
    }

    const confirmMessage = `確定要歸檔提案「${proposal.title}」嗎？`;
    if (!confirm(confirmMessage)) {
      return;
    }

    console.log('📁 歸檔提案');
    isReviewingRef.current = true;
    setIsReviewing(true);

    try {
      const result = await proposalAdminService.archiveProposal(id);
      console.log('✅ 歸檔結果:', result);

      if (result.success) {
        alert('提案已歸檔！');
        await loadProposal();
      } else {
        alert(result.error || '歸檔失敗');
      }
    } catch (error) {
      console.error('❌ 歸檔錯誤:', error);
      alert('歸檔時發生錯誤');
    } finally {
      isReviewingRef.current = false;
      setIsReviewing(false);
    }
  };

  // 渲染審核操作按鈕
  const renderReviewActions = () => {
    if (!proposal) return null;

    const actions = [];

    switch (proposal.status) {
      case 'under_review':
        actions.push(
          <Button
            key="approve"
            variant="success"
            loading={isReviewing}
            onClick={handleApproveProposal}
          >
            通過審核
          </Button>
        );
        actions.push(
          <Button
            key="reject"
            variant="danger"
            loading={isReviewing}
            onClick={() => setShowRejectForm(true)}
          >
            拒絕審核
          </Button>
        );
        break;

      case 'approved':
        actions.push(
          <Button
            key="archive"
            variant="secondary"
            loading={isReviewing}
            onClick={handleArchiveProposal}
          >
            歸檔提案
          </Button>
        );
        break;

      case 'rejected':
      case 'archived':
        // 已拒絕或已歸檔的提案無法操作
        break;
    }

    return actions;
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleString('zh-TW');
  };

  // 載入中
  if (isLoading) {
    return (
      <div className="proposal-review-detail-page">
        <div className="loading">
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="proposal-review-detail-page">
        <div className="error">
          <h2>載入失敗</h2>
          <p>{error}</p>
          <div className="error-actions">
            <Button onClick={loadProposal}>重新載入</Button>
            <Button variant="secondary" onClick={() => navigate('/admin/proposals')}>
              返回審核列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 提案不存在
  if (!proposal) {
    return (
      <div className="proposal-review-detail-page">
        <div className="not-found">
          <h2>提案不存在</h2>
          <p>您要查看的提案不存在或已被刪除</p>
          <Button onClick={() => navigate('/admin/proposals')}>
            返回審核列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="proposal-review-detail-page">
      {/* 頁面標題 */}
      <div className="page-header">
        <div className="header-content">
          <h1>審核提案：{proposal.title}</h1>
          <Badge status={proposal.status} size="large" />
        </div>
        <div className="header-actions">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/admin/proposals')}
          >
            返回審核列表
          </Button>
          {renderReviewActions()}
        </div>
      </div>

      {/* 提案基本資訊 */}
      <Card title="提案基本資訊">
        <div className="proposal-meta">
          <div className="meta-row">
            <span className="meta-label">提案者：</span>
            <span className="meta-value">{proposal.seller_name || '未知'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">提案者Email：</span>
            <span className="meta-value">{proposal.seller_email || '未知'}</span>
          </div>
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
          {proposal.reviewed_by && (
            <div className="meta-row">
              <span className="meta-label">審核人員：</span>
              <span className="meta-value">{proposal.reviewed_by}</span>
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
      {proposal.status === 'rejected' && proposal.reject_reason && (
        <Card title="拒絕原因" variant="danger">
          <div className="rejection-content">
            <p>{proposal.reject_reason}</p>
          </div>
        </Card>
      )}

      {/* 審核操作區域 */}
      {proposal.status === 'under_review' && (
        <Card title="審核操作" variant="warning">
          <div className="review-form">
            <p>請仔細閱讀提案內容，然後選擇審核結果：</p>

            <div className="review-actions">
              <Button
                variant="success"
                loading={isReviewing}
                onClick={handleApproveProposal}
              >
                ✅ 通過審核
              </Button>
              <Button
                variant="danger"
                loading={isReviewing}
                onClick={() => setShowRejectForm(true)}
              >
                ❌ 拒絕審核
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 拒絕表單彈窗 */}
      {showRejectForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Card title="拒絕提案" variant="danger">
              <div className="reject-form">
                <p><strong>提案：</strong>{proposal.title}</p>
                <div className="form-group">
                  <Input
                    label="拒絕原因"
                    type="textarea"
                    value={rejectionReason}
                    onChange={setRejectionReason}
                    required
                    placeholder="請詳細說明拒絕此提案的原因..."
                    rows={4}
                  />
                </div>
                <div className="modal-actions">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    variant="danger"
                    loading={isReviewing}
                    onClick={handleRejectProposal}
                    disabled={!rejectionReason.trim()}
                  >
                    確認拒絕
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 審核指導說明 */}
      <Card title="審核指導" variant="bordered">
        <div className="review-guidelines">
          <h4>審核標準：</h4>
          <ul>
            <li><strong>內容完整性</strong>：檢查提案是否包含必要的商業資訊</li>
            <li><strong>合規性檢查</strong>：確保內容符合平台規範和法律要求</li>
            <li><strong>商業可行性</strong>：評估投資機會的真實性和可行性</li>
            <li><strong>資訊品質</strong>：確保提供的資訊準確且具有投資價值</li>
          </ul>
          
          <h4>審核建議：</h4>
          <ul>
            <li>仔細閱讀簡要說明和詳細內容</li>
            <li>拒絕時請提供具體、建設性的原因</li>
            <li>通過的提案將對買方可見並可創建案例</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default ProposalReviewDetailPage;