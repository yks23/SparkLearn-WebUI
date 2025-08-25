import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ErrorNotification = ({ error, onClose, onAction }) => {
  if (!error) return null;

  const getErrorIcon = (errorType) => {
    switch (errorType) {
      case 'auth_error':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />;
      case 'quota_error':
        return <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />;
      case 'network_error':
        return <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />;
      default:
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />;
    }
  };

  const getErrorColor = (errorType) => {
    switch (errorType) {
      case 'auth_error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'quota_error':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'network_error':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 max-w-md w-full p-4 rounded-lg border shadow-lg z-50 ${getErrorColor(error.errorType)}`}>
      <div className="flex items-start gap-3">
        {getErrorIcon(error.errorType)}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">
              {error.title || '处理失败'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm mb-3">
            {error.description || error.message}
          </p>
          
          {error.solutions && error.solutions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-2">解决方案:</p>
              <ul className="text-xs space-y-1">
                {error.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {error.errorType === 'auth_error' && (
            <button
              onClick={() => onAction && onAction('goToConfig')}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
            >
              前往API配置
            </button>
          )}
          
          {error.originalError && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                查看详细错误信息
              </summary>
              <pre className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded overflow-auto">
                {error.originalError}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;
