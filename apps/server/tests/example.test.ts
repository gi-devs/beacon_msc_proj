// __tests__/app.test.ts
import request from 'supertest';
import app from '@/app'; // Adjust path as needednpm

describe('GET /', () => {
  it('should return Hello World!', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});
