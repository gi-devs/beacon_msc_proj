import prisma from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';
import PrismaClientInitializationError = Prisma.PrismaClientInitializationError;
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    throw new CustomError('Error fetching user by email', 500);
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error: any) {
    throw new CustomError('Error fetching user by ID', 500);
  }
}

export async function getUserByUsername(username: string) {
  try {
    return await prisma.user.findUnique({
      where: { username },
    });
  } catch (error) {
    throw new CustomError('Error fetching user by username', 500);
  }
}

export async function createUser(data: {
  email: string;
  username: string;
  password: string;
}) {
  const { email, username, password } = data;

  try {
    return await prisma.user.create({
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
