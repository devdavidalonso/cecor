// components/TextInput.js
import React from 'react';

const TextInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  required = false,
  placeholder = '',
  error = null,
  mask = null
}) => {
  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Apply mask if provided
    if (mask && newValue) {
      if (mask === 'cpf') {
        // Format as CPF: 000.000.000-00
        newValue = newValue
          .replace(/\D/g, '')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
          .slice(0, 14);
      } else if (mask === 'phone') {
        // Format as phone: (00) 00000-0000
        newValue = newValue
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2')
          .slice(0, 15);
      } else if (mask === 'cep') {
        // Format as CEP: 00000-000
        newValue = newValue
          .replace(/\D/g, '')
          .replace(/(\d{5})(\d)/, '$1-$2')
          .slice(0, 9);
      } else if (mask === 'date') {
        // Format as date: dd/mm/yy
        newValue = newValue
          .replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '$1/$2')
          .replace(/(\d{2})(\d)/, '$1/$2')
          .slice(0, 8);
      }
    }
    
    onChange(newValue);
  };

  return (
    <div className="mb-4">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary`}
      />
      {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default TextInput;