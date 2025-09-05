import { UserPayload } from '@beacon/types';
import { locationSettingService } from '../../../src/services/service.locationSetting';
import { locationSettingController } from '../../../src/controllers/controller.locationSetting';

jest.mock('@/services/service.locationSetting', () => ({
  locationSettingService: {
    fetchUserLocationSetting: jest.fn(),
    createUserLocationSetting: jest.fn(),
    updateUserLocationSetting: jest.fn(),
    deleteUserLocationSetting: jest.fn(),
    fetchIntersectingUsers: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('locationSettingController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUserId', () => {
    it('should fetch location setting and return 200', async () => {
      const req: any = { user: { userId: 'u1' } as UserPayload };
      const res = mockResponse();

      (
        locationSettingService.fetchUserLocationSetting as jest.Mock
      ).mockResolvedValue({ id: 'l1' });

      await locationSettingController.getByUserId(req, res, mockNext);

      expect(
        locationSettingService.fetchUserLocationSetting,
      ).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'l1' });
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' } };
      const res = mockResponse();

      (
        locationSettingService.fetchUserLocationSetting as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await locationSettingController.getByUserId(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('create', () => {
    it('should create location setting and return 201', async () => {
      const req: any = { user: { userId: 'u1' }, body: { lat: 1, lng: 2 } };
      const res = mockResponse();

      (
        locationSettingService.createUserLocationSetting as jest.Mock
      ).mockResolvedValue({ id: 'l2' });

      await locationSettingController.create(req, res, mockNext);

      expect(
        locationSettingService.createUserLocationSetting,
      ).toHaveBeenCalledWith({ lat: 1, lng: 2 }, 'u1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'l2' });
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' }, body: { lat: 1, lng: 2 } };
      const res = mockResponse();

      (
        locationSettingService.createUserLocationSetting as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await locationSettingController.create(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('update', () => {
    it('should update location setting and return 200', async () => {
      const req: any = { user: { userId: 'u1' }, body: { lat: 3, lng: 4 } };
      const res = mockResponse();

      (
        locationSettingService.updateUserLocationSetting as jest.Mock
      ).mockResolvedValue({ id: 'l3' });

      await locationSettingController.update(req, res, mockNext);

      expect(
        locationSettingService.updateUserLocationSetting,
      ).toHaveBeenCalledWith('u1', { lat: 3, lng: 4 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 'l3' });
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' }, body: { lat: 3, lng: 4 } };
      const res = mockResponse();

      (
        locationSettingService.updateUserLocationSetting as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await locationSettingController.update(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteLocation', () => {
    it('should delete location setting and return 204', async () => {
      const req: any = { user: { userId: 'u1' } };
      const res = mockResponse();

      (
        locationSettingService.deleteUserLocationSetting as jest.Mock
      ).mockResolvedValue(undefined);

      await locationSettingController.deleteLocation(req, res, mockNext);

      expect(
        locationSettingService.deleteUserLocationSetting,
      ).toHaveBeenCalledWith('u1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const req: any = { user: { userId: 'u1' } };
      const res = mockResponse();

      (
        locationSettingService.deleteUserLocationSetting as jest.Mock
      ).mockRejectedValue(new Error('db error'));

      await locationSettingController.deleteLocation(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
