import app from '../../src/app';
import * as request from 'supertest';

export const testServer = () => request(app);
