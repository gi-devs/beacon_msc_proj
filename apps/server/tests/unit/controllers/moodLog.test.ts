import { UserPayload } from '@beacon/types';
import { moodLogService } from '../../../src/services/service.moodLog';
import { moodLogController } from '../../../src/controllers/controller.moodLog';

jest.mock('@/services/service.moodLog', () => ({
  moodLogService: {
    create: jest.fn(),
    getMoodLogsByUserId: jest.fn(),
    fetchMoodLogDetail: jest.fn(),
    fetchMoodLogByJournalEntryId: jest.fn(),
    fetchMoodLogAverage: jest.fn(),
    fetchMoodLogAverageMonths: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('moodLogController', () => {
  const moodLogData = {
    sadScale: 50,
    anxiousScale: 50,
    stressScale: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create mood log and return 201', async () => {
      const req: any = {
        user: { userId: 'u1' } as UserPayload,
        body: moodLogData,
      };
      const res = mockResponse();

      (moodLogService.create as jest.Mock).mockResolvedValue({
        id: 1,
        moodLogData,
      });

      await moodLogController.create(req, res, mockNext);

      expect(moodLogService.create).toHaveBeenCalledWith(moodLogData, 'u1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, moodLogData });
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' }, body: {} };
      const res = mockResponse();

      (moodLogService.create as jest.Mock).mockRejectedValue(
        new Error('db error'),
      );

      await moodLogController.create(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getManyByUserId', () => {
    it('should fetch mood logs with pagination', async () => {
      const req: any = {
        user: { userId: 'u1' },
        query: { take: '5', skip: '0' },
      };
      const res = mockResponse();

      (moodLogService.getMoodLogsByUserId as jest.Mock).mockResolvedValue([
        { id: 1 },
      ]);

      await moodLogController.getManyByUserId(req, res, mockNext);

      expect(moodLogService.getMoodLogsByUserId).toHaveBeenCalledWith(
        'u1',
        5,
        0,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
  });

  describe('getDetail', () => {
    it('should fetch detail by ID', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockResponse();

      (moodLogService.fetchMoodLogDetail as jest.Mock).mockResolvedValue({
        id: 1,
      });

      await moodLogController.getDetail(req, res, mockNext);

      expect(moodLogService.fetchMoodLogDetail).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('should call next with error if ID invalid', async () => {
      const req: any = { params: { id: 'abc' } };
      const res = mockResponse();

      await moodLogController.getDetail(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(moodLogService.fetchMoodLogDetail).not.toHaveBeenCalled();
    });
  });

  describe('getByJournalEntryId', () => {
    it('should fetch mood log by journal entry ID', async () => {
      const req: any = { params: { journalEntryId: '10' } };
      const res = mockResponse();

      (
        moodLogService.fetchMoodLogByJournalEntryId as jest.Mock
      ).mockResolvedValue({ id: 10 });

      await moodLogController.getByJournalEntryId(req, res, mockNext);

      expect(moodLogService.fetchMoodLogByJournalEntryId).toHaveBeenCalledWith(
        10,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 10 });
    });

    it('should call next with error if journalEntryId invalid', async () => {
      const req: any = { params: { journalEntryId: 'xyz' } };
      const res = mockResponse();

      await moodLogController.getByJournalEntryId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(
        moodLogService.fetchMoodLogByJournalEntryId,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getByMoodLogDateFilter', () => {
    it('should fetch mood log averages with filters', async () => {
      const req: any = {
        user: { userId: 'u1' },
        query: { months: '3', weeks: '1', days: '5' },
      };
      const res = mockResponse();

      (moodLogService.fetchMoodLogAverage as jest.Mock).mockResolvedValue([
        { avg: 5 },
      ]);

      await moodLogController.getByMoodLogDateFilter(req, res, mockNext);

      expect(moodLogService.fetchMoodLogAverage).toHaveBeenCalledWith(
        'u1',
        '3',
        '1',
        '5',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ avg: 5 }]);
    });
  });

  describe('getByMoodLogAveragesByMonth', () => {
    it('should fetch averages by month', async () => {
      const req: any = { user: { userId: 'u1' }, params: { months: '6' } };
      const res = mockResponse();

      (moodLogService.fetchMoodLogAverageMonths as jest.Mock).mockResolvedValue(
        [{ month: 'Jan', avg: 4 }],
      );

      await moodLogController.getByMoodLogAveragesByMonth(req, res, mockNext);

      expect(moodLogService.fetchMoodLogAverageMonths).toHaveBeenCalledWith(
        'u1',
        '6',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ month: 'Jan', avg: 4 }]);
    });
  });
});
