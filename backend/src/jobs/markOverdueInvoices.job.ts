import cron from "node-cron";
import { Invoice } from "../modules/school/invoices/invoice.model";
import { InvoiceStatus } from "../common/constants/invoiceStatus";
import { Task } from "../modules/tasks/task.model";
import { TaskStatus } from "../common/constants/taskStatus";

export const markOverdueInvoicesJob = async () => {
  const invoiceResult = await Invoice.updateMany(
    {
      dueDate: { $lt: new Date() },
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] },
    },
    { $set: { status: InvoiceStatus.OVERDUE } }
  );

  const taskResult = await Task.updateMany(
    {
      dueDate: { $lt: new Date() },
      status: { $in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
    },
    { $set: { status: TaskStatus.OVERDUE } }
  );

  console.log(
    `[Overdue Job] Invoices: ${invoiceResult.modifiedCount}, Tasks: ${taskResult.modifiedCount}`
  );
};

export const scheduleOverdueInvoicesJob = () => {
  cron.schedule("5 0 * * *", async () => {
    try {
      await markOverdueInvoicesJob();
    } catch (error) {
      console.error("[Overdue Job] Failed:", error);
    }
  });

  console.log("Overdue job scheduled (runs daily at 00:05) — covers invoices and tasks");
};