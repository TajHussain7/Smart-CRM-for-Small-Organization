import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../modules/auth/auth.routes";
import workspaceRoutes from "../modules/workspaces/workspace.routes";
import taskRoutes from "../modules/tasks/task.routes";
import schoolStudentRoutes from "../modules/school/students/student.routes";
import schoolInvoiceRoutes from "../modules/school/invoices/invoice.routes";
import classScheduleRoutes from "../modules/school/schedule/classSchedule.routes";
import schoolDashboardRoutes from "../modules/school/dashboard/dashboard.routes";
import appointmentRoutes from "../modules/barber/appointments/appointment.routes";
import gymMemberRoutes from "../modules/gym/members/member.routes";
import gymSessionRoutes from "../modules/gym/sessions/session.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/tasks", taskRoutes);
router.use("/school/students", schoolStudentRoutes);
router.use("/school/invoices", schoolInvoiceRoutes);
router.use("/school/schedule", classScheduleRoutes);
router.use("/school/dashboard", schoolDashboardRoutes);
router.use("/barber/appointments", appointmentRoutes);
router.use("/gym/members", gymMemberRoutes);
router.use("/gym/sessions", gymSessionRoutes);

export default router;