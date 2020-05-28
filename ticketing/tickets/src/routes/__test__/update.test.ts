import request from 'supertest';
import { natsWrapper } from '@pat-tickets/common';
import { app } from '../../app';
import { getAuthInfo } from '../../test';
import mongoose from 'mongoose';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', getAuthInfo().cookie)
    .send({ title: 'ticket', price: 20 })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).put(`/api/tickets/${id}`).send({ title: 'ticket', price: 20 }).expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', getAuthInfo().cookie)
    .send({ title: 'ticket', price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', getAuthInfo().cookie)
    .send({ title: 'update ticket', price: 25 })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const { cookie } = getAuthInfo();

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({ title: 'ticket', price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 25 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'ticket', price: -10 })
    .expect(400);

  await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({}).expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const { cookie } = getAuthInfo();

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({ title: 'ticket', price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'updated ticket', price: 25 })
    .expect(200);

  const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send();

  expect(ticketResponse.body.title).toEqual('updated ticket');
  expect(ticketResponse.body.price).toEqual(25);
});

it('published an event', async () => {
  const { cookie } = getAuthInfo();

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({ title: 'ticket', price: 20 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'updated ticket', price: 25 })
    .expect(200);

  expect(natsWrapper.client.publish).toBeCalledTimes(2);
});
