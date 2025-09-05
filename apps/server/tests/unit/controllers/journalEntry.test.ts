import { UserPayload } from '@beacon/types';
import { journalEntryService } from '../../../src/services/service.journalEntry';
import { journalEntryController } from '../../../src/controllers/controller.journalEntry';

jest.mock('@/services/service.journalEntry', () => ({
  journalEntryService: {
    create: jest.fn(),
    fetchJournalEntriesByUserId: jest.fn(),
    fetchJournalEntryDetail: jest.fn(),
    fetchJournalEntryByMoodLogId: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('journalEntryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a journal entry and return 201', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        body: { content: 'something' },
      };
      const res = mockResponse();

      (journalEntryService.create as jest.Mock).mockResolvedValue({
        id: 1,
        content: 'something',
      });

      await journalEntryController.create(req, res, mockNext);

      expect(journalEntryService.create).toHaveBeenCalledWith(
        { content: 'something' },
        'u1',
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, content: 'something' });
    });

    it('should call next on error', async () => {
      const req: any = {
        user: { userId: 'u1' },
        body: { content: 'something' },
      };
      const res = mockResponse();

      (journalEntryService.create as jest.Mock).mockRejectedValue(
        new Error('db error'),
      );

      await journalEntryController.create(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getManyByUserId', () => {
    it('should fetch entries with pagination and return 200', async () => {
      const req: any = {
        user: { userId: 'u1' },
        query: { take: '5', skip: '0' },
      };
      const res = mockResponse();

      (
        journalEntryService.fetchJournalEntriesByUserId as jest.Mock
      ).mockResolvedValue([{ id: 1, content: 'entry1' }]);

      await journalEntryController.getManyByUserId(req, res, mockNext);

      expect(
        journalEntryService.fetchJournalEntriesByUserId,
      ).toHaveBeenCalledWith('u1', 5, 0);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, content: 'entry1' }]);
    });

    it('should default to 10/0 pagination if query missing', async () => {
      const req: any = { user: { userId: 'u1' }, query: {} };
      const res = mockResponse();

      (
        journalEntryService.fetchJournalEntriesByUserId as jest.Mock
      ).mockResolvedValue([]);

      await journalEntryController.getManyByUserId(req, res, mockNext);

      expect(
        journalEntryService.fetchJournalEntriesByUserId,
      ).toHaveBeenCalledWith('u1', 10, 0);
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' }, query: {} };
      const res = mockResponse();

      (
        journalEntryService.fetchJournalEntriesByUserId as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await journalEntryController.getManyByUserId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getDetail', () => {
    it('should fetch entry detail and return 200', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockResponse();

      (
        journalEntryService.fetchJournalEntryDetail as jest.Mock
      ).mockResolvedValue({ id: 1, content: 'entry1' });

      await journalEntryController.getDetail(req, res, mockNext);

      expect(journalEntryService.fetchJournalEntryDetail).toHaveBeenCalledWith(
        1,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1, content: 'entry1' });
    });

    it('should call next with error if id invalid', async () => {
      const req: any = { params: { id: 'abc' } };
      const res = mockResponse();

      await journalEntryController.getDetail(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(
        journalEntryService.fetchJournalEntryDetail,
      ).not.toHaveBeenCalled();
    });

    it('should call next on service error', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockResponse();

      (
        journalEntryService.fetchJournalEntryDetail as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await journalEntryController.getDetail(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getByMoodLogId', () => {
    it('should fetch entry by moodLogId and return 200', async () => {
      const req: any = { params: { id: '5' } };
      const res = mockResponse();

      (
        journalEntryService.fetchJournalEntryByMoodLogId as jest.Mock
      ).mockResolvedValue({ id: 5, mood: 'happy' });

      await journalEntryController.getByMoodLogId(req, res, mockNext);

      expect(
        journalEntryService.fetchJournalEntryByMoodLogId,
      ).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 5, mood: 'happy' });
    });

    it('should call next with error if moodLogId invalid', async () => {
      const req: any = { params: { id: 'xyz' } };
      const res = mockResponse();

      await journalEntryController.getByMoodLogId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(
        journalEntryService.fetchJournalEntryByMoodLogId,
      ).not.toHaveBeenCalled();
    });

    it('should call next on service error', async () => {
      const req: any = { params: { id: '5' } };
      const res = mockResponse();

      (
        journalEntryService.fetchJournalEntryByMoodLogId as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await journalEntryController.getByMoodLogId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
