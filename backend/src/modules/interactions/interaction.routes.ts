import { Router } from "express";
import { list } from "./interaction.controller";
import { authenticate } from "../../common/middleware/auth.middleware";
import { attachTenant } from "../../common/middleware/tenant.middleware";

const router = Router();

router.use(authenticate, attachTenant);

router.get("/", list);

export default router;

