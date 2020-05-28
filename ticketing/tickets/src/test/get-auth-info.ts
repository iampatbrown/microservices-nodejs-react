import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const getAuthInfo = () => {
  const email = 'test@test.com';
  const id = new mongoose.Types.ObjectId().toHexString();

  const sessionJSON = JSON.stringify({ jwt: jwt.sign({ email, id }, process.env.JWT_KEY!) });

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return { cookie: `express:sess=${base64}`, email, id };
};
