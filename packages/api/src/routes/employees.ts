import { Router } from "express";
import { prisma } from "../db";
import { ZodError } from "zod";
import { EmployeeSchema } from "@mini-payrun/shared";

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
  try {
    // Validate request body
    const employee = EmployeeSchema.parse(req.body);

    const dbEmployee = await prisma.employee.upsert({
      where: { id: employee.id || "" },
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
    if (err instanceof ZodError) {
      // Send validation errors
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
