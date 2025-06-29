// src/domains/proposal/components/EditProposalPage.jsx
import './Proposal.css';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { proposalService } from '../services/proposalService';
import { Button, Input, Card } from '../../../shared/ui';

function EditProposalPage() {
  const [proposal, setProposal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    brief_content: '',
    detailed_content: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isSubmittingRef = useRef(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 載入提案資料
  const loadProposal = async () => {
    console.log('🔄 載入提案資料進行編輯，ID:', id);
    setIsLoading(true);
    setError('');

    try {
      const result = await proposalService.getProposalById(id);
      console.log('✅ 載入提案資料結果:', result);

      if (result.success) {
        const proposalData = result.proposal;
        
        // 檢查權限：只能編輯自己的提案
        if (proposalData.seller_id !== user.id) {
          setError('權限不足，只能編輯自己的提案');
          return;
        }

        // 檢查狀態：只能編輯草稿狀態的提案
        if (proposalData.status !== 'draft') {
          setError('只能編輯草稿狀態的提案');
          return;
        }

        setProposal(proposalData);
        setFormData({
          title: proposalData.title || '',
          brief_content: proposalData.brief_content || '',
          detailed_content: proposalData.detailed_content || ''
        });
      } else {
        setError(result.error || '載入提案資料失敗');
      }
    } catch (error) {
      console.error('❌ 載入提案資料錯誤:', error);
      setError('載入提案資料時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProposal();
    }
  }, [id]);

  // 表單驗證
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '提案標題為必填';
    } else if (formData.title.length > 100) {
      newErrors.title = '提案標題不能超過100個字符';
    }

    if (!formData.brief_content.trim()) {
      newErrors.brief_content = '簡要說明為必填';
    } else if (formData.brief_content.length > 500) {
      newErrors.brief_content = '簡要說明不能超過500個字符';
    }

    if (!formData.detailed_content.trim()) {
      newErrors.detailed_content = '詳細內容為必填';
    } else if (formData.detailed_content.length > 5000) {
      newErrors.detailed_content = '詳細內容不能超過5000個字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理表單輸入
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 儲存更新
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    if (isSubmittingRef.current || isSubmitting) {
      return; // 防止重複提交
    }

    if (!validateForm()) {
      return;
    }

    console.log('💾 儲存提案更新');
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await proposalService.updateProposal(id, formData);
      console.log('✅ 儲存更新結果:', result);

      if (result.success) {
        alert('提案更新成功！');
        navigate(`/proposals/${id}`);
      } else {
        alert(result.error || '更新提案失敗');
      }
    } catch (error) {
      console.error('❌ 更新提案錯誤:', error);
      alert('更新提案時發生錯誤');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // 儲存並提交審核
  const handleSaveAndSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmittingRef.current || isSubmitting) {
      return; // 防止重複提交
    }

    if (!validateForm()) {
      return;
    }

    if (!confirm('確定要儲存並提交給管理員審核嗎？提交後將無法修改。')) {
      return;
    }

    console.log('📤 儲存並提交審核');
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // 先更新提案
      const updateResult = await proposalService.updateProposal(id, formData);
      console.log('✅ 更新提案結果:', updateResult);

      if (updateResult.success) {
        // 再提交審核
        const submitResult = await proposalService.submitProposal(id);
        console.log('✅ 提交審核結果:', submitResult);

        if (submitResult.success) {
          alert('提案已更新並提交審核！');
          navigate(`/proposals/${id}`);
        } else {
          alert(submitResult.error || '提交審核失敗');
        }
      } else {
        alert(updateResult.error || '更新提案失敗');
      }
    } catch (error) {
      console.error('❌ 儲存並提交錯誤:', error);
      alert('儲存並提交時發生錯誤');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // 載入中
  if (isLoading) {
    return (
      <div className="edit-proposal-page">
        <div className="loading">
          <p>載入中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="edit-proposal-page">
        <div className="error">
          <h2>無法編輯</h2>
          <p>{error}</p>
          <div className="error-actions">
            <Button onClick={() => navigate('/proposals')}>
              返回提案列表
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/proposals/${id}`)}>
              查看提案詳情
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-proposal-page">
      <div className="page-header">
        <h1>編輯提案</h1>
        <div className="header-actions">
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/proposals/${id}`)}
          >
            取消編輯
          </Button>
        </div>
      </div>

      <Card title="編輯提案資訊">
        <form className="proposal-form">
          {/* 提案標題 */}
          <div className="form-group">
            <Input
              label="提案標題"
              type="text"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              error={errors.title}
              required
              placeholder="請輸入提案標題（最多100字符）"
              maxLength={100}
            />
            <div className="char-count">
              {formData.title.length}/100
            </div>
          </div>

          {/* 簡要說明 */}
          <div className="form-group">
            <label htmlFor="brief-content" className="form-label required">
              簡要說明
            </label>
            <textarea
              id="brief-content"
              value={formData.brief_content}
              onChange={(e) => handleInputChange('brief_content', e.target.value)}
              placeholder="請輸入提案的簡要說明，此內容將在未簽署NDA時顯示（最多500字符）"
              rows={4}
              maxLength={500}
              className={`form-textarea ${errors.brief_content ? 'error' : ''}`}
            />
            {errors.brief_content && (
              <div className="error-message">{errors.brief_content}</div>
            )}
            <div className="char-count">
              {formData.brief_content.length}/500
            </div>
          </div>

          {/* 詳細內容 */}
          <div className="form-group">
            <label htmlFor="detailed-content" className="form-label required">
              詳細內容
            </label>
            <textarea
              id="detailed-content"
              value={formData.detailed_content}
              onChange={(e) => handleInputChange('detailed_content', e.target.value)}
              placeholder="請輸入提案的詳細內容，此內容只有在簽署NDA後才能查看（最多5000字符）"
              rows={10}
              maxLength={5000}
              className={`form-textarea ${errors.detailed_content ? 'error' : ''}`}
            />
            {errors.detailed_content && (
              <div className="error-message">{errors.detailed_content}</div>
            )}
            <div className="char-count">
              {formData.detailed_content.length}/5000
            </div>
          </div>

          {/* 提交按鈕 */}
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveChanges}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              儲存變更
            </Button>
            
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAndSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              儲存並提交審核
            </Button>
          </div>
        </form>
      </Card>

      {/* 編輯提示 */}
      <Card title="編輯提示" variant="bordered">
        <div className="edit-tips">
          <h4>重要提醒：</h4>
          <ul>
            <li>只有草稿狀態的提案可以編輯</li>
            <li>編輯後可以選擇「儲存變更」保持草稿狀態，或「儲存並提交審核」</li>
            <li>提交審核後將無法再次修改，請確認所有內容無誤</li>
            <li>如果不想儲存變更，請點擊「取消編輯」返回</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default EditProposalPage;