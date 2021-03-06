import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/api/orders', async (req: Request, res: Response) => {
  res.send({});
});

router.get('/api/orders/:id', async (req: Request, res: Response) => {
  res.send({});
});

export { router as showOrderRouter };
