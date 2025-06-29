// src/domains/proposal/components/CreateProposalPage.jsx
import './Proposal.css';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { proposalService } from '../services/proposalService';
import { Button, Input, Card } from '../../../shared/ui';

function CreateProposalPage() {
  const [formData, setFormData] = useState({
    title: '',
    brief_content: '',
    detailed_content: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isSubmittingRef = useRef(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // 儲存草稿
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    if (isSubmittingRef.current || isSubmitting) {
      return; // 防止重複提交
    }

    if (!validateForm()) {
      return;
    }

    console.log('💾 儲存草稿');
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await proposalService.createProposal({
        ...formData,
        status: 'draft'
      });

      console.log('✅ 儲存草稿結果:', result);

      if (result.success) {
        alert('草稿儲存成功！');
        navigate('/proposals');
      } else {
        alert(result.error || '儲存草稿失敗');
      }
    } catch (error) {
      console.error('❌ 儲存草稿錯誤:', error);
      alert('儲存草稿時發生錯誤');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // 直接提交審核
  const handleSubmitForReview = async (e) => {
    e.preventDefault();
    
    if (isSubmittingRef.current || isSubmitting) {
      return; // 防止重複提交
    }

    if (!validateForm()) {
      return;
    }

    if (!confirm('確定要直接提交給管理員審核嗎？提交後將無法修改。')) {
      return;
    }

    console.log('📤 直接提交審核');
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // 先建立提案
      const createResult = await proposalService.createProposal({
        ...formData,
        status: 'draft'
      });

      console.log('✅ 建立提案結果:', createResult);

      if (createResult.success) {
        // 再提交審核
        const submitResult = await proposalService.submitProposal(createResult.proposal.id);
        console.log('✅ 提交審核結果:', submitResult);

        if (submitResult.success) {
          alert('提案已提交審核！');
          navigate('/proposals');
        } else {
          alert(submitResult.error || '提交審核失敗');
        }
      } else {
        alert(createResult.error || '建立提案失敗');
      }
    } catch (error) {
      console.error('❌ 提交審核錯誤:', error);
      alert('提交審核時發生錯誤');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-proposal-page">
      <div className="page-header">
        <h1>建立新提案</h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/proposals')}
        >
          返回提案列表
        </Button>
      </div>

      <Card title="提案資訊">
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
              onClick={handleSaveDraft}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              儲存草稿
            </Button>
            
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmitForReview}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              直接提交審核
            </Button>
          </div>
        </form>
      </Card>

      {/* 提示資訊 */}
      <Card title="重要提示" variant="bordered">
        <div className="tips">
          <h4>關於提案內容：</h4>
          <ul>
            <li><strong>簡要說明</strong>：會在提案列表中顯示，潛在買方在未簽署NDA時也能看到</li>
            <li><strong>詳細內容</strong>：包含敏感資訊，只有簽署NDA後才能查看</li>
            <li><strong>草稿狀態</strong>：可以隨時修改和完善</li>
            <li><strong>提交審核後</strong>：無法修改，需等待管理員審核</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default CreateProposalPage;