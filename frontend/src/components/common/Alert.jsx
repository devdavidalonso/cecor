import { useState, useEffect } from 'react';
import { HiCheckCircle, HiExclamation, HiInformationCircle, HiX } from 'react-icons/hi';

// Tipos de alerta
const TYPES = {
  success: {
    icon: HiCheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-800',
    iconColor: 'text-green-400',
  },
  error: {
    icon: HiExclamation,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    textColor: 'text-red-800',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: HiExclamation,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-400',
  },
  info: {
    icon: HiInformationCircle,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-400',
  },
};

const Alert = ({ 
  message, 
  type = 'info', 
  onClose,
  autoClose = false,
  autoCloseTime = 5000,
  showIcon = true,
  className = '', 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const alertType = TYPES[type] || TYPES.info;
  const Icon = alertType.icon;
  
  useEffect(() => {
    let timer;
    // Se autoClose estiver habilitado, fechar o alerta após o tempo definido
    if (autoClose && isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoClose, autoCloseTime, isVisible, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div className={`${alertType.bgColor} border ${alertType.borderColor} ${alertType.textColor} px-4 py-3 rounded relative mb-4 ${className}`} role="alert">
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${alertType.iconColor}`} aria-hidden="true" />
          </div>
        )}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1 pt-0.5`}>
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 ${alertType.textColor} hover:bg-opacity-20 hover:bg-gray-300 focus:outline-none`}
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
              >
                <span className="sr-only">Fechar</span>
                <HiX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;