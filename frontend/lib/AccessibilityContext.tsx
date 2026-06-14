"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AccessibilityContextType {
  elderMode: boolean;
  toggleElderMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [elderMode, setElderMode] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("elderMode");
    if (saved === "true") {
      setElderMode(true);
    }
  }, []);

  const toggleElderMode = () => {
    setElderMode((prev) => {
      const next = !prev;
      localStorage.setItem("elderMode", String(next));
      return next;
    });
  };

  return (
    <AccessibilityContext.Provider value={{ elderMode, toggleElderMode }}>
      <div className={elderMode ? "elder-mode font-sans text-xl antialiased select-text contrast-125" : "font-sans antialiased"}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
