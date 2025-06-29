// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../shared/ui';
import { proposalAdminService } from '../domains/proposal/services/proposalAdminService';
import './Dashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 載入統計數據
  const loadStats = async () => {
    try {
      const result = await proposalAdminService.getProposalStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('載入統計數據失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>管理員主頁</h1>
        <p>系統管理與監控中心</p>
      </div>

      <div className="dashboard-grid">
        <Card title="用戶管理" hoverable>
          <p>管理系統內所有用戶的帳戶狀態</p>
          <div style={{ marginTop: '16px' }}>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => navigate('/admin/users')}
            >
              管理用戶
            </Button>
          </div>
        </Card>

        <Card title="提案審核" hoverable>
          <div style={{ marginBottom: '12px' }}>
            <p>審核賣方提交的投資提案</p>
            {!isLoading && stats && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginTop: '8px' 
              }}>
                <Badge variant="warning" size="small">
                  {stats.under_review || 0} 個待審核
                </Badge>
                {stats.under_review > 0 && (
                  <span style={{ 
                    color: '#f59e0b', 
                    fontSize: '0.875rem', 
                    fontWeight: '500' 
                  }}>
                    ⚠️ 需要處理
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <Button 
              variant="warning" 
              size="small"
              onClick={() => navigate('/admin/proposals?status=under_review')}
            >
              待審核提案
            </Button>
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => navigate('/admin/proposals')}
            >
              全部提案
            </Button>
          </div>
        </Card>

        <Card title="系統統計" hoverable>
          <div style={{ marginBottom: '12px' }}>
            <p>查看平台使用統計和分析數據</p>
            {!isLoading && stats && (
              <div style={{ 
                marginTop: '12px',
                fontSize: '0.875rem',
                color: '#6b7280',
                lineHeight: '1.4'
              }}>
                <div>總提案數：{stats.total || 0}</div>
              </div>
            )}
          </div>
          <div style={{ marginTop: '16px' }}>
            <Button 
              variant="info" 
              size="small"
              onClick={() => alert('統計功能開發中')}
            >
              查看統計
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// src/pages/SellerDashboard.jsx
function SellerDashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>賣方工作台</h1>
        <p>管理您的投資提案和案例</p>
      </div>

      <div className="dashboard-grid">
        <Card title="我的提案" hoverable>
          <p>查看和管理您提交的所有提案</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <Button variant="primary" size="small">查看提案</Button>
            <Button variant="success" size="small">建立新提案</Button>
          </div>
        </Card>

        <Card title="案例管理" hoverable>
          <p>管理已核准提案的案例對接</p>
          <div style={{ marginTop: '16px' }}>
            <Button variant="primary" size="small">管理案例</Button>
          </div>
        </Card>

        <Card title="數據分析" hoverable>
          <p>分析您的提案表現和市場趨勢</p>
          <div style={{ marginTop: '16px' }}>
            <Button variant="info" size="small">查看分析</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// src/pages/BuyerDashboard.jsx  
function BuyerDashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>買方中心</h1>
        <p>探索投資機會和管理案例</p>
      </div>

      <div className="dashboard-grid">
        <Card title="案例瀏覽" hoverable>
          <p>瀏覽可用的投資案例和機會</p>
          <div style={{ marginTop: '16px' }}>
            <Button variant="primary" size="small">瀏覽案例</Button>
          </div>
        </Card>

        <Card title="我的案例" hoverable>
          <p>管理您表達興趣的案例</p>
          <div style={{ marginTop: '16px' }}>
            <Button variant="success" size="small">我的案例</Button>
          </div>
        </Card>

        <Card title="NDA 管理" hoverable>
          <p>管理您的保密協議簽署狀況</p>
          <div style={{ marginTop: '16px' }}>
            <Button variant="warning" size="small">NDA 狀態</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export { AdminDashboard, SellerDashboard, BuyerDashboard };