import express from "express";
import cors from "cors";
import employees from "./routes/employees";
import timesheets from "./routes/timesheets";
import payruns from "./routes/payruns";
import { connectDB } from "./db";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ Allow requests from frontend
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: false, // if you send cookies/auth
  })
);

app.get("/health", (_req, res) => res.send("OK"));
app.get("/", (_req, res) => res.send("mini-payrun api"));
app.use("/employees", employees);
app.use("/timesheets", timesheets);
app.use("/payruns", payruns);

app.listen(4000, async () => {
  await connectDB();
  console.warn("🚀 API running at http://localhost:4000");
});
