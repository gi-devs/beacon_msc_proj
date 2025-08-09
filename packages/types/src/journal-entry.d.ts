type JournalEntryDTO = {
  id: number;
  title: string;
  content: string;
  moodFace: number;
  tags?: JournalEntryTags[];
  createdAt: Date;
};

type JournalEntryTags = {
  category: string;
  keywords: string[];
};
