// src/domains/case/components/CaseListPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { caseService } from '../services/caseService';
import { Button, Card, Badge } from '../../../shared/ui';
import './Case.css';

// 狀態篩選選項
const STATUS_FILTERS = {
  all: '全部',
  created: '已創建',
  interested: '已表達興趣', 
  nda_signed: '已簽署NDA',
  in_negotiation: '洽談中',
  completed: '已完成',
  cancelled: '已取消'
};

function CaseListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // 狀態管理
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 根據用戶角色決定標題和 API
  const pageTitle = user?.role === 'seller' ? '我發送的案例' : '我收到的案例';
  const createButtonText = user?.role === 'seller' ? '建立新案例' : null;

  // 載入案例列表
  const loadCases = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      let result;
      if (user?.role === 'seller') {
        result = await caseService.getMySentCases();
      } else if (user?.role === 'buyer') {
        result = await caseService.getMyReceivedCases();
      } else {
        throw new Error('權限不足');
      }

      if (result.success) {
        setCases(result.data);
        setFilteredCases(result.data);
      } else {
        setError(result.error || '載入案例失敗');
      }
    } catch (error) {
      console.error('❌ 載入案例錯誤:', error);
      setError('載入案例失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 頁面載入時獲取案例
  useEffect(() => {
    loadCases();
  }, [user?.role]);

  // 狀態篩選
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(case_ => case_.status === selectedStatus));
    }
  }, [cases, selectedStatus]);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleString('zh-TW');
  };

  // 處理案例點擊
  const handleCaseClick = (caseId) => {
    navigate(`/cases/${caseId}`);
  };

  // 處理建立新案例
  const handleCreateNew = () => {
    navigate('/cases/new');
  };

  // 渲染案例卡片
  const renderCaseCard = (case_) => (
    <Card
      key={case_.id}
      title={case_.title}
      subtitle={`對方: ${case_.counterpart_info || '未知'}`}
      hoverable
      clickable
      onClick={() => handleCaseClick(case_.id)}
      headerAction={<Badge status={case_.status} />}
      className="case-card"
    >
      <div className="case-card-content">
        <div className="case-info">
          <div className="case-info-row">
            <span className="case-info-label">狀態:</span>
            <Badge status={case_.status} size="small" />
          </div>
          <div className="case-info-row">
            <span className="case-info-label">建立時間:</span>
            <span>{formatDate(case_.created_at)}</span>
          </div>
          <div className="case-info-row">
            <span className="case-info-label">更新時間:</span>
            <span>{formatDate(case_.updated_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  // 載入狀態
  if (isLoading) {
    return (
      <div className="case-list-container">
        <div className="case-list-header">
          <h1>{pageTitle}</h1>
        </div>
        <div className="loading-container">
          <div className="loading-text">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="case-list-container">
      {/* 頁面標題和操作 */}
      <div className="case-list-header">
        <div className="header-left">
          <h1>{pageTitle}</h1>
          <p className="subtitle">
            {user?.role === 'seller' 
              ? '管理您發送給買方的所有案例' 
              : '查看和管理收到的案例邀請'
            }
          </p>
        </div>
        <div className="header-right">
          {createButtonText && (
            <Button 
              variant="primary" 
              onClick={handleCreateNew}
            >
              {createButtonText}
            </Button>
          )}
          <Button 
            variant="secondary" 
            onClick={loadCases}
            disabled={isLoading}
          >
            重新整理
          </Button>
        </div>
      </div>

      {/* 狀態篩選 */}
      <div className="filter-section">
        <div className="filter-group">
          <label className="filter-label">按狀態篩選:</label>
          <div className="filter-buttons">
            {Object.entries(STATUS_FILTERS).map(([value, label]) => (
              <Button
                key={value}
                variant={selectedStatus === value ? 'primary' : 'ghost'}
                size="small"
                onClick={() => setSelectedStatus(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="stats-section">
        <div className="stats-card">
          <span className="stats-number">{filteredCases.length}</span>
          <span className="stats-label">
            {selectedStatus === 'all' ? '總案例數' : STATUS_FILTERS[selectedStatus]}
          </span>
        </div>
        {cases.length > 0 && (
          <div className="stats-card">
            <span className="stats-number">{cases.length}</span>
            <span className="stats-label">總計</span>
          </div>
        )}
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
          <Button variant="secondary" size="small" onClick={loadCases}>
            重試
          </Button>
        </div>
      )}

      {/* 案例列表 */}
      <div className="case-list-content">
        {filteredCases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>
                {selectedStatus === 'all' 
                  ? '暫無案例' 
                  : `暫無${STATUS_FILTERS[selectedStatus]}案例`
                }
              </h3>
              <p>
                {user?.role === 'seller' 
                  ? '您還沒有發送任何案例，建立您的第一個案例吧！'
                  : '您還沒有收到任何案例邀請'
                }
              </p>
              {createButtonText && selectedStatus === 'all' && (
                <Button 
                  variant="primary" 
                  onClick={handleCreateNew}
                  style={{ marginTop: '16px' }}
                >
                  {createButtonText}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="case-grid">
            {filteredCases.map(renderCaseCard)}
          </div>
        )}
      </div>
    </div>
  );
}

export default CaseListPage;