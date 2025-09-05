import { scheduleNotificationsForBeacons } from '../../src/jobs/scheduleNotifications';
import prisma from '../../src/lib/prisma';
import {
  boundingBox,
  decodeGeohash,
  getGeohashesOfBoundingBox,
} from '@beacon/utils';

jest.mock('@/lib/prisma', () => ({
  beacon: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  beaconNotification: {
    updateMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn((fn) =>
    fn({
      beacon: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      beaconNotification: { updateMany: jest.fn() },
    }),
  ),
  user: {
    findMany: jest.fn(),
  },
}));

jest.mock('@beacon/utils', () => ({
  boundingBox: jest.fn(() => ({ north: 1, south: 0, east: 1, west: 0 })),
  decodeGeohash: jest.fn(() => ({ latitude: 0, longitude: 0 })),
  getDistanceFromGeohashes: jest.fn(() => 10),
  getGeohashesOfBoundingBox: jest.fn(() => ['fnd']),
}));

describe('scheduleNotificationsForBeacons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mark expired beacons and pending notifications as EXPIRED', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(async (fn) =>
      fn({
        beacon: { updateMany: jest.fn().mockResolvedValue({ count: 2 }) },
        beaconNotification: { updateMany: jest.fn() },
      }),
    );
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([]);
    await scheduleNotificationsForBeacons();
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('should skip beacon with no LocationSetting', async () => {
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([
      {
        id: 10,
        active: true,
        expiresAt: new Date(),
        user: null,
        _count: { beaconNotification: 0 },
      },
    ]);
    await scheduleNotificationsForBeacons();
    expect(decodeGeohash).not.toHaveBeenCalled();
    expect(boundingBox).not.toHaveBeenCalled();
    expect(getGeohashesOfBoundingBox).not.toHaveBeenCalled();
  });

  it('should skip beacon if missing geohash or radius', async () => {
    const beacon = {
      id: 42,
      active: true,
      expiresAt: new Date(Date.now() + 60000),
      user: { LocationSetting: { geohash: null, beaconRadius: null } },
      _count: { beaconNotification: 0 },
    };

    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([beacon]);
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    await scheduleNotificationsForBeacons();

    expect(decodeGeohash).not.toHaveBeenCalled();
    expect(boundingBox).not.toHaveBeenCalled();
    expect(getGeohashesOfBoundingBox).not.toHaveBeenCalled();
  });

  it('should return early when no beacons', async () => {
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([]);

    await scheduleNotificationsForBeacons();

    expect(prisma.beacon.findMany).toHaveBeenCalled();
    expect(prisma.beaconNotification.createMany).not.toHaveBeenCalled();
  });

  it('should return early when no geohashes from beacons', async () => {
    (getGeohashesOfBoundingBox as jest.Mock).mockReturnValueOnce([]);
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1,
        active: true,
        expiresAt: new Date(Date.now() + 60000),
        user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
        _count: { beaconNotification: 0 },
      },
    ]);

    await scheduleNotificationsForBeacons();

    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('should return early when no users in geohashes', async () => {
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([
      {
        id: 2,
        active: true,
        expiresAt: new Date(Date.now() + 60000),
        user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
        _count: { beaconNotification: 0 },
      },
    ]);
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    await scheduleNotificationsForBeacons();

    expect(prisma.user.findMany).toHaveBeenCalled();
  });

  it('should create notifications for valid user assignment (rule 1)', async () => {
    const beacon = {
      id: 3,
      active: true,
      userId: 'u1',
      expiresAt: new Date(Date.now() + 60000),
      user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
      _count: { beaconNotification: 0 },
    };
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([beacon]);

    const user = {
      id: 'u2',
      username: 'user2',
      LocationSetting: { geohash: 'fnd', beaconRadius: 1000 },
      NotificationSetting: {
        maxBeaconPushes: 5,
        minBeaconPushInterval: 0,
        push: true,
      },
      beaconNotification: [],
      _count: { beaconNotification: 0 },
    };
    (prisma.user.findMany as jest.Mock).mockResolvedValue([user]);

    await scheduleNotificationsForBeacons();

    expect(prisma.beaconNotification.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: 'u2', beaconId: 3 }),
      ]),
    });
  });

  it('should skip user if max pushes reached (rule 1 filter)', async () => {
    const beacon = {
      id: 4,
      active: true,
      userId: 'u1',
      expiresAt: new Date(Date.now() + 60000),
      user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
      _count: { beaconNotification: 0 },
    };
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([beacon]);

    const user = {
      id: 'u2',
      username: 'user2',
      LocationSetting: { geohash: 'fnd', beaconRadius: 1000 },
      NotificationSetting: {
        maxBeaconPushes: 0,
        minBeaconPushInterval: 0,
        push: true,
      },
      beaconNotification: [],
      _count: { beaconNotification: 1 },
    };
    (prisma.user.findMany as jest.Mock).mockResolvedValue([user]);

    await scheduleNotificationsForBeacons();

    expect(prisma.beaconNotification.createMany).not.toHaveBeenCalled();
  });

  it('should allow user when enough time has passed since last notification (rule 2)', async () => {
    const beacon = {
      id: 101,
      active: true,
      expiresAt: new Date(Date.now() + 60000),
      user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
      _count: { beaconNotification: 0 },
    };
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([beacon]);

    const user = {
      id: 'u1',
      username: 'user1',
      LocationSetting: { geohash: 'fnd', beaconRadius: 1000 },
      NotificationSetting: {
        maxBeaconPushes: 5,
        minBeaconPushInterval: 60,
        push: true,
      },
      beaconNotification: [
        {
          beaconId: 102, // different beacon
          status: 'SENT',
          notifiedAt: new Date(Date.now() - 60 * 1000 * 125), // over 2 hours ago
        },
      ],
      _count: { beaconNotification: 1 },
    };
    (prisma.user.findMany as jest.Mock).mockResolvedValue([user]);

    await scheduleNotificationsForBeacons();

    expect(prisma.beaconNotification.createMany).toHaveBeenCalled();
  });

  it('should skip user when within push interval (rule 2)', async () => {
    const beacon = {
      id: 102,
      active: true,
      expiresAt: new Date(Date.now() + 60000),
      user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
      _count: { beaconNotification: 0 },
    };
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([beacon]);

    const user = {
      id: 'u1',
      username: 'user1',
      LocationSetting: { geohash: 'fnd', beaconRadius: 1000 },
      NotificationSetting: {
        maxBeaconPushes: 5,
        minBeaconPushInterval: 600,
        push: true,
      }, // 10 minutes
      beaconNotification: [
        {
          beaconId: 102,
          status: 'SENT',
          notifiedAt: new Date(Date.now() - 60 * 1000), // 1 minute ago
        },
      ],
      _count: { beaconNotification: 1 },
    };
    (prisma.user.findMany as jest.Mock).mockResolvedValue([user]);

    await scheduleNotificationsForBeacons();

    expect(prisma.beaconNotification.createMany).not.toHaveBeenCalled();
  });

  it('should assign user when no other beacons have count=1', async () => {
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1,
        userId: 'owner',
        active: true,
        expiresAt: new Date(Date.now() + 60000),
        user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
        _count: { beaconNotification: 0 },
      },
      {
        id: 2,
        userId: 'owner',
        active: true,
        expiresAt: new Date(Date.now() + 60000),
        user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
        _count: { beaconNotification: 2 },
      },
    ]);

    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'u1',
        username: 'multi',
        LocationSetting: { geohash: 'fnd', beaconRadius: 1000 },
        NotificationSetting: {
          maxBeaconPushes: 5,
          minBeaconPushInterval: 0,
          push: true,
        },
        beaconNotification: [],
        _count: { beaconNotification: 0 },
      },
    ]);

    await scheduleNotificationsForBeacons();

    expect(prisma.beaconNotification.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'u1', beaconId: 1 }),
        ]),
      }),
    );
  });

  it('should assign user to beacon with least notifications', async () => {
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([
      {
        id: 10,
        userId: 'u1',
        active: true,
        expiresAt: new Date(Date.now() + 60000),
        user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
        _count: { beaconNotification: 5 },
      },
      {
        id: 11,
        userId: 'u2',
        active: true,
        expiresAt: new Date(Date.now() + 60000),
        user: { LocationSetting: { geohash: 'gh', beaconRadius: 1000 } },
        _count: { beaconNotification: 2 }, // fewer notifications
      },
    ]);

    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'u3',
        username: 'user3',
        LocationSetting: { geohash: 'fnd', beaconRadius: 1000 },
        NotificationSetting: {
          maxBeaconPushes: 5,
          minBeaconPushInterval: 0,
          push: true,
        },
        beaconNotification: [],
        _count: { beaconNotification: 0 },
      },
    ]);

    await scheduleNotificationsForBeacons();

    expect(prisma.beaconNotification.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: 'u3', beaconId: 11 }),
        ]),
      }),
    );
  });

  it('should handle error in transaction', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(() => {
      throw new Error('db error');
    });
    (prisma.beacon.findMany as jest.Mock).mockResolvedValue([]);

    await expect(scheduleNotificationsForBeacons()).resolves.not.toThrow();
  });
});
