import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../modules/auth/auth.routes";
import workspaceRoutes from "../modules/workspaces/workspace.routes";
import userRoutes from "../modules/users/user.routes";
import taskRoutes from "../modules/tasks/task.routes";

// School routes
import schoolStudentRoutes from "../modules/school/students/student.routes";
import schoolTeacherRoutes from "../modules/school/teachers/teacher.routes";
import schoolAttendanceRoutes from "../modules/school/attendance/attendance.routes";
import schoolInvoiceRoutes from "../modules/school/invoices/invoice.routes";
import classScheduleRoutes from "../modules/school/schedule/classSchedule.routes";
import schoolDashboardRoutes from "../modules/school/dashboard/dashboard.routes";

// Barber routes
import barberClientRoutes from "../modules/barber/clients/client.routes";
import barberServiceRoutes from "../modules/barber/services/service.routes";
import barberAppointmentRoutes from "../modules/barber/appointments/appointment.routes";
import barberPaymentRoutes from "../modules/barber/payments/payment.routes";
import barberDashboardRoutes from "../modules/barber/dashboard/dashboard.routes";
import barberReportRoutes from "../modules/barber/reports/reports.routes";

// Gym routes
import gymMemberRoutes from "../modules/gym/members/member.routes";
import gymSessionRoutes from "../modules/gym/sessions/session.routes";
import gymDashboardRoutes from "../modules/gym/dashboard/dashboard.routes";
import gymReportRoutes from "../modules/gym/reports/reports.routes";

// Notifications / Alerts routes
import alertRoutes from "../modules/notifications/alert.routes";

// Shared services (Abstract requirements)
import interactionRoutes from "../modules/interactions/interaction.routes";
import aiRoutes from "../modules/ai/ai.routes";

const router = Router();

// Base / Shared
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/alerts", alertRoutes);
router.use("/interactions", interactionRoutes);
router.use("/ai", aiRoutes);

// School Management Module
router.use("/school/students", schoolStudentRoutes);
router.use("/school/teachers", schoolTeacherRoutes);
router.use("/school/attendance", schoolAttendanceRoutes);
router.use("/school/invoices", schoolInvoiceRoutes);
router.use("/school/schedule", classScheduleRoutes);
router.use("/school/dashboard", schoolDashboardRoutes);

// Barber Shop Module
router.use("/barber/clients", barberClientRoutes);
router.use("/barber/services", barberServiceRoutes);
router.use("/barber/appointments", barberAppointmentRoutes);
router.use("/barber/payments", barberPaymentRoutes);
router.use("/barber/dashboard", barberDashboardRoutes);
router.use("/barber/reports", barberReportRoutes);

// Gym Management Module
router.use("/gym/members", gymMemberRoutes);
router.use("/gym/sessions", gymSessionRoutes);
router.use("/gym/dashboard", gymDashboardRoutes);
router.use("/gym/reports", gymReportRoutes);

export default router;
