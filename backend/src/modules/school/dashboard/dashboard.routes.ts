import { Router } from "express";
import { summary } from "./dashboard.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";

const router = Router();

router.use(authenticate, attachTenant);

router.get("/summary", summary);

export default router;