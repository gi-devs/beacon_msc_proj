import prisma from '../../src/lib/prisma';
import { createCommunityRooms } from '../../src/jobs/createCommunityRooms';
import { normaliseDate } from '../../src/utils/dates';
import { addDays } from 'date-fns';

jest.mock('@/lib/prisma', () => ({
  session: { findMany: jest.fn() },
  communityRoom: {
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
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
});
