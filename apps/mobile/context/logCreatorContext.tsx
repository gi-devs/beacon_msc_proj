import React, { createContext, useContext, useState } from 'react';
import { CreateJournalEntryData, CreateMoodLogData } from '@beacon/validation';

type LogCreatorContextType = {
  createMoodLogData: CreateMoodLogData;
  setCreateMoodLogData: (data: CreateMoodLogData) => void;
  resetCreateMoodLogData: () => void;
  createJournalEntryData: CreateJournalEntryData;
  setCreateJournalEntryData: (data: CreateJournalEntryData) => void;
  resetCreateJournalEntryData: () => void;

  // reset all
  resetAllCreateData: () => void;
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
  const [createJournalEntryData, setCreateJournalEntryData] =
    useState<CreateJournalEntryData>({
      title: '',
      content: '',
      moodFace: 0,
      tags: [],
    });

  const resetCreateJournalEntryData = () => {
    setCreateJournalEntryData({
      title: '',
      content: '',
      moodFace: 0,
      tags: [],
    });
  };

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

  const resetAllCreateData = () => {
    resetCreateMoodLogData();
    resetCreateJournalEntryData();
  };

  return (
    <LogCreatorContext.Provider
      value={{
        createMoodLogData,
        setCreateMoodLogData,
        resetCreateMoodLogData,
        createJournalEntryData,
        setCreateJournalEntryData,
        resetCreateJournalEntryData,
        resetAllCreateData,
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
