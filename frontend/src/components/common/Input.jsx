const Input = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  className = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  disabled = false,
  required = false,
  ...props
}) => {
  // Gerar ID único se não for fornecido
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Classes dinamicamente geradas para melhor legibilidade
  const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    placeholder-gray-400
    ${error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
    }
    ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
    focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors
    ${inputClassName}
  `;
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-gray-700 text-sm font-medium mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(obrigatório)</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p 
          id={`${inputId}-error`}
          className={`mt-1 text-sm text-red-600 ${errorClassName}`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;