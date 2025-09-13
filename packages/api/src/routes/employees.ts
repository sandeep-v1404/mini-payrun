import { Router } from "express";
import type { Employee } from "@mini-payrun/shared";

const router: Router = Router();

// GET /employees
router.get("/", async (_req, res) => {
  const employees: Employee[] = []; // TODO: fetch from DB
  res.json(employees);
});

// POST /employees
router.post("/", async (req, res) => {
  const employee: Employee = req.body;
  // TODO: upsert into DB
  res.status(201).json(employee);
});

export default router;
