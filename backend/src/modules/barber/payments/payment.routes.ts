import { Router } from "express";
import { create, list } from "./payment.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { createPaymentSchema } from "./payment.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createPaymentSchema), create);
router.get("/", list);

export default router;