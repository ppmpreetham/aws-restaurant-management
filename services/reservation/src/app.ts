import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import reservationRoutes from './routes/reservations.routes';
import { HttpError } from './errors';

export function createApp() {
  const app = express();

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : '*';

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'reservation-payment-service' });
  });

  app.use('/api', reservationRoutes);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({
        error: err.message,
        details: err.details,
      });
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
