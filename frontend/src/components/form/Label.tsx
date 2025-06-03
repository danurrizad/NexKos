import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  colorClass?: string;
  required?: boolean;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className, colorClass, required }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Default classes that apply by default
        `mb-1.5 block text-sm font-medium ${colorClass ? colorClass : 'text-gray-700 dark:text-gray-400'}`,

        // User-defined className that can override the default margin
        className
      )}
    >
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
};

export default Label;
