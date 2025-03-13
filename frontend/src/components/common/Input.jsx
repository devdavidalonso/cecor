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
    return (
      <div className={`mb-4 ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className={`block text-gray-700 text-sm font-medium mb-1 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            placeholder-gray-400
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-500' : ''}
            ${inputClassName}
          `}
          {...props}
        />
        {error && (
          <p className={`mt-1 text-sm text-red-600 ${errorClassName}`}>
            {error}
          </p>
        )}
      </div>
    );
  };
  
  export default Input;