import Expo from 'expo-server-sdk';
import { sendNotificationsForBeacons } from '../../src/jobs/scheduleNotifications';
import prisma from '../../src/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  beaconNotification: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('expo-server-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chunkPushNotifications: jest.fn((messages: any[]) => [messages]),
    sendPushNotificationsAsync: jest.fn(async (chunk: any[]) =>
      chunk.map(() => ({ status: 'ok' })),
    ),
  }));
});

describe('sendNotificationsForBeacons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send notifications for valid users with push enabled', async () => {
    const mockNotification = {
      id: 1,
      createdAt: new Date(),
      beacon: { id: 99, active: true, expiresAt: new Date(Date.now() + 10000) },
      user: {
        id: 'u1',
        NotificationSetting: { push: true, minBeaconPushInterval: 0 },
        pushToken: { token: 'ExponentPushToken[xxx]' },
      },
    };

    (prisma.beaconNotification.findMany as jest.Mock).mockResolvedValue([
      mockNotification,
    ]);

    await sendNotificationsForBeacons();

    const ExpoMock = Expo as unknown as jest.Mock;
    const expoInstance = ExpoMock.mock.results[0].value;

    expect(expoInstance.chunkPushNotifications).toHaveBeenCalled();
    expect(expoInstance.sendPushNotificationsAsync).toHaveBeenCalled();

    expect(prisma.beaconNotification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: [mockNotification.id] } },
        data: expect.objectContaining({
          notifiedAt: expect.any(Date),
          status: 'SENT',
        }),
      }),
    );
  });

  it('should mark cancelled if beacon inactive', async () => {
    const mockNotification = {
      id: 2,
      createdAt: new Date(),
      beacon: { id: 100, active: false, expiresAt: new Date() },
      user: { id: 'u1', NotificationSetting: { push: true }, pushToken: {} },
    };

    (prisma.beaconNotification.findMany as jest.Mock).mockResolvedValue([
      mockNotification,
    ]);

    await sendNotificationsForBeacons();

    expect(prisma.beaconNotification.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [mockNotification.id] } },
      data: { status: 'CANCELLED' },
    });
  });

  it('should mark silent if push disabled', async () => {
    const mockNotification = {
      id: 3,
      createdAt: new Date(),
      beacon: { id: 101, active: true, expiresAt: new Date() },
      user: {
        id: 'u1',
        NotificationSetting: { push: false },
        pushToken: { token: 'ExponentPushToken[zzz]' },
      },
    };

    (prisma.beaconNotification.findMany as jest.Mock).mockResolvedValue([
      mockNotification,
    ]);

    await sendNotificationsForBeacons();

    expect(prisma.beaconNotification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: [mockNotification.id] } },
        data: expect.objectContaining({
          status: 'SENT_SILENTLY',
          notifiedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should do nothing if no notifications found', async () => {
    (prisma.beaconNotification.findMany as jest.Mock).mockResolvedValue([]);

    await sendNotificationsForBeacons();

    const ExpoMock = Expo as unknown as jest.Mock;
    const expoInstance = ExpoMock.mock.results[0]?.value;

    if (expoInstance) {
      expect(expoInstance.sendPushNotificationsAsync).not.toHaveBeenCalled();
    }
  });

  it('should cancel notifications when beacon inactive', async () => {
    (prisma.beaconNotification.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1,
        createdAt: new Date(),
        beacon: { id: 99, active: false, expiresAt: new Date() },
        user: { id: 'u1', NotificationSetting: { push: true }, pushToken: {} },
      },
    ]);

    await sendNotificationsForBeacons();

    expect(prisma.beaconNotification.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [1] } },
      data: { status: 'CANCELLED' },
    });
  });

  it('should update successful notifications', async () => {
    const notification = {
      id: 3,
      createdAt: new Date(Date.now() - 10000),
      beacon: { id: 101, active: true, expiresAt: new Date() },
      user: {
        id: 'u1',
        NotificationSetting: { push: true, minBeaconPushInterval: 0 },
        pushToken: { token: 'ExponentPushToken[xxx]' },
      },
    };
    (prisma.beaconNotification.findMany as jest.Mock).mockResolvedValue([
      notification,
    ]);

    const ExpoMock = Expo as unknown as jest.Mock;
    const expoInstance = new ExpoMock();
    expoInstance.sendPushNotificationsAsync.mockResolvedValue([
      { status: 'ok' },
    ]);

    await sendNotificationsForBeacons();

    expect(prisma.beaconNotification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: [3] } },
        data: expect.objectContaining({
          status: 'SENT',
        }),
      }),
    );
  });

  it('should update silent notifications', async () => {
    const notification = {
      id: 4,
      createdAt: new Date(),
      beacon: { id: 102, active: true, expiresAt: new Date() },
      user: {
        id: 'u1',
        NotificationSetting: { push: false },
        pushToken: { token: 'ExponentPushToken[silent]' },
      },
    };
    (prisma.beaconNotification.findMany as jest.Mock).mockResolvedValue([
      notification,
    ]);

    await sendNotificationsForBeacons();

    expect(prisma.beaconNotification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: [4] } },
        data: expect.objectContaining({
          status: 'SENT_SILENTLY',
        }),
      }),
    );
  });
});
