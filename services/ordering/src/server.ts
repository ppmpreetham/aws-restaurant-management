import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";

const app = createApp();

const PORT = Number(process.env.PORT) || 8003;

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});