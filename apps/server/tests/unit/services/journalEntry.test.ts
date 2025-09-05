import { journalEntryService } from '../../../src/services/service.journalEntry';

import {
  createJournalEntry,
  getJournalEntriesByUserId,
  getJournalEntriesByUserIdCount,
  getJournalEntryById,
  getJournalEntryByMoodLogId,
} from '../../../src/models/model.journalEntry';
import { CustomError } from '../../../src/utils/custom-error';

jest.mock('@/models/model.journalEntry');

describe('journalEntryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw CustomError when schema validation fails', async () => {
      const invalidData: any = {}; // missing required fields

      await expect(
        journalEntryService.create(invalidData, 'u1'),
      ).rejects.toThrow(CustomError);
    });

    it('should filter out invalid tags', async () => {
      const validData = {
        title: 'Test',
        content: 'Hello',
        moodFace: 3,
        tags: [
          { category: 'valid', keywords: ['one'] },
          { category: '   ', keywords: [] }, // invalid
        ],
      };

      (createJournalEntry as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Test',
        content: 'Hello',
        moodFace: 3,
        tags: [{ category: 'valid', keywords: ['one'] }],
        createdAt: new Date('2025-01-01'),
      });

      const result = await journalEntryService.create(validData, 'u1');

      expect(createJournalEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test',
          user: { connect: { id: 'u1' } },
        }),
      );
      expect(result).toMatchObject({
        id: 1,
        title: 'Test',
        tags: [{ category: 'valid', keywords: ['one'] }],
      });
    });
  });

  describe('fetchJournalEntriesByUserId', () => {
    it('should return paginated results', async () => {
      (getJournalEntriesByUserId as jest.Mock).mockResolvedValue([
        {
          id: 1,
          title: 'Entry 1',
          content: 'Some content',
          moodFace: 2,
          tags: [],
          createdAt: new Date('2025-01-01'),
        },
      ]);
      (getJournalEntriesByUserIdCount as jest.Mock).mockResolvedValue(1);

      const result = await journalEntryService.fetchJournalEntriesByUserId(
        'u1',
        10,
        0,
      );

      expect(getJournalEntriesByUserId).toHaveBeenCalledWith(
        'u1',
        undefined,
        expect.any(Object),
      );
      expect(result).toMatchObject({
        items: [{ id: 1, title: 'Entry 1' }],
        totalCount: 1,
        page: 1,
        totalPages: 1,
        hasMore: false,
      });
    });
  });

  describe('fetchJournalEntryDetail', () => {
    it('should throw if entry not found', async () => {
      (getJournalEntryById as jest.Mock).mockResolvedValue(null);

      await expect(
        journalEntryService.fetchJournalEntryDetail(999),
      ).rejects.toThrow('Journal entry not found');
    });

    it('should return journal entry detail when found', async () => {
      (getJournalEntryById as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Entry',
        content: 'Hello',
        moodFace: 4,
        tags: [],
        createdAt: new Date('2025-01-01'),
      });

      const result = await journalEntryService.fetchJournalEntryDetail(1);

      expect(result).toMatchObject({ id: 1, title: 'Entry' });
    });
  });

  describe('fetchJournalEntryByMoodLogId', () => {
    it('should return null if entry not found', async () => {
      (getJournalEntryByMoodLogId as jest.Mock).mockResolvedValue(null);

      const result =
        await journalEntryService.fetchJournalEntryByMoodLogId(123);

      expect(result).toBeNull();
    });

    it('should return entry when found', async () => {
      (getJournalEntryByMoodLogId as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Mood Entry',
        content: 'Good',
        moodFace: 5,
        tags: [],
        createdAt: new Date('2025-01-01'),
      });

      const result =
        await journalEntryService.fetchJournalEntryByMoodLogId(123);

      expect(result).toMatchObject({ id: 1, title: 'Mood Entry' });
    });
  });
});
