import request from 'supertest';
import { natsWrapper } from '@pat-tickets/common';
import { app } from '../../app';
import { getAuthInfo } from '../../test';
import { Ticket } from '../../models';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').set('Cookie', getAuthInfo().cookie).send({});
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthInfo().cookie)
    .send({ title: '', price: 20 })
    .expect(400);

  await request(app).post('/api/tickets').set('Cookie', getAuthInfo().cookie).send({ price: 20 }).expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthInfo().cookie)
    .send({ title: 'Good Ticket', price: -20 })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthInfo().cookie)
    .send({ title: 'Good Ticket' })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  // add in check to make sure a ticket was saved

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const ticket = {
    title: 'Good Ticket',
    price: 20,
  };

  await request(app).post('/api/tickets').set('Cookie', getAuthInfo().cookie).send(ticket).expect(201);

  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(ticket.title);
  expect(tickets[0].price).toEqual(ticket.price);
});

it('published an event', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const ticket = {
    title: 'Good Ticket',
    price: 20,
  };

  await request(app).post('/api/tickets').set('Cookie', getAuthInfo().cookie).send(ticket).expect(201);

  expect(natsWrapper.client.publish).toBeCalledTimes(1);
});
