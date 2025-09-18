import express from "express";
import cors from "cors";
import employees from "./routes/employees";
import timesheets from "./routes/timesheets";
import payruns from "./routes/payruns";
import { connectDB } from "./db";
import auth from "./routes/auth";
import { authenticate } from "./middleware/auth";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Validate required environment variables
if (
  !process.env.JWT_SECRET ||
  !process.env.JWT_REFRESH_SECRET ||
  !process.env.DATABASE_URL
) {
  throw new Error(
    "JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL must be defined in environment variables"
  );
}

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Public routes
app.use("/auth", auth);
app.get("/health", (_req, res) => res.send("OK"));
app.get("/", (_req, res) => res.send("mini-payrun api"));

// Protected routes
app.use("/employees", authenticate, employees);
app.use("/timesheets", authenticate, timesheets);
app.use("/payruns", authenticate, payruns);

// Global error handler
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  await connectDB();
  console.warn(`🚀 API running at http://localhost:${PORT}`);
});
