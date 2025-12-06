import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption<T> {
  value: T;
  label: string;
  description?: string;
}

export interface DropdownProps<T> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  /** Custom render function for the selected value display */
  renderSelected?: (value: T) => React.ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Open dropdown upward instead of downward */
  openUpward?: boolean;
}

/**
 * Reusable dropdown component with Gruvbox styling.
 * Supports generic value types and optional descriptions.
 */
export function Dropdown<T>({
  value,
  options,
  onChange,
  renderSelected,
  className = '',
  openUpward = false
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback((optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);

  const handleBackdropClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Find the selected option to display its label
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = renderSelected 
    ? renderSelected(value) 
    : selectedOption?.label ?? String(value);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleOpen}
        className="w-full bg-[#2f2f2f] text-[#d5c4a1] px-4 py-2 rounded-md font-medium hover:bg-[#313131] focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none transition-colors flex items-center justify-between"
      >
        <span>{displayValue}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-[5]" 
            onClick={handleBackdropClick} 
          />
          
          {/* Dropdown menu */}
          <div className={`absolute w-full bg-[#242424] rounded-md shadow-lg border border-[#2f2f2f] overflow-hidden z-10 ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
            {options.map((option, idx) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'bg-[#2f2f2f] text-[#C6A85B]'
                      : 'text-[#d5c4a1] hover:bg-[#2f2f2f]'
                  }`}
                >
                  <div>{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-[#665c54]">{option.description}</div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Dropdown;

