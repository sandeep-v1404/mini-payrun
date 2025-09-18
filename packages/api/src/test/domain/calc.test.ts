import type { Employee, Timesheet } from "@mini-payrun/shared";
import { calculatePayslipFromTimesheet } from "../../domain/calc";

const employees: Employee[] = [
  {
    id: "e-alice",
    firstName: "Alice",
    lastName: "Chen",
    type: "hourly",
    baseHourlyRate: 35.0,
    superRate: 0.115,
    bank: { bsb: "083-123", account: "12345678" },
  },
  {
    id: "e-bob",
    firstName: "Bob",
    lastName: "Singh",
    type: "hourly",
    baseHourlyRate: 48.0,
    superRate: 0.115,
    bank: { bsb: "062-000", account: "98765432" },
  },
];

const timesheets: Timesheet[] = [
  {
    employeeId: "e-alice",
    periodStart: "2025-08-11",
    periodEnd: "2025-08-17",
    entries: [
      { date: "2025-08-11", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
      { date: "2025-08-12", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
      { date: "2025-08-13", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
      { date: "2025-08-14", start: "09:00", end: "15:00", unpaidBreakMins: 30 },
      { date: "2025-08-15", start: "10:00", end: "18:00", unpaidBreakMins: 30 },
    ],
    allowances: 30.0,
  },
  {
    employeeId: "e-bob",
    periodStart: "2025-08-11",
    periodEnd: "2025-08-17",
    entries: [
      { date: "2025-08-11", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
      { date: "2025-08-12", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
      { date: "2025-08-13", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
      { date: "2025-08-14", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
      { date: "2025-08-15", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
    ],
    allowances: 0.0,
  },
];

describe("calculatePayslipFromTimesheet", () => {
  it("calculates payslip correctly for Alice", () => {
    const alice = employees.find((e) => e.id === "e-alice")!;
    const aliceTimesheet = timesheets.find((t) => t.employeeId === "e-alice")!;

    const payslip = calculatePayslipFromTimesheet(
      alice,
      aliceTimesheet.entries,
      aliceTimesheet.allowances
    );

    expect(payslip).toEqual({
      employeeId: "e-alice",
      normalHours: 37,
      overtimeHours: 0,
      gross: 1325.0,
      tax: 133.75,
      super: 152.38,
      net: 1191.25,
    });
  });

  it("calculates payslip correctly for Bob", () => {
    const bob = employees.find((e) => e.id === "e-bob")!;
    const bobTimesheet = timesheets.find((t) => t.employeeId === "e-bob")!;

    const payslip = calculatePayslipFromTimesheet(
      bob,
      bobTimesheet.entries,
      bobTimesheet.allowances
    );

    expect(payslip).toEqual({
      employeeId: "e-bob",
      normalHours: 38,
      overtimeHours: 7,
      gross: 2328.0,
      tax: 436.1,
      super: 267.72,
      net: 1891.9,
    });
  });

  it("handles empty timesheet", () => {
    const alice = employees.find((e) => e.id === "e-alice")!;
    const payslip = calculatePayslipFromTimesheet(alice, [], 0);

    expect(payslip).toEqual({
      employeeId: "e-alice",
      normalHours: 0,
      overtimeHours: 0,
      gross: 0,
      tax: 0,
      super: 0,
      net: 0,
    });
  });
});
