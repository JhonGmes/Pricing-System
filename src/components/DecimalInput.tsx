import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { parseNumber } from '../utils';

interface DecimalInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  precision?: number;
}

export const DecimalInput: React.FC<DecimalInputProps> = ({ value, onChange, precision, ...props }) => {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    if (!isFocused) {
      // If not focused, sync with prop value
      // Replace dot with comma for display (PT-BR friendly)
      setLocalValue(value !== undefined && value !== null ? value.toString().replace('.', ',') : '');
    }
  }, [value, isFocused]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    let parsed = parseNumber(localValue);
    
    if (isNaN(parsed)) {
      parsed = 0;
    }

    onChange(parsed);
    
    // Format local value on blur
    setLocalValue(parsed.toString().replace('.', ','));
    
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={e => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};
