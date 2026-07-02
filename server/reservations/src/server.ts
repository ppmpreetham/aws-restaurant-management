import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8002;
const app = createApp();

app.listen(port, () => {
  console.log(`reservation-payment-service listening on port ${port}`);
});
