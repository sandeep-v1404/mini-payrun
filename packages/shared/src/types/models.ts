export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  type: "hourly";
  baseHourlyRate: number;
  superRate: number;
  bank?: {
    bsb?: string;
    account?: string;
  };
};

export type TimesheetEntry = {
  date: string; // ISO date
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  unpaidBreakMins: number;
};

export type Timesheet = {
  employeeId: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  entries: TimesheetEntry[];
  allowances?: number;
};

export type PayrunRequest = {
  periodStart: string;
  periodEnd: string;
  employeeIds?: string[];
};

export type Payslip = {
  employeeId: string;
  normalHours: number;
  overtimeHours: number;
  gross: number;
  tax: number;
  super: number;
  net: number;
};

export type Payrun = {
  id: string;
  periodStart: string;
  periodEnd: string;
  totals: {
    gross: number;
    tax: number;
    super: number;
    net: number;
  };
  payslips: Payslip[];
};
