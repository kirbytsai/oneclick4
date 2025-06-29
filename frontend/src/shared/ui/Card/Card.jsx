// src/shared/ui/Card/Card.jsx
import './Card.css';

function Card({ 
  children, 
  title,
  subtitle,
  variant = 'default',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  headerAction,
  footer,
  ...props 
}) {
  const cardClass = [
    'card',
    `card--${variant}`,
    hoverable && 'card--hoverable',
    clickable && 'card--clickable',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className={cardClass}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="card__header">
          <div className="card__header-content">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {headerAction && (
            <div className="card__header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      
      <div className="card__body">
        {children}
      </div>
      
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;