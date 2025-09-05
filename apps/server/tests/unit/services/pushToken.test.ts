import { pushTokenService } from '../../../src/services/service.pushToken';
import { getUserById } from '../../../src/models/model.user';
import {
  createPushToken,
  getPushTokenByUserId,
  updatePushToken,
} from '../../../src/models/model.pushToken';
import { CustomError } from '../../../src/utils/custom-error';

jest.mock('@/models/model.user');
jest.mock('@/models/model.pushToken');

describe('pushTokenService.syncPushToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw CustomError if userId or pushToken is missing', async () => {
    await expect(
      pushTokenService.syncPushToken({ userId: '', pushToken: '' }),
    ).rejects.toThrow(CustomError);
  });

  it('should throw CustomError if user not found', async () => {
    (getUserById as jest.Mock).mockResolvedValue(null);

    await expect(
      pushTokenService.syncPushToken({ userId: 'u1', pushToken: 'token1' }),
    ).rejects.toThrow('User not found');
  });

  it('should create push token if none exists', async () => {
    (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
    (getPushTokenByUserId as jest.Mock).mockResolvedValue(null);

    const result = await pushTokenService.syncPushToken({
      userId: 'u1',
      pushToken: 'newToken',
    });

    expect(createPushToken).toHaveBeenCalledWith('u1', 'newToken');
    expect(result).toBe(true);
  });

  it('should update push token if different', async () => {
    (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
    (getPushTokenByUserId as jest.Mock).mockResolvedValue({
      token: 'oldToken',
    });

    const result = await pushTokenService.syncPushToken({
      userId: 'u1',
      pushToken: 'newToken',
    });

    expect(updatePushToken).toHaveBeenCalledWith('u1', 'newToken');
    expect(result).toBe(false);
  });

  it('should return false if token is the same', async () => {
    (getUserById as jest.Mock).mockResolvedValue({ id: 'u1' });
    (getPushTokenByUserId as jest.Mock).mockResolvedValue({
      token: 'sameToken',
    });

    const result = await pushTokenService.syncPushToken({
      userId: 'u1',
      pushToken: 'sameToken',
    });

    expect(updatePushToken).not.toHaveBeenCalled();
    expect(createPushToken).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
