import { Router } from "express";
import { summary, summaryPdf } from "./dashboard.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";

const router = Router();

router.use(authenticate, attachTenant);

router.get("/", summary);
router.get("/summary", summary);
router.get("/summary/pdf", summaryPdf);

export default router;