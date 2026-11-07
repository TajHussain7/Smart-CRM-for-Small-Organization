import { Router } from "express";
import { create, list, getOne } from "./member.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { createMemberSchema } from "./member.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createMemberSchema), create);
router.get("/", list);
router.get("/:id", getOne);

export default router;