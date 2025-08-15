import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';

export async function getUserByEmail(email: string, tx: DbClient = prisma) {
  try {
    return await tx.user.findUnique({
      where: { email },
    });
  } catch (error) {
    throw new CustomError('Error fetching user by email', 500);
  }
}

export async function getUserById(id: string, tx: DbClient = prisma) {
  try {
    return await tx.user.findUnique({
      where: { id },
    });
  } catch (error: any) {
    throw new CustomError('Error fetching user by ID', 500);
  }
}

export async function getUserByUsername(
  username: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.user.findUnique({
      where: { username },
    });
  } catch (error) {
    throw new CustomError('Error fetching user by username', 500);
  }
}

export async function createUser(
  data: {
    email: string;
    username: string;
    password: string;
  },
  tx: DbClient = prisma,
) {
  const { email, username, password } = data;

  try {
    return await tx.user.create({
      data: {
        email,
        username,
        password,
      },
    });
  } catch (error) {
    throw new CustomError('Error creating user', 500);
  }
}

// ! ---------------
// ! For Testing
// ! ---------------
export async function getAllUsersAndLocationSettings(tx: DbClient = prisma) {
  try {
    return await prisma.user.findMany({
      where: {
        LocationSetting: {
          geohash: { not: null },
        },
      },
      include: {
        LocationSetting: {
          select: { geohash: true, beaconRadius: true },
        },
      },
    });
  } catch (error) {
    throw new CustomError('Error fetching users and location settings', 500);
  }
}
