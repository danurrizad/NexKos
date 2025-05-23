import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/icons";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  showPlaceholder?: boolean;
  error?: boolean
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  showPlaceholder = true,
  error
}) => {
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set default selected label
  useEffect(() => {
    if (defaultValue) {
      const defaultOption = options.find((opt) => opt.value === defaultValue);
      if (defaultOption) {
        setSelectedLabel(defaultOption.label);
      }
    }
  }, [defaultValue, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedLabel(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  const errorClass = " text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500"

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${error && errorClass} h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white px-4 py-2.5 text-left text-sm shadow-theme-xs focus:border-primary1-300 focus:outline-hidden focus:ring-3 focus:ring-primary1/30 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${selectedLabel ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"}`}
      >
        {selectedLabel || (showPlaceholder ? placeholder : "")}
        <span className={`absolute right-3 top-3 transition-all duration-200 ${isOpen && "rotate-180"}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {showPlaceholder && (
            <li
              className="cursor-not-allowed px-4 py-2 text-gray-400 dark:text-gray-500"
            >
              {placeholder}
            </li>
          )}
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`${selectedLabel === option.label && "bg-primary1-50"} cursor-pointer px-4 py-2 text-gray-700 ${selectedLabel !== option.label && "hover:bg-primary1-50/[0.5] dark:hover:bg-brand-800/30"} dark:text-gray-200 `}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
