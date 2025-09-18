import { Router } from "express";
import { prisma } from "../db";
import { ZodError } from "zod";
import { TimesheetSchema } from "@mini-payrun/shared";

const router: Router = Router();

// GET /timesheets → list all timesheets
router.get("/", async (_req, res) => {
  try {
    const timesheets = await prisma.timesheet.findMany({
      include: { employee: true, payrun: true },
    });
    res.json(timesheets);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /timesheets → create or replace a timesheet for employee + period
router.post("/", async (req, res) => {
  try {
    const ts = TimesheetSchema.parse(req.body);

    const start = new Date(ts.periodStart);
    const end = new Date(ts.periodEnd);

    const invalidEntry = ts.entries.find((e) => {
      const d = new Date(e.date);
      return d < start || d > end;
    });

    if (invalidEntry) {
      return res.status(400).json({
        error: `Entry date ${invalidEntry.date} is outside of period range`,
      });
    }

    const timesheet = await prisma.timesheet.upsert({
      where: {
        employeeId_periodStart_periodEnd: {
          employeeId: ts.employeeId,
          periodStart: start,
          periodEnd: end,
        },
      },
      update: {
        entries: ts.entries,
        allowances: ts.allowances ?? 0,
      },
      create: {
        employeeId: ts.employeeId,
        periodStart: start,
        periodEnd: end,
        entries: ts.entries,
        allowances: ts.allowances ?? 0,
      },
    });

    res.status(201).json(timesheet);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
