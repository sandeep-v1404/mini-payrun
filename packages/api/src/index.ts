import express from "express";
import employees from "./routes/employees";
import timesheets from "./routes/timesheets";
import payruns from "./routes/payruns";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.send("OK"));
app.get("/", (_req, res) => res.send("mini-payrun api"));
app.use("/employees", employees);
app.use("/timesheets", timesheets);
app.use("/payruns", payruns);

app.listen(4000, () => {
  console.warn("🚀 API running at http://localhost:4000");
});
