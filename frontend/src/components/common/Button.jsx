// src/components/common/Button.jsx
import Link from 'next/link';
import { forwardRef } from 'react';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
  success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
  info: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
};

const sizes = {
  sm: 'py-1 px-2 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-3 px-6 text-lg',
};

// Componente Button com ref encaminhado
const Button = forwardRef(({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  loadingText = 'Carregando...',
  href,
  onClick,
  ...props
}, ref) => {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  
  // Extrair a cor do anel de foco da variante
  const focusRingColor = variantClass.includes('focus:ring-') 
    ? '' 
    : 'focus:ring-indigo-500';
  
  const classes = `
    ${variantClass}
    ${sizeClass}
    rounded-md
    font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2 ${focusRingColor}
    transition duration-150 ease-in-out
    ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  // Conteúdo do botão
  const content = isLoading ? (
    <div className="flex items-center justify-center">
      <svg 
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>{loadingText}</span>
    </div>
  ) : children;
  
  // Se href for fornecido, renderize um Link
  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        ref={ref}
        {...props}
        onClick={(e) => {
          if (disabled || isLoading) {
            e.preventDefault();
            return;
          }
          
          onClick?.(e);
        }}
        aria-disabled={disabled || isLoading}
      >
        {content}
      </Link>
    );
  }
  
  // Caso contrário, renderize um botão normal
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      ref={ref}
      aria-busy={isLoading}
      {...props}
    >
      {content}
    </button>
  );
});

// Adicione um displayName para ajudar na depuração
Button.displayName = 'Button';

export default Button;