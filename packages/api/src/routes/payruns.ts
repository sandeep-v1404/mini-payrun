import { Router } from "express";
import type { Payrun, PayrunRequest } from "@mini-payrun/shared";

const router: Router = Router();

// GET /payruns
router.get("/", async (_req, res) => {
  const payruns: Payrun[] = []; // TODO: load from DB
  res.json(payruns);
});

// POST /payruns
router.post("/", async (req, res) => {
  const request: PayrunRequest = req.body;
  // TODO: generate payrun from timesheets
  const payrun: Payrun = {
    id: "payrun-1",
    periodStart: request.periodStart,
    periodEnd: request.periodEnd,
    totals: { gross: 0, tax: 0, super: 0, net: 0 },
    payslips: [],
  };
  res.status(201).json(payrun);
});

// GET /payruns/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  // TODO: fetch from DB
  res.json({ id, periodStart: "", periodEnd: "", totals: {}, payslips: [] });
});

// GET /payslips/:employeeId/:payrunId
router.get("/payslips/:employeeId/:payrunId", async (req, res) => {
  const { employeeId, payrunId } = req.params;
  // TODO: fetch payslip from DB
  res.json({ employeeId, payrunId });
});

export default router;
