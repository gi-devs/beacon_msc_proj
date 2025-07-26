import app from '@/app';
import request from 'supertest';

export const testServer = () => request(app);
