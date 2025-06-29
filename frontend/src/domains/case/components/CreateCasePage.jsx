// src/domains/case/components/CreateCasePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { caseService } from '../services/caseService';
import { proposalService } from '../../proposal/services/proposalService';
import { userService } from '../../user/services/userService'; // 新增：導入 userService
import { Button, Input, Card } from '../../../shared/ui';
import './Case.css';

function CreateCasePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  // 表單狀態
  const [formData, setFormData] = useState({
    proposal_id: '',
    buyer_id: '',
    initial_message: ''
  });

  // UI 狀態
  const [approvedProposals, setApprovedProposals] = useState([]);
  const [availableBuyers, setAvailableBuyers] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  // 載入已通過的提案
  const loadApprovedProposals = async () => {
    try {
      setIsLoadingProposals(true);
      setError(''); // 清除之前的錯誤
      
      console.log('🔄 開始載入提案...');
      const result = await proposalService.getMyProposals();
      console.log('📥 完整載入提案回應:', result);
      console.log('📥 result.success:', result.success);
      console.log('📥 result.proposals:', result.proposals); // 修正：使用 proposals 而非 data
      
      if (result.success) {
        // 修正：檢查 proposals 是否存在
        if (!result.proposals) {
          console.warn('⚠️ result.proposals 是 null 或 undefined');
          setApprovedProposals([]);
          setError('沒有找到任何提案資料');
          return;
        }
        
        // 修正：確保 proposals 是陣列
        if (!Array.isArray(result.proposals)) {
          console.error('❌ result.proposals 不是陣列:', result.proposals);
          setApprovedProposals([]);
          setError('提案資料格式錯誤');
          return;
        }
        
        const proposals = result.proposals; // 修正：使用正確的屬性名
        console.log('📝 所有提案數量:', proposals.length);
        console.log('📝 所有提案:', proposals);
        
        // 檢查每個提案的狀態
        proposals.forEach((proposal, index) => {
          console.log(`📝 提案 ${index + 1}:`, {
            id: proposal.id,
            title: proposal.title,
            status: proposal.status
          });
        });
        
        // 只顯示已通過的提案
        const approved = proposals.filter(proposal => proposal.status === 'approved');
        console.log('✅ 已通過的提案數量:', approved.length);
        console.log('✅ 已通過的提案:', approved);
        
        setApprovedProposals(approved);
        
        if (approved.length === 0) {
          if (proposals.length === 0) {
            setError('您還沒有建立任何提案。請先建立提案並通過審核。');
          } else {
            setError('您目前沒有已通過的提案可以建立案例。請先建立並通過提案審核。');
          }
        }
      } else {
        console.error('❌ 載入提案失敗:', result);
        setError(result.error || '載入提案失敗');
      }
    } catch (error) {
      console.error('❌ 載入提案錯誤詳情:', error);
      console.error('❌ 錯誤堆疊:', error.stack);
      setError(`載入提案失敗：${error.message}`);
    } finally {
      setIsLoadingProposals(false);
    }
  };

  // 載入可用的買方列表
  const loadAvailableBuyers = async () => {
    try {
      setIsLoadingBuyers(true);
      setError(''); // 清除可能的錯誤
      
      console.log('🔄 載入真實買方列表...');
      
      // 使用真實的買方 API
      const result = await userService.getBuyers();
      console.log('📥 買方 API 回應:', result);
      
      if (result.success && result.data) {
        const buyers = Array.isArray(result.data) ? result.data : [];
        console.log('📝 可用買方數量:', buyers.length);
        console.log('📝 買方列表:', buyers);
        
        setAvailableBuyers(buyers);
        
        if (buyers.length === 0) {
          setError('目前沒有可用的買方。請聯繫管理員添加買方用戶。');
        }
      } else {
        console.error('❌ 載入買方列表失敗:', result);
        setError(result.error || '載入買方列表失敗');
      }
    } catch (error) {
      console.error('❌ 載入買方錯誤:', error);
      setError(`載入買方列表失敗：${error.message}`);
    } finally {
      setIsLoadingBuyers(false);
    }
  };

  // 頁面載入時獲取數據
  useEffect(() => {
    if (user?.role !== 'seller') {
      navigate('/');
      return;
    }
    
    loadApprovedProposals();
    loadAvailableBuyers();
  }, [user, navigate]);

  // 處理提案選擇
  const handleProposalChange = (proposalId) => {
    const proposal = approvedProposals.find(p => p.id === proposalId);
    setSelectedProposal(proposal);
    setFormData(prev => ({ ...prev, proposal_id: proposalId }));
    setErrors(prev => ({ ...prev, proposal_id: '' }));
  };

  // 處理表單輸入
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // 表單驗證
  const validateForm = () => {
    const newErrors = {};

    if (!formData.proposal_id) {
      newErrors.proposal_id = '請選擇要建立案例的提案';
    }

    if (!formData.buyer_id) {
      newErrors.buyer_id = '請選擇目標買方';
    }

    if (formData.initial_message && formData.initial_message.length > 500) {
      newErrors.initial_message = '初始訊息不能超過 500 字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 防重複提交
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 建立案例，表單資料:', formData);
      
      const result = await caseService.createCase(formData);

      if (result.success) {
        console.log('✅ 案例建立成功');
        navigate('/cases', { 
          state: { message: '案例建立成功！已發送給指定買方。' }
        });
      } else {
        setError(result.error || '建立案例失敗');
      }
    } catch (error) {
      console.error('❌ 建立案例錯誤:', error);
      setError('建立案例失敗，請稍後再試');
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // 處理取消
  const handleCancel = () => {
    navigate('/cases');
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  // 載入狀態
  if (isLoadingProposals) {
    return (
      <div className="create-case-container">
        <div className="create-case-header">
          <h1>建立新案例</h1>
        </div>
        <div className="loading-container">
          <div className="loading-text">載入提案資料中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-case-container">
      {/* 頁面標題 */}
      <div className="create-case-header">
        <h1>建立新案例</h1>
        <p className="subtitle">從您已通過的提案建立案例，發送給指定買方</p>
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      {/* 建立表單 */}
      <form onSubmit={handleSubmit} className="create-case-form">
        {/* 選擇提案 */}
        <div className="form-section">
          <h3 className="form-section-title">選擇提案</h3>
          
          <div className="form-field">
            <label htmlFor="proposal-select" className="filter-label">
              選擇要建立案例的提案 *
            </label>
            <div className="select-field">
              <select
                id="proposal-select"
                className="select-input"
                value={formData.proposal_id}
                onChange={(e) => handleProposalChange(e.target.value)}
                disabled={isLoading}
              >
                <option value="">請選擇提案</option>
                {approvedProposals.map(proposal => (
                  <option key={proposal.id} value={proposal.id}>
                    {proposal.title} (通過日期: {formatDate(proposal.updated_at)})
                  </option>
                ))}
              </select>
            </div>
            {errors.proposal_id && (
              <div className="error-text">{errors.proposal_id}</div>
            )}
          </div>

          {/* 選中的提案預覽 */}
          {selectedProposal && (
            <Card 
              title={selectedProposal.title}
              subtitle={`簡要說明: ${selectedProposal.brief_content?.substring(0, 100)}...`}
              variant="bordered"
              style={{ marginTop: '16px' }}
            >
              <div className="proposal-preview">
                <p><strong>狀態:</strong> 已通過</p>
                <p><strong>通過時間:</strong> {formatDate(selectedProposal.updated_at)}</p>
              </div>
            </Card>
          )}
        </div>

        {/* 選擇買方 */}
        <div className="form-section">
          <h3 className="form-section-title">選擇目標買方</h3>
          
          <div className="form-field">
            <label htmlFor="buyer-select" className="filter-label">
              選擇要發送案例的買方 *
            </label>
            <div className="select-field">
              <select
                id="buyer-select"
                className="select-input"
                value={formData.buyer_id}
                onChange={(e) => handleInputChange('buyer_id', e.target.value)}
                disabled={isLoading || isLoadingBuyers}
              >
                <option value="">請選擇買方</option>
                {availableBuyers.map(buyer => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.email} {buyer.name && `(${buyer.name})`}
                  </option>
                ))}
              </select>
            </div>
            {errors.buyer_id && (
              <div className="error-text">{errors.buyer_id}</div>
            )}
          </div>
        </div>

        {/* 初始訊息 */}
        <div className="form-section">
          <h3 className="form-section-title">初始訊息 (可選)</h3>
          
          <div className="form-field">
            <label htmlFor="initial-message" className="filter-label">
              給買方的初始訊息
            </label>
            <textarea
              id="initial-message"
              className="textarea-input"
              placeholder="您可以在這裡添加一些說明或問候語..."
              value={formData.initial_message}
              onChange={(e) => handleInputChange('initial_message', e.target.value)}
              rows={4}
              maxLength={500}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: 'var(--spacing-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div className="character-count">
              {formData.initial_message.length}/500
            </div>
            {errors.initial_message && (
              <div className="error-text">{errors.initial_message}</div>
            )}
          </div>
        </div>

        {/* 表單操作 */}
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!formData.proposal_id || !formData.buyer_id}
          >
            {isLoading ? '建立中...' : '建立案例'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateCasePage;