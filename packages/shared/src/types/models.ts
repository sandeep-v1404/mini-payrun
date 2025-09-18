import { z } from "zod";

export const SignupSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type User = z.infer<typeof LoginSchema>;

export const BankSchema = z.object({
  bsb: z.string().optional(),
  account: z.string().optional(),
});

export const EmployeeSchema = z.object({
  id: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  type: z.string(), // e.g., "hourly"
  baseHourlyRate: z.number(),
  superRate: z.number(),
  bank: BankSchema.optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;

export const TimesheetEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:mm"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:mm"),
  unpaidBreakMins: z.number().int(),
});

export type TimesheetEntry = z.infer<typeof TimesheetEntrySchema>;

export const TimesheetSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string(),
  periodStart: z.string(), // ISO date string
  periodEnd: z.string(), // ISO date string
  entries: z.array(TimesheetEntrySchema),
  allowances: z.number().optional(),
  employee: EmployeeSchema.optional(), // for include queries
  payrunId: z.string().optional(),
});

export const TimesheetSchema2 = z
  .object({
    id: z.string().optional(),
    employeeId: z.string(),
    periodStart: z.string(),
    periodEnd: z.string(),
    entries: z.array(TimesheetEntrySchema),
    allowances: z.number().optional(),
    employee: EmployeeSchema.optional(),
    payrunId: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.periodStart);
      const end = new Date(data.periodEnd);

      return data.entries.every((e) => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    },
    {
      message: "All entry dates must be within periodStart and periodEnd",
      path: ["entries"], // where error will be attached
    }
  );

export type Timesheet = z.infer<typeof TimesheetSchema>;

export const PayslipSchema = z.object({
  employeeId: z.string(),
  normalHours: z.number(),
  overtimeHours: z.number(),
  gross: z.number(),
  tax: z.number(),
  super: z.number(),
  net: z.number(),
  pdfUrl: z.url().optional(),
});

export type Payslip = z.infer<typeof PayslipSchema>;

export const PayrunSchema = z.object({
  id: z.string().optional(),
  periodStart: z.string(), // ISO date
  periodEnd: z.string(), // ISO date
  totals: z.object({
    gross: z.number(),
    tax: z.number(),
    super: z.number(),
    net: z.number(),
  }),
  payslips: z.array(PayslipSchema),
  timesheets: z.array(TimesheetSchema).optional(),
});

export type Payrun = z.infer<typeof PayrunSchema>;

export const PayrunRequestSchema = z.object({
  periodStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  employeeIds: z.array(z.string()).optional(),
});

export type PayrunRequest = z.infer<typeof PayrunRequestSchema>;
