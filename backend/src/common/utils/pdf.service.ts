import PDFDocument from "pdfkit";
import { Response } from "express";

interface InvoicePdfData {
  invoiceNumber: string;
  studentName: string;
  classLevel: string;
  section: string;
  month: number;
  year: number;
  amountDue: number;
  amountPaid: number;
  status: string;
  dueDate: Date;
}

export const generateInvoicePdf = (res: Response, data: InvoicePdfData) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${data.invoiceNumber}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).text("Smart Micro-CRM — School Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Invoice #: ${data.invoiceNumber}`, { align: "right" });
  doc.text(`Due Date: ${data.dueDate.toDateString()}`, { align: "right" });
  doc.moveDown(2);

  doc.fontSize(12).text(`Student: ${data.studentName}`);
  doc.text(`Class: ${data.classLevel} — Section ${data.section}`);
  doc.text(`Period: ${data.month}/${data.year}`);
  doc.moveDown();

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(12).text(`Amount Due:`, 50, doc.y, { continued: true }).text(`  Rs. ${data.amountDue}`, { align: "right" });
  doc.text(`Amount Paid:`, 50, doc.y, { continued: true }).text(`  Rs. ${data.amountPaid}`, { align: "right" });
  doc.text(`Balance:`, 50, doc.y, { continued: true }).text(`  Rs. ${data.amountDue - data.amountPaid}`, { align: "right" });
  doc.moveDown();
  doc.fontSize(14).text(`Status: ${data.status}`, { align: "center" });

  doc.end();
};

interface ReceiptPdfData {
  receiptNumber: string;
  studentName: string;
  amount: number;
  method: string;
  paidAt: Date;
  invoiceNumber: string;
}

export const generateReceiptPdf = (res: Response, data: ReceiptPdfData) => {
  const doc = new PDFDocument({ margin: 50, size: [300, 400] }); // chhota receipt-size page

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=receipt-${data.receiptNumber}.pdf`);

  doc.pipe(res);

  doc.fontSize(16).text("Payment Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(9).text(`Receipt #: ${data.receiptNumber}`);
  doc.text(`Date: ${data.paidAt.toLocaleString()}`);
  doc.moveDown();

  doc.moveTo(20, doc.y).lineTo(280, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(10).text(`Student: ${data.studentName}`);
  doc.text(`Against Invoice: ${data.invoiceNumber}`);
  doc.text(`Payment Method: ${data.method}`);
  doc.moveDown();
  doc.fontSize(14).text(`Amount Paid: Rs. ${data.amount}`, { align: "center" });
  doc.moveDown(2);
  doc.fontSize(8).text("Thank you!", { align: "center" });

  doc.end();
};
interface BarberDashboardPdfData {
  date: string;
  todayAppointments: number;
  todayRevenue: number;
  todayCompletedPayments: number;
  workspaceName: string;
}

export const generateBarberDashboardPdf = (res: Response, data: BarberDashboardPdfData) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=barber-dashboard-${data.date}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).text(data.workspaceName, { align: "center" });
  doc.fontSize(14).text("Daily Dashboard Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Date: ${data.date}`, { align: "right" });
  doc.moveDown(2);

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(12).text(`Today's Appointments:`, 50, doc.y, { continued: true }).text(`  ${data.todayAppointments}`, { align: "right" });
  doc.text(`Completed Payments:`, 50, doc.y, { continued: true }).text(`  ${data.todayCompletedPayments}`, { align: "right" });
  doc.text(`Today's Revenue:`, 50, doc.y, { continued: true }).text(`  Rs. ${data.todayRevenue}`, { align: "right" });
  doc.moveDown(2);

  doc.fontSize(8).text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });

  doc.end();
};

interface GymDashboardPdfData {
  workspaceName: string;
  totalActiveMembers: number;
  expiredMembers: number;
  expiringThisWeek: number;
  monthlyRevenue: number;
  monthlyRenewals: number;
}

export const generateGymDashboardPdf = (res: Response, data: GymDashboardPdfData) => {
  const doc = new PDFDocument({ margin: 50 });
  const reportDate = new Date().toISOString().split("T")[0];

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=gym-dashboard-${reportDate}.pdf`);

  doc.pipe(res);

  doc.fontSize(20).text(data.workspaceName, { align: "center" });
  doc.fontSize(14).text("Gym Dashboard Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Date: ${reportDate}`, { align: "right" });
  doc.moveDown(2);

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(12).text(`Total Active Members:`, 50, doc.y, { continued: true }).text(`  ${data.totalActiveMembers}`, { align: "right" });
  doc.text(`Expired Members:`, 50, doc.y, { continued: true }).text(`  ${data.expiredMembers}`, { align: "right" });
  doc.text(`Expiring This Week:`, 50, doc.y, { continued: true }).text(`  ${data.expiringThisWeek}`, { align: "right" });
  doc.moveDown();
  doc.text(`Monthly Revenue:`, 50, doc.y, { continued: true }).text(`  Rs. ${data.monthlyRevenue}`, { align: "right" });
  doc.text(`Monthly Renewals:`, 50, doc.y, { continued: true }).text(`  ${data.monthlyRenewals}`, { align: "right" });
  doc.moveDown(2);

  doc.fontSize(8).text(`Generated on ${new Date().toLocaleString()}`, { align: "center" });

  doc.end();
};