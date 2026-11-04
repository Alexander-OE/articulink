import express from "express";
import dotenv from "dotenv";
import articlesRouter from "./routes/articles.route.js";
import usersRouter from "./routes/users.route.js";
import interactionsRouter from "./routes/interactions.route.js";
import authRouter from "./routes/auth.route.js";
import { connectDB } from "./config/db.js";
import { swaggerSpec } from "./config/swagger.js";
import { checkJwtSecretIsConfigured } from "./utils/token.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

dotenv.config();
checkJwtSecretIsConfigured();

const app = express();

// API docs. Mounted before helmet so its default CSP doesn't block the
// Swagger UI assets. Interactive UI at /docs, raw spec at /docs.json.
app.get("/docs.json", (req, res) => res.json(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Articulink API Docs",
}));

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ name: "Articulink", status: "ok" });
});

// Liveness/readiness probe for monitoring and deployment health checks.
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

app.use("/auth", authRouter);
app.use("/articles", articlesRouter);
app.use("/users", usersRouter);
app.use("/interactions", interactionsRouter);

// 404 for unmatched routes, then the centralized error handler (registered last).
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
