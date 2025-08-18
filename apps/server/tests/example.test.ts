import request = require('supertest');
import app from '../src/app';

describe('GET /', () => {
  it('should return Hello World!', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Welcome to the API' });
  });
});
