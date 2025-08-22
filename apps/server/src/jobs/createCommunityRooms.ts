import prisma from '@/lib/prisma';
import { pickRandomItemFromArray } from '@beacon/utils';
import roomNames from '@/data/roomNames.json';
import { normaliseDate } from '@/utils/dates';
import { addDays } from 'date-fns';

export async function createCommunityRooms() {
  /*
    ------------------ RULES ---------------------
    Every user should have a community room created for them
    There should be no more than 6 people per room.
    Each room should have a name, the name of the group should also contain the id of the room "to make it unique"
    On creation room should not have more than 5 people in it so that any new user can be added to the room
    If a user is added to a room, if they create new account. If no rooms are available, user will need to wait for next room reset.
   */
  const today = normaliseDate(new Date());
  const oneWeekFromNow = addDays(today, 8);
  const threeDaysFromNow = addDays(today, 3);

  // only get users who have an active session
  const sessions = await prisma.session.findMany({
    include: {
      user: true, // include user data for each session
    },
  });
  const activeUserIds = sessions.map((session) => session.user.id);

  if (activeUserIds.length === 0) {
    console.log('No active users found. No rooms will be created.');
    return;
  }

  const existingRooms = await prisma.communityRoom.findMany({
    where: {
      expiresAt: {
        gte: today,
      },
    },
    include: {
      members: true, // include members of each room
      _count: {
        select: {
          members: true, // count of members in each room
        },
      },
    },
  });

  const usersNotInRooms = activeUserIds.filter(
    (userId) =>
      !existingRooms.some((room: (typeof existingRooms)[number]) =>
        room.members.some((member) => member.id === userId),
      ),
  );

  if (usersNotInRooms.length === 0) {
    console.log(
      'All active users are already in rooms. No new rooms will be created.',
    );
    return;
  }

  const countOfUsersToAssign = usersNotInRooms.length;

  // check if any of the existing rooms have less than 6 members
  const roomsWithSpace = existingRooms.filter(
    (room) => room._count.members < 6 && room.expiresAt > threeDaysFromNow,
  );

  const totalFreeSlots = roomsWithSpace.reduce(
    (acc, room) => acc + (5 - room._count.members),
    0,
  );

  if (totalFreeSlots >= countOfUsersToAssign) {
    let userIndex = 0;
    for (const room of roomsWithSpace) {
      const freeSlots = 5 - room._count.members;
      const usersToAssign = usersNotInRooms.slice(
        userIndex,
        userIndex + freeSlots,
      );

      if (usersToAssign.length > 0) {
        await prisma.communityRoom.update({
          where: { id: room.id },
          data: {
            members: {
              connect: usersToAssign.map((u) => ({ id: u })),
            },
          },
        });
        console.log(
          `Assigned ${usersToAssign.length} users to room ${room.roomName}`,
        );
        userIndex += usersToAssign.length;
      }

      if (userIndex >= countOfUsersToAssign) break;
    }
  } else {
    let userIndex = 0;
    for (const room of roomsWithSpace) {
      const free = 5 - room._count.members;
      const toAssign = usersNotInRooms.slice(userIndex, userIndex + free);

      if (toAssign.length > 0) {
        await prisma.communityRoom.update({
          where: { id: room.id },
          data: {
            members: {
              connect: toAssign.map((u) => ({ id: u })),
            },
          },
        });
        userIndex += toAssign.length;
      }
    }

    // any leftover users need new rooms
    const remainingUsers = usersNotInRooms.slice(userIndex);
    if (remainingUsers.length === 1) {
      console.log(
        '1 user left unassigned. Waiting for another user before creating a new room.',
      );
      return;
    }

    if (remainingUsers.length > 1) {
      const roomsToCreate = Math.ceil(remainingUsers.length / 5);

      for (let i = 0; i < roomsToCreate; i++) {
        const baseName = pickRandomItemFromArray(roomNames, 1)[0];
        await prisma.communityRoom.create({
          data: {
            roomName: baseName,
            expiresAt: oneWeekFromNow,
            members: {
              connect: remainingUsers
                .slice(i * 5, (i + 1) * 5)
                .map((u) => ({ id: u })),
            },
          },
        });
        console.log(
          `Created room ${baseName} with members ${{ usersIds: remainingUsers }}`,
        );
      }
    }
  }
}
