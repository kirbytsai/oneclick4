// src/domains/case/components/CaseDetailPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { caseService } from '../services/caseService';
import { Button, Card, Badge } from '../../../shared/ui';
import './Case.css';

function CaseDetailPage() {
  const { id: caseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isActioningRef = useRef(false);

  // 狀態管理
  const [caseData, setCaseData] = useState(null);
  const [comments, setComments] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState('');
  
  // 留言相關狀態
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // 載入案例詳情
  const loadCaseDetail = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await caseService.getCaseById(caseId);
      
      if (result.success) {
        setCaseData(result.data);
        
        // 如果已簽署 NDA，載入聯絡資訊
        if (result.data.status === 'nda_signed') {
          loadContactInfo();
        }
      } else {
        setError(result.error || '載入案例詳情失敗');
      }
    } catch (error) {
      console.error('❌ 載入案例詳情錯誤:', error);
      setError('載入案例詳情失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 載入留言
  const loadComments = async () => {
    try {
      setIsCommentsLoading(true);
      const result = await caseService.getCaseComments(caseId);
      
      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('❌ 載入留言錯誤:', error);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // 載入聯絡資訊
  const loadContactInfo = async () => {
    try {
      const result = await caseService.getContactInfo(caseId);
      if (result.success) {
        setContactInfo(result.data);
      }
    } catch (error) {
      console.error('❌ 載入聯絡資訊錯誤:', error);
    }
  };

  // 頁面載入時獲取數據
  useEffect(() => {
    if (caseId) {
      loadCaseDetail();
      loadComments();
    }
  }, [caseId]);

  // 處理表達興趣
  const handleExpressInterest = async () => {
    if (isActioningRef.current || isActioning) return;
    
    isActioningRef.current = true;
    setIsActioning(true);
    
    try {
      const result = await caseService.expressInterest(caseId);
      if (result.success) {
        setCaseData(result.data);
        console.log('✅ 表達興趣成功');
      } else {
        setError(result.error || '表達興趣失敗');
      }
    } catch (error) {
      console.error('❌ 表達興趣錯誤:', error);
      setError('表達興趣失敗，請稍後再試');
    } finally {
      setIsActioning(false);
      isActioningRef.current = false;
    }
  };

  // 處理拒絕案例
  const handleRejectCase = async () => {
    if (isActioningRef.current || isActioning) return;
    
    if (!confirm('確定要拒絕這個案例嗎？此操作無法撤銷。')) {
      return;
    }
    
    isActioningRef.current = true;
    setIsActioning(true);
    
    try {
      const result = await caseService.rejectCase(caseId);
      if (result.success) {
        setCaseData(result.data);
        console.log('✅ 拒絕案例成功');
      } else {
        setError(result.error || '拒絕案例失敗');
      }
    } catch (error) {
      console.error('❌ 拒絕案例錯誤:', error);
      setError('拒絕案例失敗，請稍後再試');
    } finally {
      setIsActioning(false);
      isActioningRef.current = false;
    }
  };

  // 處理簽署 NDA
  const handleSignNDA = async () => {
    if (isActioningRef.current || isActioning) return;
    
    if (!confirm('確定要簽署 NDA 嗎？簽署後您將可以查看詳細內容和聯絡資訊。')) {
      return;
    }
    
    isActioningRef.current = true;
    setIsActioning(true);
    
    try {
      const result = await caseService.signNDA(caseId);
      if (result.success) {
        setCaseData(result.data);
        loadContactInfo(); // 簽署後立即載入聯絡資訊
        console.log('✅ 簽署 NDA 成功');
      } else {
        setError(result.error || '簽署 NDA 失敗');
      }
    } catch (error) {
      console.error('❌ 簽署 NDA 錯誤:', error);
      setError('簽署 NDA 失敗，請稍後再試');
    } finally {
      setIsActioning(false);
      isActioningRef.current = false;
    }
  };

  // 處理發送留言
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmittingComment) {
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const result = await caseService.createComment(caseId, {
        content: newComment.trim()
      });
      
      if (result.success) {
        setNewComment('');
        loadComments(); // 重新載入留言
        console.log('✅ 留言發送成功');
      } else {
        setError(result.error || '發送留言失敗');
      }
    } catch (error) {
      console.error('❌ 發送留言錯誤:', error);
      setError('發送留言失敗，請稍後再試');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleString('zh-TW');
  };

  // 獲取狀態說明
  const getStatusDescription = (status) => {
    const descriptions = {
      created: '案例已創建，等待買方回應',
      interested: '買方已表達興趣，可以簽署 NDA 查看詳細內容',
      nda_signed: 'NDA 已簽署，雙方可以查看詳細內容並進行洽談',
      in_negotiation: '雙方正在洽談中',
      completed: '案例已成功完成',
      cancelled: '案例已取消'
    };
    return descriptions[status] || '未知狀態';
  };

  // 判斷用戶角色
  const isSeller = caseData && caseData.seller_id === user?.id;
  const isBuyer = caseData && caseData.buyer_id === user?.id;
  const hasSignedNDA = caseData && caseData.status === 'nda_signed';

  // 載入狀態
  if (isLoading) {
    return (
      <div className="case-detail-container">
        <div className="loading-container">
          <div className="loading-text">載入案例詳情中...</div>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error && !caseData) {
    return (
      <div className="case-detail-container">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <Button variant="secondary" onClick={() => navigate('/cases')}>
            返回案例列表
          </Button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="case-detail-container">
        <div className="error-container">
          <div className="error-message">案例不存在</div>
          <Button variant="secondary" onClick={() => navigate('/cases')}>
            返回案例列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="case-detail-container">
      {/* 頁面標題 */}
      <div className="case-detail-header">
        <div className="case-title">
          <h1>{caseData.title}</h1>
          <Badge status={caseData.status} />
        </div>
        
        <div className="case-meta">
          <div className="meta-item">
            <span className="meta-label">案例狀態</span>
            <span className="meta-value">{getStatusDescription(caseData.status)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">創建時間</span>
            <span className="meta-value">{formatDate(caseData.created_at)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">最後更新</span>
            <span className="meta-value">{formatDate(caseData.updated_at)}</span>
          </div>
          {caseData.interested_at && (
            <div className="meta-item">
              <span className="meta-label">表達興趣時間</span>
              <span className="meta-value">{formatDate(caseData.interested_at)}</span>
            </div>
          )}
          {caseData.nda_signed_at && (
            <div className="meta-item">
              <span className="meta-label">NDA 簽署時間</span>
              <span className="meta-value">{formatDate(caseData.nda_signed_at)}</span>
            </div>
          )}
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="error-container" style={{ marginTop: '16px' }}>
            <div className="error-message">{error}</div>
          </div>
        )}
      </div>

      {/* 主要內容區域 */}
      <div className="case-content">
        {/* 左側主要內容 */}
        <div className="case-main-content">
          {/* 簡要說明 */}
          <div className="content-section">
            <h3>簡要說明</h3>
            <div className="content-text">{caseData.brief_content}</div>
          </div>

          {/* 詳細內容 */}
          <div className="content-section">
            <h3>詳細內容</h3>
            {isSeller || hasSignedNDA ? (
              <div className="content-text">{caseData.detailed_content}</div>
            ) : (
              <div className="locked-content">
                <div className="locked-content-icon">🔒</div>
                <h4>詳細內容已鎖定</h4>
                <p>需要簽署 NDA 後才能查看詳細內容</p>
                {isBuyer && caseData.status === 'interested' && (
                  <Button 
                    variant="primary" 
                    onClick={handleSignNDA}
                    loading={isActioning}
                    style={{ marginTop: '16px' }}
                  >
                    簽署 NDA
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 初始訊息 */}
          {caseData.initial_message && (
            <div className="content-section">
              <h3>初始訊息</h3>
              <div className="content-text">{caseData.initial_message}</div>
            </div>
          )}

          {/* 聯絡資訊 */}
          {contactInfo && (
            <div className="content-section">
              <h3>聯絡資訊</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-label">賣方聯絡方式:</span>
                  <span className="contact-value">{contactInfo.seller_email}</span>
                  {contactInfo.seller_name && (
                    <span className="contact-name">({contactInfo.seller_name})</span>
                  )}
                </div>
                <div className="contact-item">
                  <span className="contact-label">買方聯絡方式:</span>
                  <span className="contact-value">{contactInfo.buyer_email}</span>
                  {contactInfo.buyer_name && (
                    <span className="contact-name">({contactInfo.buyer_name})</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右側邊欄 */}
        <div className="case-sidebar">
          {/* 操作區域 */}
          <div className="actions-section">
            <h3>操作</h3>
            <div className="action-buttons">
              {/* 買方操作 */}
              {isBuyer && caseData.status === 'created' && (
                <>
                  <Button 
                    variant="primary" 
                    onClick={handleExpressInterest}
                    loading={isActioning}
                    size="small"
                  >
                    表達興趣
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleRejectCase}
                    loading={isActioning}
                    size="small"
                  >
                    拒絕案例
                  </Button>
                </>
              )}
              
              {isBuyer && caseData.status === 'interested' && (
                <Button 
                  variant="success" 
                  onClick={handleSignNDA}
                  loading={isActioning}
                  size="small"
                >
                  簽署 NDA
                </Button>
              )}

              {/* 通用操作 */}
              <Button 
                variant="secondary" 
                onClick={() => navigate('/cases')}
                size="small"
              >
                返回案例列表
              </Button>
            </div>
          </div>

          {/* 狀態時間軸 */}
          <div className="status-timeline">
            <h3>狀態進度</h3>
            <div className="timeline-item completed">
              <span>✅ 案例已創建</span>
            </div>
            <div className={`timeline-item ${['interested', 'nda_signed', 'in_negotiation', 'completed'].includes(caseData.status) ? 'completed' : ''}`}>
              <span>
                {caseData.status === 'interested' || ['nda_signed', 'in_negotiation', 'completed'].includes(caseData.status) ? '✅' : '⏳'} 
                表達興趣
              </span>
            </div>
            <div className={`timeline-item ${['nda_signed', 'in_negotiation', 'completed'].includes(caseData.status) ? 'completed' : ''}`}>
              <span>
                {['nda_signed', 'in_negotiation', 'completed'].includes(caseData.status) ? '✅' : '⏳'} 
                簽署 NDA
              </span>
            </div>
            <div className={`timeline-item ${['in_negotiation', 'completed'].includes(caseData.status) ? 'completed' : ''}`}>
              <span>
                {['in_negotiation', 'completed'].includes(caseData.status) ? '✅' : '⏳'} 
                開始洽談
              </span>
            </div>
            <div className={`timeline-item ${caseData.status === 'completed' ? 'completed' : ''}`}>
              <span>
                {caseData.status === 'completed' ? '✅' : '⏳'} 
                完成交易
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 留言系統 */}
      <div className="comments-section">
        <div className="comments-header">
          <h3>留言討論</h3>
          <span className="comments-count">
            {isCommentsLoading ? '載入中...' : `${comments.length} 則留言`}
          </span>
        </div>

        {/* 留言列表 */}
        <div className="comments-list">
          {isCommentsLoading ? (
            <div className="loading-text">載入留言中...</div>
          ) : comments.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px', textAlign: 'center' }}>
              <p>暫無留言，開始第一個討論吧！</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className={`comment-item ${comment.is_seller ? 'seller' : 'buyer'}`}>
                <div className="comment-avatar">
                  {comment.user_email ? comment.user_email.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.user_email} {comment.is_seller ? '(賣方)' : '(買方)'}
                    </span>
                    <span className="comment-time">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <div className="comment-text">{comment.content}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 留言表單 */}
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="輸入您的留言..."
            maxLength={1000}
            disabled={isSubmittingComment}
          />
          <div className="comment-form-actions">
            <span className="character-count">
              {newComment.length}/1000
            </span>
            <Button
              type="submit"
              variant="primary"
              size="small"
              loading={isSubmittingComment}
              disabled={!newComment.trim()}
            >
              發送留言
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CaseDetailPage;