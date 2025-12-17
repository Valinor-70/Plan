import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
    
    const hasIcon = !!icon;
    const iconPaddingClass = hasIcon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : '';
    
    const errorClass = error
      ? 'border-error focus:border-error focus:ring-error/20'
      : '';
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 text-text-tertiary ${
                iconPosition === 'left' ? 'left-3' : 'right-3'
              }`}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input ${iconPaddingClass} ${errorClass} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-sm text-text-tertiary"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
