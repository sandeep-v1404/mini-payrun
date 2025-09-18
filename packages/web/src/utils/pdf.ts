 
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import type { Payrun } from "@mini-payrun/shared";
import { formatDate } from "./dayjs";

export const generatePayslipPDF = (
  payrun: Payrun,
  employeeId: string,
  employeeName: string
) => {
  const doc = new jsPDF();

  const periodStart = formatDate(payrun.periodStart);
  const periodEnd = formatDate(payrun.periodEnd);

  // Title
  doc.setFontSize(18);
  doc.text(`Payslip for ${employeeName}`, 14, 20);

  // Period
  doc.setFontSize(12);
  doc.text(`Period: ${periodStart} - ${periodEnd}`, 14, 30);

  // Totals (overall totals)
  doc.text(`Gross Pay: $${payrun.totals.gross.toFixed(2)}`, 14, 40);
  doc.text(`Tax: $${payrun.totals.tax.toFixed(2)}`, 14, 50);
  doc.text(`Super: $${payrun.totals.super.toFixed(2)}`, 14, 60);
  doc.text(`Net Pay: $${payrun.totals.net.toFixed(2)}`, 14, 70);

  // Find the payslip for this employee
  const employeePayslip = payrun.payslips.find(
    (p) => p.employeeId === employeeId
  );

  const rows = employeePayslip
    ? [
        ["Normal Hours", employeePayslip.normalHours],
        ["Overtime Hours", employeePayslip.overtimeHours],
        ["Gross", `$${employeePayslip.gross.toFixed(2)}`],
        ["Tax", `$${employeePayslip.tax.toFixed(2)}`],
        ["Super", `$${employeePayslip.super.toFixed(2)}`],
        ["Net", `$${employeePayslip.net.toFixed(2)}`],
      ]
    : [];

  autoTable(doc, {
    startY: 80,
    head: [["Component", "Amount"]],
    body: rows,
  });

  doc.save(`${employeeName}-${periodStart}-${periodStart}-Payslip.pdf`);
};
