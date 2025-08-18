import Expo from 'expo-server-sdk';
import { notifyBeaconOwners } from '../../src/jobs/notifyBeaconOwners';
import prisma from '../../src/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  beacon: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  beaconNotification: {
    updateMany: jest.fn(),
  },
  $transaction: jest.fn((fn) =>
    fn({
      beaconNotification: {
        updateMany: jest.fn(),
      },
      beacon: {
        update: jest.fn(),
      },
    }),
  ),
}));

// ------------ Mock Expo SDK ------------
jest.mock('expo-server-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chunkPushNotifications: jest.fn((messages: any[]) => [messages]),
    sendPushNotificationsAsync: jest.fn(async (chunk: any[]) =>
      chunk.map(() => ({ status: 'ok' })),
    ),
  }));
});

async function mockCallFunction(mockBeacon: {
  id: number;
  active: boolean;
  createdAt: Date;
  expiresAt: Date;
  userNotifiedStage: number;
  user: {
    id: string;
    NotificationSetting: { push: boolean };
    pushToken: { token: string };
  };
  beaconNotification: { id: number; status: string; createdAt: Date }[];
}) {
  (prisma.beacon.findMany as jest.Mock).mockResolvedValue([mockBeacon]);

  await notifyBeaconOwners();

  const ExpoMock = Expo as unknown as jest.Mock;
  const expoInstance = ExpoMock.mock.results[0].value;

  expect(expoInstance.chunkPushNotifications).toHaveBeenCalled();
  expect(expoInstance.sendPushNotificationsAsync).toHaveBeenCalled();

  const messagesSent = expoInstance.chunkPushNotifications.mock.calls[0][0];
  return messagesSent;
}

describe('notifyBeaconOwners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should notify user at stage 0 when there is one reply', async () => {
    const mockBeacon = {
      id: 1,
      active: true,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h ahead
      userNotifiedStage: 0,
      user: {
        id: 'user1',
        NotificationSetting: { push: true },
        pushToken: { token: 'ExponentPushToken[xxx]' },
      },
      beaconNotification: [
        { id: 10, status: 'REPLIED', createdAt: new Date() },
      ],
    };

    const messagesSent = await mockCallFunction(mockBeacon);
    expect(messagesSent[0].body).toBe("Hey someone's thinking of you!");
  });

  it('should notify user at stage 1 when ≥2 replies and >2h since createdAt', async () => {
    const createdAt = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3h ago
    const mockBeacon = {
      id: 2,
      active: true,
      createdAt,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h ahead
      userNotifiedStage: 1,
      user: {
        id: 'user2',
        NotificationSetting: { push: true },
        pushToken: { token: 'ExponentPushToken[yyy]' },
      },
      beaconNotification: [
        { id: 20, status: 'REPLIED', createdAt },
        { id: 21, status: 'REPLIED', createdAt },
      ],
    };

    const messagesSent = await mockCallFunction(mockBeacon);
    expect(messagesSent[0].body).toBe("You're on a few peoples minds today <3");
  });

  it('should notify user at stage 2 when expiring within 15 minutes', async () => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10m
    const mockBeacon = {
      id: 3,
      active: true,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago
      expiresAt,
      userNotifiedStage: 2,
      user: {
        id: 'user3',
        NotificationSetting: { push: true },
        pushToken: { token: 'ExponentPushToken[zzz]' },
      },
      beaconNotification: [
        { id: 30, status: 'REPLIED', createdAt: new Date() },
      ],
    };

    const messagesSent = await mockCallFunction(mockBeacon);
    expect(messagesSent[0].body).toBe(
      'Your beacon is about to expire. Be sure to check in with your messages!',
    );
  });

  it('should not send notifications if no active beacons', async () => {
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([]);

    await notifyBeaconOwners();

    const ExpoMock = Expo as unknown as jest.Mock;
    const expoInstance = ExpoMock.mock.results[0]?.value;

    if (expoInstance) {
      expect(expoInstance.sendPushNotificationsAsync).not.toHaveBeenCalled();
    }
  });
});
