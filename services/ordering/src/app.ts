import express from "express";
import cors from "cors";
import routes from "./routes";
import authRoutes from "./auth";

export function createApp() {

    const app = express();

    app.use(cors());

    app.use(express.json());

    app.get("/health", (_, res) => {

        res.json({
            status: "ok",
            service: "order-service"
        });

    });

    app.use("/api/auth", authRoutes);
    app.use("/api", routes);

    return app;

}