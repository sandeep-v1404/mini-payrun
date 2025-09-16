import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../db";
import { ZodError } from "zod";
import {
  type Payrun,
  type Payslip,
  type TimesheetEntry,
  type Employee,
  PayrunRequestSchema,
} from "@mini-payrun/shared";
import { calculatePayslipFromTimesheet } from "../domain/calc";

const router: Router = Router();

// GET /payruns → list all payruns
router.get("/", async (_req, res) => {
  try {
    const payruns = await prisma.payrun.findMany();
    res.json(payruns);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /payruns → generate a payrun for a period
router.post("/", async (req, res) => {
  try {
    const body = PayrunRequestSchema.parse(req.body);
    const employees = await prisma.employee.findMany({
      where: body.employeeIds ? { id: { in: body.employeeIds } } : {},
    });

    const payslips: Payslip[] = await Promise.all(
      employees.map(async (emp) => {
        const ts = await prisma.timesheet.findFirst({
          where: {
            employeeId: emp.id,
            periodStart: new Date(body.periodStart),
            periodEnd: new Date(body.periodEnd),
          },
        });

        const entries = (ts?.entries as TimesheetEntry[]) ?? [];
        const allowances = ts?.allowances ?? 0;

        return calculatePayslipFromTimesheet(
          emp as Employee,
          entries,
          allowances
        );
      })
    );

    const totals = payslips.reduce(
      (acc, p) => {
        acc.gross += p.gross;
        acc.tax += p.tax;
        acc.super += p.super;
        acc.net += p.net;
        return acc;
      },
      { gross: 0, tax: 0, super: 0, net: 0 }
    );

    const payrun: Payrun = {
      id: uuidv4(),
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      totals,
      payslips,
    };

    // Save payrun
    await prisma.payrun.create({
      data: {
        id: payrun.id,
        periodStart: new Date(payrun.periodStart),
        periodEnd: new Date(payrun.periodEnd),
        totals: payrun.totals,
        payslips: payrun.payslips,
      },
    });

    res.status(201).json(payrun);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /payruns/:id → fetch payrun by id
router.get("/:id", async (req, res) => {
  try {
    const payrun = await prisma.payrun.findUnique({
      where: { id: req.params.id },
    });
    if (!payrun) {
      return res.status(404).json({ error: "Payrun not found" });
    }
    res.json(payrun);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
