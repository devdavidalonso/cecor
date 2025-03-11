// components/RadioGroup.js
import React from 'react';

const RadioGroup = ({ 
  name, 
  options, 
  value, 
  onChange, 
  required = false, 
  orientation = 'vertical' 
}) => {
  return (
    <div className={`space-y-3 ${orientation === 'horizontal' ? 'sm:space-y-0 sm:flex sm:space-x-6' : ''}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-start">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            required={required}
            className="mt-1 h-4 w-4 text-primary border-gray-300 focus:ring-primary"
          />
          <label 
            htmlFor={`${name}-${option.value}`}
            className="ml-2 block text-gray-700 cursor-pointer"
          >
            {option.label}
            {option.info && (
              <span className="block text-sm text-gray-500 mt-1">{option.info}</span>
            )}
          </label>
        </div>
      ))}
    </div>
  );
};

export default RadioGroup;