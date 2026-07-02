import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import restaurantRoutes from './routes/restaurants.routes';

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '*')
    .split(',')
    .map((o) => o.trim());

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json());

  // Simple request log - helpful when debugging integration with teammates' services
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'restaurant-service' });
  });

  app.use('/api', restaurantRoutes);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
  });

  // Centralized error handler - Express 5 forwards async errors here automatically.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
