import { Request, Response, NextFunction } from "express";
import {
  generateMonthlyInvoices,
  recordFeePayment,
  getInvoices,
  getPayments,
} from "./invoice.service";
import { sendSuccess } from "../../../common/utils/apiResponse";
import { getInvoiceForPdf, getPaymentForReceipt } from "./invoice.service";
import { generateInvoicePdf, generateReceiptPdf } from "../../../common/utils/pdf.service";

export const generate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const result = await generateMonthlyInvoices({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Invoices generated", result);
  } catch (error) {
    next(error);
  }
};

export const pay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const result = await recordFeePayment({ workspaceId, ...req.body });
    return sendSuccess(res, 201, "Payment recorded", result);
  } catch (error) {
    next(error);
  }
};

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const invoices = await getInvoices(workspaceId);
    return sendSuccess(res, 200, "Invoices fetched", invoices);
  } catch (error) {
    next(error);
  }
};

export const listPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const payments = await getPayments(workspaceId);
    return sendSuccess(res, 200, "Payments fetched", payments);
  } catch (error) {
    next(error);
  }
};

export const downloadInvoicePdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const invoiceId = req.params.id as string;
    const invoice: any = await getInvoiceForPdf(workspaceId, invoiceId);

    generateInvoicePdf(res, {
      invoiceNumber: invoice.invoiceNumber,
      studentName: invoice.studentId.name,
      classLevel: invoice.studentId.classLevel,
      section: invoice.studentId.section,
      month: invoice.month,
      year: invoice.year,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      status: invoice.status,
      dueDate: invoice.dueDate,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadReceiptPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const paymentId = req.params.id as string;
    const payment: any = await getPaymentForReceipt(workspaceId, paymentId);

    generateReceiptPdf(res, {
      receiptNumber: payment.receiptNumber,
      studentName: payment.invoiceId.studentId.name,
      amount: payment.amount,
      method: payment.method,
      paidAt: payment.paidAt,
      invoiceNumber: payment.invoiceId.invoiceNumber,
    });
  } catch (error) {
    next(error);
  }
};