import React from "react";

interface Card {
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
}

export const Card: React.FC<Card> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
     {children}
    </div>
  );
};

export const CardHeader: React.FC<Card> = ({
  children,
  className = "",
}) => {
  return (
      <div className={`px-6 py-5 ${className}`}>
        {children}
      </div>
  );
};

export const CardBody: React.FC<Card> = ({
    children,
    className = "",
}) => {
    return (
    <div className={`p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6 ${className}`}>
        <div className="space-y-6">
        {children}
        </div>
    </div>
    );
};