import { Router } from "express";
import {
  listAlerts,
  unreadCount,
  markRead,
  markAllRead,
  retryAlertById,
} from "./alert.controller";
import { authenticate } from "../../common/middleware/auth.middleware";
import { attachTenant } from "../../common/middleware/tenant.middleware";

const router = Router();

router.use(authenticate, attachTenant);

router.get("/", listAlerts);
router.get("/unread-count", unreadCount);
router.patch("/mark-all-read", markAllRead);
router.patch("/:id/read", markRead);
router.post("/:id/retry", retryAlertById);

export default router;

