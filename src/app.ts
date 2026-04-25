import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import { globalErrorHandler } from "./lib/globalErrorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `this ${req.url} does not exists here`,
  });
});

app.use(globalErrorHandler);

export default app;
