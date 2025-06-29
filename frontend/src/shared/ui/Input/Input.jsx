// src/shared/ui/Input/Input.jsx
import './Input.css';

function Input({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  size = 'medium',
  icon,
  ...props 
}) {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClass = [
    'input-field',
    `input-field--${size}`,
    error && 'input-field--error',
    disabled && 'input-field--disabled',
    icon && 'input-field--with-icon',
    className
  ].filter(Boolean).join(' ');

  const containerClass = [
    'input-container',
    disabled && 'input-container--disabled'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value, e)}
          disabled={disabled}
          className={inputClass}
          {...props}
        />
      </div>
      
      {error && (
        <span className="input-error">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
}

export default Input;