import { Request } from 'express';
import { CustomError } from '../../../src/utils/custom-error';
import { error } from '../../../src/middleware';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('error middleware', () => {
  it('should handle CustomError correctly', async () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn();

    const customError = new CustomError('Bad request', 400);

    await error(customError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(customError.toJSON());
  });

  it('should handle generic Error correctly', async () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn();

    const genericError = new Error('Something went wrong');

    await error(genericError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Something went wrong',
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it('should handle Error without message', async () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn();

    const err = new Error();
    // delete message explicitly
    Object.defineProperty(err, 'message', { value: '', writable: true });

    await error(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
    });
  });
});
