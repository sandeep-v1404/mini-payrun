import { Router } from "express";
import { prisma } from "../db";
import type { Employee } from "@mini-payrun/shared";

const router: Router = Router();

// GET /employees → list all employees
router.get("/", async (_req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /employees → create or upsert employee
router.post("/", async (req, res) => {
  const employee: Employee = req.body;

  if (!employee.firstName || !employee.lastName || !employee.type) {
    return res.status(400).json({ error: "Missing required employee fields" });
  }

  try {
    const dbEmployee = await prisma.employee.upsert({
      where: { id: employee.id ?? "" },
      update: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        type: employee.type,
        baseHourlyRate: employee.baseHourlyRate,
        superRate: employee.superRate,
        bank: employee.bank ?? null,
      },
      create: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        type: employee.type,
        baseHourlyRate: employee.baseHourlyRate,
        superRate: employee.superRate,
        bank: employee.bank ?? null,
      },
    });
    res.status(201).json(dbEmployee);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
