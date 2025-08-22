import prisma from '../../src/lib/prisma';
import { createCommunityRooms } from '../../src/jobs/createCommunityRooms';
import { normaliseDate } from '../../src/utils/dates';
import { addDays } from 'date-fns';
import { getDistanceFromGeohashes } from '@beacon/utils';

jest.mock('@/lib/prisma', () => ({
  session: { findMany: jest.fn() },
  communityRoom: {
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  communityRoomLocation: {
    create: jest.fn(),
  },
}));

jest.mock('@beacon/utils', () => ({
  ...jest.requireActual('@beacon/utils'),
  getDistanceFromGeohashes: jest.fn(),
}));

describe('createCommunityRooms', () => {
  const weekFromNow = addDays(normaliseDate(new Date()), 7);
  beforeEach(() => jest.clearAllMocks());

  it('does nothing if no active users', async () => {
    (prisma.session.findMany as jest.Mock).mockResolvedValue([]);
    await createCommunityRooms();
    expect(prisma.communityRoom.findMany).not.toHaveBeenCalled();
    expect(prisma.communityRoom.create).not.toHaveBeenCalled();
  });

  it('does nothing if all users are already in rooms', async () => {
    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user1' } },
      { user: { id: 'user2' } },
    ]);
    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [{ id: 'user1' }, { id: 'user2' }],
        _count: { members: 2 },
        expiresAt: weekFromNow,
      },
    ]);

    await createCommunityRooms();

    expect(prisma.communityRoom.create).not.toHaveBeenCalled();
    expect(prisma.communityRoom.update).not.toHaveBeenCalled();
  });

  it('fills users into existing rooms if there is space', async () => {
    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user1' } },
      { user: { id: 'user2' } },
    ]);
    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [],
        _count: { members: 0 },
        expiresAt: weekFromNow,
      },
    ]);

    await createCommunityRooms();

    expect(prisma.communityRoom.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '#1' },
        data: {
          members: { connect: [{ id: 'user1' }, { id: 'user2' }] },
        },
      }),
    );
  });

  it('creates new room if users cannot fit in existing rooms', async () => {
    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user0' } },
      { user: { id: 'user1' } },
      { user: { id: 'user2' } },
      { user: { id: 'user3' } },
      { user: { id: 'user4' } },
      { user: { id: 'user5' } },
      { user: { id: 'user6' } }, // 7 users total as 0-1 are already in a room
    ]);
    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [{ id: 'user0' }, { id: 'user1' }],
        _count: { members: 2 },
        expiresAt: weekFromNow,
      },
    ]);

    await createCommunityRooms();

    expect(prisma.communityRoom.create).toHaveBeenCalled();
  });

  it('does not create a room if only 1 user remains', async () => {
    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user1' } },
      { user: { id: 'user2' } },
      { user: { id: 'user3' } },
      { user: { id: 'user4' } },
      { user: { id: 'user5' } },
      { user: { id: 'user6' } },
    ]);
    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [{ id: 'user1' }, { id: 'user2' }],
        _count: { members: 2 },
        expiresAt: weekFromNow,
      },
    ]);

    await createCommunityRooms();

    expect(prisma.communityRoom.create).not.toHaveBeenCalled();
  });

  it('does not assign user to rooms which expire in 3 days', async () => {
    const threeDaysFromNow = addDays(normaliseDate(new Date()), 3);

    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user6' } },
    ]);

    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [
          { id: 'user1' },
          { id: 'user2' },
          { id: 'user3' },
          { id: 'user4' },
        ],
        _count: { members: 4 },
        expiresAt: threeDaysFromNow,
      },
    ]);

    await createCommunityRooms();

    expect(prisma.communityRoom.update).not.toHaveBeenCalled();
    expect(prisma.communityRoom.create).not.toHaveBeenCalled();
  });

  it('creates room for users when only available room expires in 3 days', async () => {
    const threeDaysFromNow = addDays(normaliseDate(new Date()), 3);

    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user6' } },
      { user: { id: 'user7' } },
    ]);

    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }],
        _count: { members: 4 },
        expiresAt: threeDaysFromNow,
      },
    ]);

    await createCommunityRooms();

    expect(prisma.communityRoom.update).not.toHaveBeenCalled();
    expect(prisma.communityRoom.create).toHaveBeenCalled();
  });

  it('creates a room with central location when users have geohashes', async () => {
    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user1', LocationSetting: { geohash: 'u1hash' } } },
      { user: { id: 'user2', LocationSetting: { geohash: 'u2hash' } } },
    ]);

    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([]);

    (prisma.communityRoom.create as jest.Mock).mockResolvedValue({
      id: 'new-room',
    });

    await createCommunityRooms();

    expect(prisma.communityRoom.create).toHaveBeenCalled();
    expect(prisma.communityRoomLocation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          roomId: 'new-room',
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          geohash: expect.any(String),
        }),
      }),
    );
  });

  it('creates room without location if no users have geohashes', async () => {
    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user1', LocationSetting: null } },
      { user: { id: 'user2', LocationSetting: null } },
    ]);

    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([]);

    (prisma.communityRoom.create as jest.Mock).mockResolvedValue({
      id: 'new-room',
    });

    await createCommunityRooms();

    expect(prisma.communityRoom.create).toHaveBeenCalled();
    expect(prisma.communityRoomLocation.create).not.toHaveBeenCalled();
  });

  it('assigns closer users before farther ones', async () => {
    (getDistanceFromGeohashes as jest.Mock).mockImplementation(
      (userHash, roomHash) => {
        if (userHash === 'close') return 10;
        if (userHash === 'far') return 1000;
        return 9999;
      },
    );

    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user1', LocationSetting: { geohash: 'close' } } },
      { user: { id: 'user2', LocationSetting: { geohash: 'far' } } },
    ]);

    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [],
        _count: { members: 0 },
        expiresAt: addDays(new Date(), 5),
        location: { geohash: 'roomHash' },
      },
    ]);

    await createCommunityRooms();

    expect(prisma.communityRoom.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '#1' },
        data: {
          members: {
            connect: [{ id: 'user1' }, { id: 'user2' }], // close first
          },
        },
      }),
    );
  });

  it('assigns closer users if only 1 space left', async () => {
    (getDistanceFromGeohashes as jest.Mock).mockImplementation(
      (userHash, _) => {
        if (userHash === 'close') return 10;
        if (userHash === 'far') return 1000;
        return 9999;
      },
    );

    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user1', LocationSetting: { geohash: 'far' } } },
      { user: { id: 'user2', LocationSetting: { geohash: 'close' } } },
      { user: { id: 'user3', LocationSetting: { geohash: 'far' } } },
    ]);

    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [
          { id: 'user4' },
          { id: 'user5' },
          { id: 'user6' },
          { id: 'user7' },
        ],
        _count: { members: 4 },
        expiresAt: weekFromNow,
        location: { geohash: 'roomHash' },
      },
    ]);

    (prisma.communityRoom.create as jest.Mock).mockResolvedValue({
      id: '#newRoom',
      roomName: 'TestRoom',
    });

    await createCommunityRooms();

    expect(prisma.communityRoom.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '#1' },
        data: {
          members: {
            connect: [{ id: 'user2' }],
          },
        },
      }),
    );

    expect(prisma.communityRoom.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '#1' },
        data: {
          members: {
            connect: [{ id: 'user3' }, { id: 'user1' }], // farthest user not included
          },
        },
      }),
    );

    expect(prisma.communityRoomLocation.create).toHaveBeenCalled();

    expect(prisma.communityRoom.create).toHaveBeenCalled();
  });

  it('should assign remaining users normally after location-based assignments', async () => {
    (getDistanceFromGeohashes as jest.Mock).mockImplementation(
      (userHash, _) => {
        if (userHash === 'close') return 10;
        if (userHash === 'far') return 1000;
        return 9999;
      },
    );

    (prisma.session.findMany as jest.Mock).mockResolvedValue([
      { user: { id: 'user1', LocationSetting: { geohash: 'close' } } },
      { user: { id: 'user2' } },
      { user: { id: 'user3', LocationSetting: { geohash: 'far' } } },
    ]);

    (prisma.communityRoom.findMany as jest.Mock).mockResolvedValue([
      {
        id: '#1',
        roomName: 'Room1',
        members: [
          { id: 'user4' },
          { id: 'user5' },
          { id: 'user6' },
          { id: 'user7' },
        ],
        _count: { members: 4 },
        expiresAt: weekFromNow,
        location: { geohash: 'roomHash' },
      },
      {
        id: '#2',
        roomName: 'Room2',
        members: [{ id: 'user8' }, { id: 'user9' }],
        _count: { members: 2 },
        expiresAt: weekFromNow,
        location: { geohash: 'roomHash' },
      },
    ]);

    await createCommunityRooms();

    expect(prisma.communityRoom.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: '#1' },
        data: {
          members: {
            connect: [{ id: 'user1' }],
          },
        },
      }),
    );

    expect(prisma.communityRoom.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: '#2' },
        data: {
          members: {
            connect: expect.arrayContaining([{ id: 'user2' }, { id: 'user3' }]), // array as it doesn't matter which order they go in
          },
        },
      }),
    );
  });
});
