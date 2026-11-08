import mongoose from "mongoose";
import { Student } from "../students/student.model";
import { Invoice } from "../invoices/invoice.model";
import { FeePayment } from "../invoices/payment.model";
import { ClassSchedule } from "../schedule/classSchedule.model";
import { Task } from "../../tasks/task.model";
import { InvoiceStatus } from "../../../common/constants/invoiceStatus";
import { TaskStatus } from "../../../common/constants/taskStatus";
import { DayOfWeek } from "../../../common/constants/dayOfWeek";

// JS ka getDay() 0=Sunday se shuru hota hai, isliye mapping array
const DAY_BY_INDEX: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

export const getSchoolDashboardSummary = async (workspaceId: string) => {
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const startOfMonth = new Date(year, now.getMonth(), 1);
  const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 1. Total students
  const totalStudents = await Student.countDocuments({ workspaceId: workspaceObjectId });

  // 2. Class-wise breakdown (classLevel + section)
  const classBreakdown = await Student.aggregate([
    { $match: { workspaceId: workspaceObjectId } },
    {
      $group: {
        _id: { classLevel: "$classLevel", section: "$section" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.classLevel": 1, "_id.section": 1 } },
  ]);

  // 3. Is mahine ki collection (jo payments is mahine record hui)
  const collectionResult = await FeePayment.aggregate([
    {
      $match: {
        workspaceId: workspaceObjectId,
        paidAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const monthlyCollection = collectionResult[0] || { total: 0, count: 0 };

  // 4. Is mahine ke invoices ka pending balance
  const pendingResult = await Invoice.aggregate([
    {
      $match: {
        workspaceId: workspaceObjectId,
        month,
        year,
        status: { $ne: InvoiceStatus.PAID },
      },
    },
    {
      $group: {
        _id: null,
        pendingAmount: { $sum: { $subtract: ["$amountDue", "$amountPaid"] } },
        pendingInvoices: { $sum: 1 },
      },
    },
  ]);
  const pending = pendingResult[0] || { pendingAmount: 0, pendingInvoices: 0 };

  // 5. Overdue invoices (saare mahino ki, sirf current nahi)
  const overdueInvoices = await Invoice.countDocuments({
    workspaceId: workspaceObjectId,
    status: InvoiceStatus.OVERDUE,
  });

  // 6. Aaj ki classes
  const todayDay = DAY_BY_INDEX[now.getDay()];
  const todaysClasses = await ClassSchedule.find({
    workspaceId: workspaceObjectId,
    dayOfWeek: todayDay,
  })
    .populate("teacherId", "name")
    .sort({ startTime: 1 });

  // 7. Overdue tasks
  const overdueTasks = await Task.countDocuments({
    workspaceId: workspaceObjectId,
    status: TaskStatus.OVERDUE,
  });

  return {
    period: { month, year },
    totalStudents,
    classBreakdown: classBreakdown.map((c) => ({
      classLevel: c._id.classLevel,
      section: c._id.section,
      students: c.count,
    })),
    fees: {
      monthlyCollection: monthlyCollection.total,
      paymentsThisMonth: monthlyCollection.count,
      pendingAmount: pending.pendingAmount,
      pendingInvoices: pending.pendingInvoices,
      overdueInvoices,
    },
    today: {
      day: todayDay,
      classes: todaysClasses,
    },
    overdueTasks,
  };
};