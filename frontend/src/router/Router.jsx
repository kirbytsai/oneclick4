// src/router/Router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Auth Components
import LoginPage from '../domains/auth/components/LoginPage';
import RegisterPage from '../domains/auth/components/RegisterPage';
import UserProfilePage from '../domains/auth/components/UserProfilePage';

// Proposal Components
import ProposalListPage from '../domains/proposal/components/ProposalListPage';
import CreateProposalPage from '../domains/proposal/components/CreateProposalPage';
import ProposalDetailPage from '../domains/proposal/components/ProposalDetailPage';
import EditProposalPage from '../domains/proposal/components/EditProposalPage';

// Admin Proposal Components
import ProposalReviewListPage from '../domains/proposal/components/ProposalReviewListPage';
import ProposalReviewDetailPage from '../domains/proposal/components/ProposalReviewDetailPage';

// Case Components
import CaseListPage from '../domains/case/components/CaseListPage';
import CreateCasePage from '../domains/case/components/CreateCasePage';
import CaseDetailPage from '../domains/case/components/CaseDetailPage';

// Dashboard Components
import { AdminDashboard, SellerDashboard, BuyerDashboard } from '../pages/Dashboard';

// Protection Components
import ProtectedRoute from '../components/routing/ProtectedRoute';

// Dashboard Redirect Component
function DashboardRedirect() {
  // 這個組件會根據用戶角色重定向到對應的 dashboard
  return <Navigate to="/redirect-dashboard" replace />;
}

// 動態重定向處理組件
import { useAuth } from '../domains/auth/contexts/AuthContext';

function DynamicDashboardRedirect() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const dashboardPath = `/${user.role}/dashboard`;
  return <Navigate to={dashboardPath} replace />;
}

// 暫時的佔位頁面
function ComingSoonPage({ title }) {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '60px 20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>{title}</h1>
      <p>此功能正在開發中，敬請期待！</p>
    </div>
  );
}

// 路由配置
export const router = createBrowserRouter([
  // 公開路由
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register', 
    element: <RegisterPage />
  },

  // 需要登入的路由
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // 根路徑重定向到 dashboard
      {
        index: true,
        element: <DynamicDashboardRedirect />
      },
      
      // Dashboard 重定向
      {
        path: 'dashboard',
        element: <DynamicDashboardRedirect />
      },

      // 個人資料 (所有角色)
      {
        path: 'profile',
        element: <UserProfilePage />
      },

      // 管理員專區
      {
        path: 'admin',
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            )
          },
          {
            path: 'users',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ComingSoonPage title="用戶管理" />
              </ProtectedRoute>
            )
          },
          // 管理員提案審核功能
          {
            path: 'proposals',
            children: [
              // 審核列表
              {
                index: true,
                element: (
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProposalReviewListPage />
                  </ProtectedRoute>
                )
              },
              // 審核詳情
              {
                path: ':id',
                element: (
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProposalReviewDetailPage />
                  </ProtectedRoute>
                )
              }
            ]
          }
        ]
      },

      // 賣方專區
      {
        path: 'seller',
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            )
          }
        ]
      },

      // 買方專區
      {
        path: 'buyer',
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            )
          }
        ]
      },

      // 提案功能路由 (共用)
      {
        path: 'proposals',
        children: [
          // 提案列表 (所有登入用戶)
          {
            index: true,
            element: <ProposalListPage />
          },
          // 建立新提案 (僅賣方)
          {
            path: 'new',
            element: (
              <ProtectedRoute allowedRoles={['seller']}>
                <CreateProposalPage />
              </ProtectedRoute>
            )
          },
          // 提案詳情 (所有登入用戶)
          {
            path: ':id',
            element: <ProposalDetailPage />
          },
          // 編輯提案 (僅賣方，且僅自己的提案)
          {
            path: ':id/edit',
            element: (
              <ProtectedRoute allowedRoles={['seller']}>
                <EditProposalPage />
              </ProtectedRoute>
            )
          }
        ]
      },

      // 案例功能路由 (共用) ⭐ 新增
      {
        path: 'cases',
        children: [
          // 案例列表 (賣方和買方都可以，但看到不同內容)
          {
            index: true,
            element: (
              <ProtectedRoute allowedRoles={['seller', 'buyer']}>
                <CaseListPage />
              </ProtectedRoute>
            )
          },
          // 建立新案例 (僅賣方)
          {
            path: 'new',
            element: (
              <ProtectedRoute allowedRoles={['seller']}>
                <CreateCasePage />
              </ProtectedRoute>
            )
          },
          // 案例詳情 (案例相關的買賣雙方)
          {
            path: ':id',
            element: (
              <ProtectedRoute allowedRoles={['seller', 'buyer']}>
                <CaseDetailPage />
              </ProtectedRoute>
            )
          }
        ]
      }
    ]
  },

  // 404 處理
  {
    path: '*',
    element: (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1>404 - 頁面不存在</h1>
        <p>您訪問的頁面不存在</p>
      </div>
    )
  }
]);