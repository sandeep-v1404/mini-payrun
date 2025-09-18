/* eslint-disable prettier/prettier */
import type { Employee, Payslip, TimesheetEntry } from "@mini-payrun/shared";

function parseHMToMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function round2(n: number): number {
  // rounding to nearest cent
  return Math.round(n * 100) / 100;
}

/**
 * Calculate payslip for an hourly employee based on timesheet entries and allowances.
 *
 *  - totalHours = sum((end - start) - unpaidBreakMins)
 *  - normalHours = min(totalHours, 38)
 *  - overtimeHours = max(totalHours - 38, 0)
 *  - gross = normalHours*baseRate + overtimeHours*baseRate*1.5 + allowances
 *  - tax = progressive by bracket per period
 *  - super = 11.5% of gross (use employee.superRate if present; fallback 0.115)
 *  - net = gross - tax
 *
 */
export function calculatePayslipFromTimesheet(
  employee: Employee,
  entries: TimesheetEntry[],
  allowances = 0
): Payslip {
  // total hours from entries
  const totalHours = entries.reduce((acc, e) => {
    const start = parseHMToMinutes(e.start);
    const end = parseHMToMinutes(e.end);
    const minutes = Math.max(0, end - start - (e.unpaidBreakMins || 0));
    return acc + minutes / 60;
  }, 0);

  const normalHours = Math.min(totalHours, 38);
  const overtimeHours = Math.max(0, totalHours - 38);

  const baseRate = employee.baseHourlyRate;
  const grossRaw =
    normalHours * baseRate + overtimeHours * baseRate * 1.5 + allowances;
  const gross = round2(grossRaw);

  // For each bracket, tax is applied to the amount within that bracket.
  let tax = 0;
  const g = gross;

  // Bracket boundaries and rates
  const brackets: Array<{ limit: number; rate: number }> = [
    { limit: 370, rate: 0 }, // up to 370 -> 0%
    { limit: 900, rate: 0.1 }, // 370.01 - 900 -> 10% of amount over 370
    { limit: 1500, rate: 0.19 }, // 900.01 - 1500 -> 19% of amount over 900
    { limit: 3000, rate: 0.325 }, // 1500.01 - 3000 -> 32.5%
    { limit: 5000, rate: 0.37 }, // 3000.01 - 5000 -> 37%
    { limit: Infinity, rate: 0.45 }, // over 5000 -> 45%
  ];

  // Calculate sequentially. For bracket i, taxable amount is min(g, limit_i) - limit_{i-1}
  let lower = 0;
  for (const b of brackets) {
    const upper = b.limit;
    if (g > lower) {
      const taxable = Math.min(g, upper) - lower;
      if (taxable > 0) {
        tax += taxable * b.rate;
      }
    }
    lower = upper;
    if (g <= upper) {
      break;
    }
  }

  tax = round2(tax);

  const superRate = employee.superRate ?? 0.115;
  const superAmt = round2(gross * superRate);

  const net = round2(gross - tax);

  return {
    employeeId: employee.id,
    normalHours: round2(normalHours),
    overtimeHours: round2(overtimeHours),
    gross,
    tax,
    super: superAmt,
    net,
  };
}
