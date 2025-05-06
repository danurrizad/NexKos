'use client'
import React, { createContext, useContext, useState, ReactNode } from "react";
import Alert from "@/components/ui/alert/Alert";

type AlertVariant = "success" | "error" | "warning" | "info";

export interface AlertItem {
  id: string;
  variant: AlertVariant;
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}

interface AlertContextProps {
  showAlert: (alert: Omit<AlertItem, "id">) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = (alert: Omit<AlertItem, "id">) => {
    const newAlert = { ...alert, id: new Date().toISOString() };
    setAlerts((prev) => [...prev, newAlert]);

    // Auto-remove after 5 seconds (optional)
    setTimeout(() => {
      removeAlert(newAlert.id);
    }, 5000);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert }}>
      {children}
      <div className={`fixed ${ !alerts ? "-top-10" : "top-5"} right-5 flex flex-col gap-2 z-999999 w-[400px] duration-1000 transition-all`}>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
            showLink={alert.showLink}
            linkHref={alert.linkHref}
            linkText={alert.linkText}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};
