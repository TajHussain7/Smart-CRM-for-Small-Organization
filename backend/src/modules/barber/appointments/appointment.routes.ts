import { Router } from "express";
import { create, list, getOne } from "./appointment.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { createAppointmentSchema } from "./appointment.validation";
import { updateStatus } from "./appointment.controller";
import { updateStatusSchema } from "./appointment.validation";
const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createAppointmentSchema), create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id/status", validate(updateStatusSchema), updateStatus);
export default router;