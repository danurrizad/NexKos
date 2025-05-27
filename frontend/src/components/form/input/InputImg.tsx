import Image from "next/image";
import React, { FC, useEffect, useRef, useState } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  initialPreviewUrl?: string; // 🔹 new prop
}

const InputImg: FC<InputProps> = ({
  type = "file",
  id,
  name,
  placeholder,
  defaultValue,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  initialPreviewUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl ? initialPreviewUrl : null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFileInput = type === "file";

  useEffect(() => {
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [initialPreviewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFileInput && e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
    onChange?.(e);
  };

  const clearFile = () => {
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear file input
    }
    setPreviewUrl(null);
    onChange?.({
      target: { name, value: null },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  let inputClasses = `h-11 w-full rounded-lg border disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500`;
  } else if (success) {
    inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300  dark:text-success-400 dark:border-success-500`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-primary1-300 focus:ring-3 focus:ring-primary1/30 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <div className={`relative border-2 border-gray-200 rounded-lg`}>
        {/* Preview Image & Delete Button */}
        {isFileInput && previewUrl && (
          <div className="relative inset-0  overflow-hidden pointer-events-none p-5">
            <Image
              src={previewUrl}
              alt="Preview"
              className="object-cover w-full h-full pointer-events-none"
              width={600}
              height={800}
              loading="lazy"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs rounded-full px-2 py-0.5 pointer-events-auto"
            >
              ×
            </button>
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={inputClasses}
          ref={inputRef}
          accept={isFileInput ? "image/*" : undefined}
        />
      </div>

      {/* Optional Hint Text */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default InputImg;
