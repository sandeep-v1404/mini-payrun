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
import { generatePayslipPDF } from "../lib/pdf";
import { uploadPayslipToS3 } from "../lib/uploadPdf";

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

    // Generate payrun ID early
    const payrunId = uuidv4();

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

        // Calculate payslip data
        const payslip = calculatePayslipFromTimesheet(
          emp as Employee,
          entries,
          allowances
        );

        // Generate PDF
        const doc = generatePayslipPDF(
          body.periodStart,
          body.periodEnd,
          `${emp.firstName} ${emp.lastName}`,
          payslip
        );
        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

        // Upload to S3
        const pdfUrl = await uploadPayslipToS3(pdfBuffer, payrunId, emp.id);

        return { ...payslip, pdfUrl, employeeId: emp.id };
      })
    );

    // Compute totals across all payslips
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
      id: payrunId,
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
        payslips: payrun.payslips, // stored as JSON
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

// GET /payruns/:id → fetch payrun by id (with employees)
router.get("/:id", async (req, res) => {
  try {
    const payrun = await prisma.payrun.findUnique({
      where: { id: req.params.id },
    });

    if (!payrun) {
      return res.status(404).json({ error: "Payrun not found" });
    }

    // payslips are stored as JSON in db
    const payslips = payrun.payslips as any[];

    // Collect unique employeeIds from payslips
    const employeeIds = [...new Set(payslips.map((p) => p.employeeId))];

    // Fetch employees in one query
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
    });

    // Merge employee info into payslips
    const enrichedPayslips = payslips.map((p) => {
      const emp = employees.find((e) => e.id === p.employeeId);
      return {
        ...p,
        employee: emp ?? null, // attach full employee object
      };
    });

    const result = {
      ...payrun,
      payslips: enrichedPayslips,
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
