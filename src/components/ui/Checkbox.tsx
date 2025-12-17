import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 11)}`;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`w-4 h-4 rounded border-border-light dark:border-border-dark bg-white dark:bg-slate-900 text-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:ring-offset-0 cursor-pointer transition-colors ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-text-secondary">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
