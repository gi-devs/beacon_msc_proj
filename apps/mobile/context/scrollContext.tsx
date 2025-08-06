import { createContext, useContext, useState } from 'react';

const ScrollContext = createContext<{
  hasScrolled: boolean;
  setHasScrolled: (val: boolean) => void;
}>({
  hasScrolled: false,
  setHasScrolled: () => {},
});

export const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  return (
    <ScrollContext.Provider value={{ hasScrolled, setHasScrolled }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useLogCreator must be used within a MoodLogProvider');
  }
  return context;
};
