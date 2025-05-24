import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
}) => {
  const baseClasses = 'p-4 rounded-md';
  
  const variantClasses = {
    info: 'bg-blue-50 text-blue-800',
    success: 'bg-success-50 text-success-800',
    warning: 'bg-warning-50 text-warning-800',
    error: 'bg-error-50 text-error-800',
  };
  
  const iconMap = {
    info: <Info className="h-5 w-5 text-blue-400" />,
    success: <CheckCircle className="h-5 w-5 text-success-400" />,
    warning: <AlertCircle className="h-5 w-5 text-warning-400" />,
    error: <XCircle className="h-5 w-5 text-error-400" />,
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {iconMap[variant]}
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;