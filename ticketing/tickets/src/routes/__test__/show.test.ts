import request from 'supertest';
import { app } from '../../app';
import { getAuthInfo } from '../../test';
import mongoose from 'mongoose';

const createTicket = async ({ title, price }: { title?: string; price?: number } = {}) => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', getAuthInfo().cookie)
    .send({ title, price })
    .expect(201);
  return response.body;
};

it('returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns the ticket if the ticket is found', async () => {
  const title = 'concert';
  const price = 20;

  const ticket = await createTicket({ title, price });

  const ticketResponse = await request(app).get(`/api/tickets/${ticket.id}`).send().expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it('fetch a list of tickets', async () => {
  await createTicket({ title: 'Ticket 1', price: 10 });
  await createTicket({ title: 'Ticket 2', price: 20 });
  await createTicket({ title: 'Ticket 3', price: 30 });

  const response = await request(app).get('/api/tickets/').send().expect(200);

  expect(response.body).toHaveLength(3);
});
