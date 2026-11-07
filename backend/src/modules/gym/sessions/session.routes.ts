import { Router } from "express";
import { create, list, updateStatus } from "./session.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { createSessionSchema } from "./session.validation";
import { z } from "zod";
import { AppointmentStatus } from "../../../common/constants/appointmentStatus";

const updateStatusSchema = z.object({ status: z.nativeEnum(AppointmentStatus) });

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createSessionSchema), create);
router.get("/", list);
router.patch("/:id/status", validate(updateStatusSchema), updateStatus);

export default router;