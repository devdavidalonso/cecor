// components/RadioGroup.js
import React from 'react';
import '../styles/RadioGroup.css';

const RadioGroup = ({ 
  name, 
  options, 
  value, 
  onChange, 
  required = false, 
  orientation = 'vertical' 
}) => {
  return (
    <div className={`radio-group ${orientation}`}>
      {options.map((option) => (
        <div key={option.value} className="radio-option">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            required={required}
          />
          <label htmlFor={`${name}-${option.value}`}>
            {option.label}
            {option.info && <span className="option-info">{option.info}</span>}
          </label>
        </div>
      ))}
    </div>
  );
};

export default RadioGroup;
