import request from 'supertest';
import { app } from '../../app';
import { getAuthInfo } from '../../test';

it('responds with details about the current user', async () => {
  const { email, cookie } = await getAuthInfo();
  const response = await request(app).get('/api/users/currentuser').set('Cookie', cookie).send().expect(200);
  expect(response.body.currentUser.email).toEqual(email);
});

it('resonds with null if not authenticated', async () => {
  const response = await request(app).get('/api/users/currentuser').send().expect(200);

  expect(response.body.currentUser).toBeNull();
});
