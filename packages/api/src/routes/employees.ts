import { Router } from "express";
import { prisma } from "../lib/db";
import { ZodError } from "zod";
import { EmployeeSchema } from "@mini-payrun/shared";
import { Prisma } from "../generated/prisma";

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

    // Auto-generate employeeCode if not provided
    let employeeCode = employee.employeeCode;

    if (!employeeCode) {
      const lastEmployee = await prisma.employee.findFirst({
        where: {
          employeeCode: {
            startsWith: "EMP",
          },
        },
        orderBy: { employeeCode: "desc" },
        select: { employeeCode: true },
      });

      if (lastEmployee?.employeeCode) {
        // Extract the number part, e.g. "EMP007" -> 7
        const match = lastEmployee.employeeCode.match(/^EMP(\d+)$/);
        const lastNumber = match ? parseInt(match[1], 10) : 0;

        const nextNumber = lastNumber + 1;
        employeeCode = `EMP${String(nextNumber).padStart(3, "0")}`;
      } else {
        employeeCode = "EMP001";
      }
    }

    const dbEmployee = await prisma.employee.create({
      data: {
        employeeCode,
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

    // Prisma unique constraint violation
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res.status(400).json({
        error: "Employee code already exists. Please use a different code.",
      });
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
