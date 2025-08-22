import React, { createContext, useContext, useState } from 'react';

type UIContextType = {
  openingScreen: {
    hasAnimated: boolean;
    setHasAnimated: (value: boolean) => void;
  };
  navbar: {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
  };
};

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);

  const value: UIContextType = {
    openingScreen: {
      hasAnimated,
      setHasAnimated,
    },
    navbar: {
      isVisible: isNavbarVisible,
      setIsVisible: setIsNavbarVisible,
    },
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
