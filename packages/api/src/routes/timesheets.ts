import { Router } from "express";
import { prisma } from "../db";
import type { Timesheet } from "@mini-payrun/shared";

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
  const ts: Timesheet = req.body;

  if (!ts.employeeId || !ts.periodStart || !ts.periodEnd) {
    return res
      .status(400)
      .json({ error: "employeeId, periodStart, periodEnd are required" });
  }

  try {
    const timesheet = await prisma.timesheet.upsert({
      where: {
        employeeId_periodStart_periodEnd: {
          employeeId: ts.employeeId,
          periodStart: new Date(ts.periodStart),
          periodEnd: new Date(ts.periodEnd),
        },
      },
      update: {
        entries: ts.entries,
        allowances: ts.allowances ?? 0,
      },
      create: {
        employeeId: ts.employeeId,
        periodStart: new Date(ts.periodStart),
        periodEnd: new Date(ts.periodEnd),
        entries: ts.entries,
        allowances: ts.allowances ?? 0,
      },
    });

    res.status(201).json(timesheet);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
