import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={`card ${paddingClasses[padding]} ${
        hover ? 'cursor-pointer hover:border-brand-primary/30' : ''
      } ${onClick ? 'w-full text-left' : ''} ${className}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-text-primary-light dark:text-text-primary-dark ${className}`}>
    {children}
  </h3>
);

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-text-secondary mt-1 ${className}`}>{children}</p>
);

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-border-light dark:border-border-dark ${className}`}>
    {children}
  </div>
);

export default Card;
