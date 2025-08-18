import prisma from '../../../src/lib/prisma';
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByUsername,
} from '../../../src/models/model.user';
import { CustomError } from '../../../src/utils/custom-error';

describe('User Model', () => {
  const mockUser = {
    email: 'test@example.com',
    username: 'tester',
    password: 'hashedpassword',
  };

  it('can get user by email', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await getUserByEmail(mockUser.email);

    expect(result).toEqual(mockUser);
  });

  it('"getUserByEmail" should throw an CustomerError if unexpected error occurs', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new CustomError('Error fetching user by email', 500),
    );

    await expect(getUserByEmail(mockUser.email)).rejects.toThrow(
      'Error fetching user by email',
    );
  });

  it('can get user by ID', async () => {
    const existingUser = {
      ...mockUser,
      id: '12345',
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await getUserById(mockUser.email);

    expect(result).toEqual(mockUser);
  });

  it('"getUserById" should throw an CustomerError if unexpected error occurs', async () => {
    const existingUser = {
      ...mockUser,
      id: '12345',
    };
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new CustomError('Error fetching user by ID', 500),
    );

    await expect(getUserById(existingUser.id)).rejects.toThrow(
      'Error fetching user by ID',
    );
  });

  it('can get user by username', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await getUserByUsername(mockUser.username);

    expect(result).toEqual(mockUser);
  });

  it('"getUserByUsername" should throw an CustomerError if unexpected error occurs', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new CustomError('Error fetching user by username', 500),
    );

    await expect(getUserByUsername(mockUser.username)).rejects.toThrow(
      'Error fetching user by username',
    );
  });

  it('should create a new user and return the user object', async () => {
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await createUser(mockUser);

    expect(result).toEqual(mockUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: mockUser.email,
        username: mockUser.username,
        password: mockUser.password,
      },
    });
  });

  it('"createUser" should throw an CustomerError if unexpected error occurs', async () => {
    (prisma.user.create as jest.Mock).mockRejectedValue(
      new CustomError('Error creating user', 500),
    );

    await expect(createUser(mockUser)).rejects.toThrow('Error creating user');
  });
});
