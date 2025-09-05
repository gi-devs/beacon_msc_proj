import { authController } from '../../../src/controllers/controller.auth';
import { authService } from '../../../src/services/service.auth';
import { UserPayload } from '@beacon/types';

jest.mock('@/services/service.auth', () => ({
  authService: {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    logoutUser: jest.fn(),
    refreshAccessToken: jest.fn(),
    getProfile: jest.fn(),
  },
}));

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('register should return 201 with loginData', async () => {
    const req: any = { body: { email: 'a@b.com', password: '123' } };
    const res = mockResponse();

    (authService.registerUser as jest.Mock).mockResolvedValue({ token: 't1' });

    await authController.register(req, res, mockNext);

    expect(authService.registerUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token: 't1' });
  });

  it('login should return 200 with loginData', async () => {
    const req: any = { body: { email: 'a@b.com', password: '123' } };
    const res = mockResponse();

    (authService.loginUser as jest.Mock).mockResolvedValue({ token: 't2' });

    await authController.login(req, res, mockNext);

    expect(authService.loginUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 't2' });
  });

  it('logout should call service and return 200', async () => {
    const req: any = { user: { userId: 'u1' } as UserPayload };
    const res = mockResponse();

    (authService.logoutUser as jest.Mock).mockResolvedValue(undefined);

    await authController.logout(req, res, mockNext);

    expect(authService.logoutUser).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logged out successfully',
    });
  });

  it('refreshToken should return 200 with new token', async () => {
    const req: any = { body: { refreshToken: 'rt1' } };
    const res = mockResponse();

    (authService.refreshAccessToken as jest.Mock).mockResolvedValue({
      token: 't3',
    });

    await authController.refreshToken(req, res, mockNext);

    expect(authService.refreshAccessToken).toHaveBeenCalledWith('rt1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 't3' });
  });

  it('profile should return 200 with user data', async () => {
    const req: any = { user: { userId: 'u1' } as UserPayload };
    const res = mockResponse();

    (authService.getProfile as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
    });

    await authController.profile(req, res, mockNext);

    expect(authService.getProfile).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 'u1', email: 'a@b.com' });
  });

  it('should call next on error', async () => {
    const req: any = { body: {} };
    const res = mockResponse();

    (authService.registerUser as jest.Mock).mockRejectedValue(
      new Error('fail'),
    );

    await authController.register(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
