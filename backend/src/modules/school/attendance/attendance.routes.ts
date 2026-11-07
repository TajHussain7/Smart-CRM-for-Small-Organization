import { Router } from "express";
import {
  mark,
  bulkMark,
  list,
  summary,
  update,
} from "./attendance.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import {
  markAttendanceSchema,
  bulkMarkAttendanceSchema,
  updateAttendanceSchema,
} from "./attendance.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(markAttendanceSchema), mark);
router.post("/bulk", validate(bulkMarkAttendanceSchema), bulkMark);
router.get("/", list);
router.get("/summary", summary);
router.patch("/:id", validate(updateAttendanceSchema), update);

export default router;

