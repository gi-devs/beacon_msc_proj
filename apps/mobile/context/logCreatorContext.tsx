import React, { createContext, useContext, useState } from 'react';
import { CreateMoodLogData } from '@beacon/validation';
import { createMoodLogRequest } from '@/api/moodLogApi';

type LogCreatorContextType = {
  createMoodLogData: CreateMoodLogData;
  setCreateMoodLogData: (data: CreateMoodLogData) => void;
  resetCreateMoodLogData: () => void;
};

type LogCreatorProviderProps = {
  children: React.ReactNode;
};

export const MoodLogProvider: React.FC<LogCreatorProviderProps> = ({
  children,
}) => {
  const [createMoodLogData, setCreateMoodLogData] = useState<CreateMoodLogData>(
    {
      stressScale: 0,
      anxietyScale: 0,
      sadnessScale: 0,
      stressNote: '',
      anxietyNote: '',
      sadnessNote: '',
    },
  );

  const resetCreateMoodLogData = () => {
    setCreateMoodLogData({
      stressScale: 0,
      anxietyScale: 0,
      sadnessScale: 0,
      stressNote: '',
      anxietyNote: '',
      sadnessNote: '',
    });
  };

  return (
    <LogCreatorContext.Provider
      value={{
        createMoodLogData,
        setCreateMoodLogData,
        resetCreateMoodLogData,
      }}
    >
      {children}
    </LogCreatorContext.Provider>
  );
};

const LogCreatorContext = createContext<LogCreatorContextType | undefined>(
  undefined,
);

export const useLogCreator = () => {
  const context = useContext(LogCreatorContext);
  if (context === undefined) {
    throw new Error('useLogCreator must be used within a LogCreatorProvider');
  }
  return context;
};
