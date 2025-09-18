import { Router } from "express";
import { prisma } from "../lib/db";
import { ZodError } from "zod";
import { EmployeeSchema } from "@mini-payrun/shared";

const router: Router = Router();

// GET /employees list all employees
router.get("/", async (_req, res) => {
  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /employees create employee
router.post("/", async (req, res) => {
  try {
    const employee = EmployeeSchema.parse(req.body);

    const dbEmployee = await prisma.employee.create({
      data: {
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
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /employees/:id update employee
router.put("/:id", async (req, res) => {
  try {
    const employee = EmployeeSchema.parse({
      ...req.body,
      id: req.params.id, // enforce param id
    });

    const dbEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        type: employee.type,
        baseHourlyRate: employee.baseHourlyRate,
        superRate: employee.superRate,
        bank: employee.bank ?? null,
      },
    });
    res.json(dbEmployee);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE /employees/:id delete employee
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.employee.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
