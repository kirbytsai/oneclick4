// src/shared/ui/Badge/Badge.jsx
import './Badge.css';

// 狀態映射配置
const STATUS_CONFIG = {
  // Proposal 狀態
  draft: { variant: 'neutral', label: '草稿' },
  under_review: { variant: 'warning', label: '審核中' },
  approved: { variant: 'success', label: '已通過' },
  rejected: { variant: 'danger', label: '已拒絕' },
  archived: { variant: 'neutral', label: '已歸檔' },
  
  // Case 狀態
  created: { variant: 'info', label: '已建立' },
  interested: { variant: 'primary', label: '有興趣' },
  nda_signed: { variant: 'success', label: '已簽NDA' },
  in_negotiation: { variant: 'warning', label: '洽談中' },
  completed: { variant: 'success', label: '已完成' },
  cancelled: { variant: 'neutral', label: '已取消' },
  
  // 用戶角色
  admin: { variant: 'primary', label: '管理員' },
  buyer: { variant: 'info', label: '買方' },
  seller: { variant: 'success', label: '賣方' },
  
  // 通用狀態
  active: { variant: 'success', label: '啟用' },
  inactive: { variant: 'neutral', label: '停用' },
  pending: { variant: 'warning', label: '待處理' },
  error: { variant: 'danger', label: '錯誤' }
};

function Badge({ 
  children,
  variant = 'default',
  size = 'medium',
  status, // 狀態自動映射
  dot = false,
  className = '',
  ...props 
}) {
  // 如果提供了 status，自動設置 variant 和 label
  let finalVariant = variant;
  let finalLabel = children;
  
  if (status && STATUS_CONFIG[status]) {
    finalVariant = STATUS_CONFIG[status].variant;
    finalLabel = finalLabel || STATUS_CONFIG[status].label;
  }

  const badgeClass = [
    'badge',
    `badge--${finalVariant}`,
    `badge--${size}`,
    dot && 'badge--dot',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClass} {...props}>
      {dot && <span className="badge__dot"></span>}
      {finalLabel}
    </span>
  );
}

export default Badge;