import { Router } from "express";
import type { Timesheet } from "@mini-payrun/shared";

const router: Router = Router();

// POST /timesheets
router.post("/", async (req, res) => {
  const timesheet: Timesheet = req.body;
  // TODO: save/replace in DB
  res.status(201).json(timesheet);
});

export default router;
