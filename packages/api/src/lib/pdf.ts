import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Payslip } from "@mini-payrun/shared";
import { formatDate } from "./dayjs";

export const generatePayslipPDF = (
  periodStart: string,
  periodEnd: string,
  employeeName: string,
  payslip: Payslip,
): jsPDF => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Payslip for ${employeeName}`, 14, 20);

  // Period
  doc.setFontSize(12);
  doc.text(`Period: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`, 14, 30);

  // Payslip details
  const rows = [
    ["Normal Hours", payslip.normalHours],
    ["Overtime Hours", payslip.overtimeHours],
    ["Gross", `$${payslip.gross.toFixed(2)}`],
    ["Tax", `$${payslip.tax.toFixed(2)}`],
    ["Super", `$${payslip.super.toFixed(2)}`],
    ["Net", `$${payslip.net.toFixed(2)}`],
  ];

  autoTable(doc, {
    startY: 40,
    head: [["Component", "Amount"]],
    body: rows,
  });

  return doc;
};
