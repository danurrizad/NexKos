import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/icons";
import Spinner from "../ui/spinner/Spinner";

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
  error?: boolean;
  isLoading?: boolean;
  isDisable?: boolean;
  showSearch?: boolean;
  placeholderInput?: string;
  onSearchChange?: (queryValue: string) => void
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  showPlaceholder = true,
  error,
  isLoading,
  isDisable,
  showSearch,
  placeholderInput,
  onSearchChange
}) => {
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option?.label?.toLowerCase()?.includes(search.toLowerCase())
  ) || options;

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
        setSearch(""); // Reset search when closing
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    if(onSearchChange){
      onSearchChange(e.target.value)
    }
  }

  const handleSelect = (option: Option) => {
    setSelectedLabel(option.label);
    onChange(option.value);
    setIsOpen(false);
    setSearch(""); // Reset search after selection
  };

  const errorClass = " text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isDisable}
        className={`${error && errorClass} disabled:cursor-not-allowed disabled:bg-gray-100 h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white px-4 py-2.5 text-left text-sm shadow-theme-xs focus:border-primary1-300 focus:outline-hidden focus:ring-3 focus:ring-primary1/30 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${selectedLabel ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"}`}
      >
        {selectedLabel || (showPlaceholder ? placeholder : "")}
        <span className={`absolute right-3 top-3 transition-all duration-200 ${isOpen && "rotate-180"}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-999 mt-1 w-full rounded-lg border border-gray-200 bg-white text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Search Input */}
          { showSearch && (
            <div className="px-4 py-2">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                autoFocus
                placeholder={placeholderInput}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-primary1-300 focus:ring-2 focus:ring-primary1/30 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}

          {/* Options */}
          <ul className="max-h-60 overflow-auto">
            {isLoading ? (
              <div className="flex justify-center py-2">
                <Spinner />
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 cursor-pointer ${
                    selectedLabel === option.label ? "bg-primary1-50" : ""
                  } hover:bg-primary1-50/[0.5] dark:hover:bg-brand-800/30 text-gray-700 dark:text-gray-200`}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-400 dark:text-gray-500">
                Pilihan tidak ditemukan
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;
