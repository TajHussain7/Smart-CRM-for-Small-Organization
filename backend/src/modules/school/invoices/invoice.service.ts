import { Invoice } from "./invoice.model";
import { FeePayment } from "./payment.model";
import { Student } from "../students/student.model";
import { InvoiceStatus } from "../../../common/constants/invoiceStatus";
import { PaymentMethod } from "../../../common/constants/paymentMethod";
import { generateInvoiceNumber } from "../../../common/utils/invoiceNumber";
import { NotFoundError, BadRequestError } from "../../../common/errors";

const DUE_DAY_OF_MONTH = 10; // fee due har mahine ki 10 tareekh tak

interface GenerateInvoicesInput {
  workspaceId: string;
  month: number;
  year: number;
}

export const generateMonthlyInvoices = async (input: GenerateInvoicesInput) => {
  const students = await Student.find({ workspaceId: input.workspaceId });

  const dueDate = new Date(input.year, input.month - 1, DUE_DAY_OF_MONTH);
  let created = 0;
  let skipped = 0;

  for (const student of students) {
    const existing = await Invoice.findOne({
      workspaceId: input.workspaceId,
      studentId: student._id,
      month: input.month,
      year: input.year,
    });

    if (existing) {
      skipped++;
      continue;
    }

    const count = await Invoice.countDocuments({ workspaceId: input.workspaceId });
    const invoiceNumber = generateInvoiceNumber(input.year, input.month, count + 1);

    await Invoice.create({
      workspaceId: input.workspaceId,
      studentId: student._id,
      invoiceNumber,
      month: input.month,
      year: input.year,
      amountDue: student.monthlyFee,
      amountPaid: 0,
      status: InvoiceStatus.PENDING,
      dueDate,
    });
    created++;
  }

  return { created, skipped, totalStudents: students.length };
};

interface RecordPaymentInput {
  workspaceId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
}

export const recordFeePayment = async (input: RecordPaymentInput) => {
  const invoice = await Invoice.findOne({ _id: input.invoiceId, workspaceId: input.workspaceId });
  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }

  const remainingBalance = invoice.amountDue - invoice.amountPaid;
  if (input.amount > remainingBalance) {
    throw new BadRequestError(
      `Payment exceeds remaining balance. Remaining: ${remainingBalance}`
    );
  }

  const paymentCount = await FeePayment.countDocuments({ workspaceId: input.workspaceId });
  const receiptNumber = `RCP-${Date.now()}-${paymentCount + 1}`;

  const payment = await FeePayment.create({
    workspaceId: input.workspaceId,
    invoiceId: input.invoiceId,
    amount: input.amount,
    method: input.method,
    receiptNumber,
  });

  invoice.amountPaid += input.amount;
  invoice.status =
    invoice.amountPaid >= invoice.amountDue ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;
  await invoice.save();

  return { payment, invoice };
};

export const getInvoices = async (workspaceId: string) => {
  return Invoice.find({ workspaceId }).populate("studentId", "name className").sort({ dueDate: -1 });
};

export const getPayments = async (workspaceId: string) => {
  return FeePayment.find({ workspaceId })
    .populate({ path: "invoiceId", populate: { path: "studentId", select: "name className" } })
    .sort({ paidAt: -1 });
};
export const getInvoiceForPdf = async (workspaceId: string, invoiceId: string) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, workspaceId }).populate(
    "studentId",
    "name classLevel section"
  );
  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }
  return invoice;
};

export const getPaymentForReceipt = async (workspaceId: string, paymentId: string) => {
  const payment = await FeePayment.findOne({ _id: paymentId, workspaceId }).populate({
    path: "invoiceId",
    populate: { path: "studentId", select: "name" },
  });
  if (!payment) {
    throw new NotFoundError("Payment not found");
  }
  return payment;
};