import { Router } from "express";
import { getReports, exportCsv } from "./reports.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";

const router = Router();

router.use(authenticate, attachTenant);

router.get("/", getReports);
router.get("/csv", exportCsv);

export default router;

