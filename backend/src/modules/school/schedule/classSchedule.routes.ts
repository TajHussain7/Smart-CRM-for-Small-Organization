import { Router } from "express";
import { create, list, listByClass } from "./classSchedule.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { createScheduleSchema } from "./classSchedule.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createScheduleSchema), create);
router.get("/", list);
router.get("/class/:classLevel/section/:section", listByClass);

export default router;