import express from "express";
import dotenv from "dotenv";
import articlesRouter from "./routes/articles.route.js";
import usersRouter from "./routes/users.route.js";
import interactionsRouter from "./routes/interactions.route.js";
import { connectDB } from "./config/db.js";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.use("/articles", articlesRouter);
app.use("/users", usersRouter);
app.use("/interactions", interactionsRouter);

app.get("/", (req, res) => {
  res.send("Hello, Word!");
});

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});