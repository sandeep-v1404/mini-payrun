export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  type: "hourly";
  baseHourlyRate: number;
  superRate: number;
  bank?: { bsb: string; account: string };
}

export interface TimesheetEntry {
  date: string;
  start: string;
  end: string;
  unpaidBreakMins: number;
}

export interface Timesheet {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  entries: TimesheetEntry[];
  allowances?: number;
}

export interface PayrunRequest {
  periodStart: string;
  periodEnd: string;
  employeeIds?: string[];
}

export interface Payslip {
  employeeId: string;
  normalHours: number;
  overtimeHours: number;
  gross: number;
  tax: number;
  super: number;
  net: number;
}

export interface Payrun {
  id: string;
  periodStart: string;
  periodEnd: string;
  totals: { gross: number; tax: number; super: number; net: number };
  payslips: Payslip[];
}
