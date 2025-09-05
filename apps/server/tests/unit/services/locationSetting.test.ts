import { locationSettingService } from '../../../src/services/service.locationSetting';
import {
  createLocationSetting,
  getLocationSettingByUserId,
  updateLocationSettingByUserId,
} from '../../../src/models/model.locationSetting';
import { getUserById } from '../../../src/models/model.user';
import { CustomError } from '../../../src/utils/custom-error';

jest.mock('@/models/model.locationSetting');
jest.mock('@/models/model.user');
jest.mock('@beacon/utils', () => ({
  decodeGeohash: jest.fn(() => ({ latitude: 0, longitude: 0 })),
  getDistanceFromGeohashes: jest.fn(() => 10),
}));

describe('locationSettingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserLocationSetting', () => {
    it('should throw if no location setting exists', async () => {
      (getLocationSettingByUserId as jest.Mock).mockResolvedValue(null);
      await expect(
        locationSettingService.fetchUserLocationSetting('u1'),
      ).rejects.toThrow('Location setting not found for this user');
    });

    it('should return location setting if found', async () => {
      (getLocationSettingByUserId as jest.Mock).mockResolvedValue({
        id: 'ls1',
      });
      const result =
        await locationSettingService.fetchUserLocationSetting('u1');
      expect(result).toEqual({ id: 'ls1' });
    });
  });

  describe('createUserLocationSetting', () => {
    const validData = { geohash: 'G30HSH', beaconRadius: 200 };

    it('should throw CustomError when schema validation fails', async () => {
      const invalidData: any = { beaconRadius: 'invalid' };
      await expect(
        locationSettingService.createUserLocationSetting(invalidData, 'u1'),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('should throw if user not found', async () => {
      (getUserById as jest.Mock).mockResolvedValue(null);
      await expect(
        locationSettingService.createUserLocationSetting(validData, 'u1'),
      ).rejects.toThrow('User not found');
    });

    it('should throw if location setting already exists', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getLocationSettingByUserId as jest.Mock).mockResolvedValue({
        id: 'ls1',
      });
      await expect(
        locationSettingService.createUserLocationSetting(validData, 'u1'),
      ).rejects.toThrow('Location setting already exists for this user');
    });

    it('should create and return a new location setting', async () => {
      (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
      (getLocationSettingByUserId as jest.Mock).mockResolvedValue(null);
      (createLocationSetting as jest.Mock).mockResolvedValue({ id: 'ls1' });

      const result = await locationSettingService.createUserLocationSetting(
        validData,
        'u1',
      );
      expect(createLocationSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          ...validData,
          user: { connect: { id: 'u1' } },
        }),
      );
      expect(result).toEqual({ id: 'ls1' });
    });
  });

  describe('updateUserLocationSetting', () => {
    const validData = { geohash: 'G30HSH', beaconRadius: 200 };

    it('should throw CustomError when schema validation fails', async () => {
      const invalidData: any = { beaconRadius: 'invalid' };
      await expect(
        locationSettingService.updateUserLocationSetting('u1', invalidData),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('should create new location setting if none exists', async () => {
      (getLocationSettingByUserId as jest.Mock).mockResolvedValue(null);
      (createLocationSetting as jest.Mock).mockResolvedValue({
        id: 'ls1',
      });

      const result = await locationSettingService.updateUserLocationSetting(
        'u1',
        validData,
      );
      expect(createLocationSetting).toHaveBeenCalledWith(
        expect.objectContaining({
          ...validData,
          user: { connect: { id: 'u1' } },
        }),
      );
      expect(result).toEqual({ id: 'ls1' });
    });

    it('should update existing location setting', async () => {
      (getLocationSettingByUserId as jest.Mock).mockResolvedValue({
        id: 'ls1',
      });
      (updateLocationSettingByUserId as jest.Mock).mockResolvedValue({
        id: 'ls1',
      });

      const result = await locationSettingService.updateUserLocationSetting(
        'u1',
        validData,
      );
      expect(updateLocationSettingByUserId).toHaveBeenCalledWith(
        'u1',
        validData,
      );
      expect(result).toEqual({ id: 'ls1' });
    });
  });
});
