import {
  decodeGeohash,
  encodeGeohash,
  getDistanceFromGeohashes,
  pickRandomItemFromArray,
} from '@beacon/utils';
import { addDays } from 'date-fns';
import { normaliseDate } from '@/utils/dates';
import prisma from '@/lib/prisma';
import roomNames from '@/data/roomNames.json';

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
      user: {
        include: {
          LocationSetting: true,
        },
      },
    },
  });
  const activeUserIds = sessions.map((session) => session.user.id);

  if (activeUserIds.length === 0) {
    console.log('No active users found. No rooms will be created.');
    return;
  }

  const userLocations = new Map<
    string,
    { lat: number; lon: number; geohash: string }
  >();
  const activeUsersWithLocation = sessions.map((session) => session.user);

  for (const user of activeUsersWithLocation) {
    if (user.LocationSetting?.geohash) {
      const { latitude, longitude } = decodeGeohash(
        user.LocationSetting.geohash,
      );
      userLocations.set(user.id, {
        lat: latitude,
        lon: longitude,
        geohash: user.LocationSetting.geohash,
      });
    }
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
      location: true,
    },
  });

  let usersNotInRooms = activeUserIds.filter(
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

  const roomsWithSpaceLocations = new Map<string, string>();
  roomsWithSpace.forEach((room) => {
    if (room.location) {
      roomsWithSpaceLocations.set(room.id, room.location?.geohash);
    }
  });

  for (const room of roomsWithSpace) {
    const freeSlots = 5 - room._count.members;

    // Split users by whether they have location
    const locatedUsers = usersNotInRooms.filter((id) => userLocations.has(id));
    const unlocatedUsers = usersNotInRooms.filter(
      (id) => !userLocations.has(id),
    );

    let usersToAssign: string[] = [];

    if (room.location?.geohash && locatedUsers.length > 0) {
      // Sort by distance
      const sorted = locatedUsers.sort(
        (a, b) =>
          getDistanceFromGeohashes(
            userLocations.get(a)!.geohash,
            room.location!.geohash,
          ) -
          getDistanceFromGeohashes(
            userLocations.get(b)!.geohash,
            room.location!.geohash,
          ),
      );
      usersToAssign = sorted.slice(0, freeSlots);
    }

    // Fill remaining slots with unlocated users if needed
    if (usersToAssign.length < freeSlots && unlocatedUsers.length > 0) {
      const needed = freeSlots - usersToAssign.length;
      usersToAssign = [...usersToAssign, ...unlocatedUsers.slice(0, needed)];
    }

    if (usersToAssign.length > 0) {
      await prisma.communityRoom.update({
        where: { id: room.id },
        data: {
          members: { connect: usersToAssign.map((u) => ({ id: u })) },
        },
      });

      console.log(
        `Assigned ${usersToAssign.length} users (location prioritised) to room ${room.roomName}`,
      );

      // Remove assigned users from pool
      usersNotInRooms = usersNotInRooms.filter(
        (id) => !usersToAssign.includes(id),
      );
    }
  }

  if (usersNotInRooms.length === 0) {
    console.log(
      `All ${countOfUsersToAssign} users have been assigned to rooms.`,
    );
    return;
  }

  if (usersNotInRooms.length === 1) {
    console.log('1 user left unassigned, waiting for another user');
    return;
  }

  const roomsToCreate = Math.ceil(usersNotInRooms.length / 5);

  function computeCentralPoints(users: string[]) {
    const points = users.map((id) => userLocations.get(id)).filter(Boolean);
    if (points.length === 0) return null;

    const avgLat = points.reduce((sum, p) => sum + p!.lat, 0) / points.length;
    const avgLon = points.reduce((sum, p) => sum + p!.lon, 0) / points.length;
    return { lat: avgLat, lon: avgLon };
  }

  for (let i = 0; i < roomsToCreate; i++) {
    const assignedUsers = usersNotInRooms.slice(i * 5, (i + 1) * 5);
    const central = computeCentralPoints(assignedUsers);

    const baseName = pickRandomItemFromArray(roomNames, 1)[0];
    const room = await prisma.communityRoom.create({
      data: {
        roomName: baseName,
        expiresAt: oneWeekFromNow,
        members: { connect: assignedUsers.map((u) => ({ id: u })) },
      },
    });

    if (central) {
      await prisma.communityRoomLocation.create({
        data: {
          roomId: room.id,
          latitude: central.lat,
          longitude: central.lon,
          geohash: encodeGeohash(central.lat, central.lon),
        },
      });
    }

    console.log(
      `Created room ${baseName} with ${assignedUsers.length} members ${
        central ? '(with location)' : '(no location)'
      }`,
    );
  }
}
