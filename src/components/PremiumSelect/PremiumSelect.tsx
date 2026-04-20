import React, { useState, useRef, useEffect } from 'react';
import './PremiumSelect.scss';

interface Option {
  value: string;
  label: string;
}

interface PremiumSelectProps {
  value: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  error?: string;
  id?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const PremiumSelect: React.FC<PremiumSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select',
  className = '',
  error,
  id,
  style,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [disabled]);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  return (
    <div 
      id={id}
      className={`premium-select-container ${className} ${isOpen ? 'is-open' : ''} ${error ? 'is-invalid' : ''} ${disabled ? 'is-disabled' : ''}`}
      ref={dropdownRef}
      style={style}
    >
      <div 
        className="premium-select-trigger" 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <span className={`selected-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`bi bi-chevron-down arrow-icon ${isOpen ? 'rotate' : ''}`}></i>
      </div>

      {isOpen && (
        <div className="premium-select-dropdown">
          <ul className="premium-select-options" role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                className={`premium-select-option ${option.value === value ? 'is-selected' : ''}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};
