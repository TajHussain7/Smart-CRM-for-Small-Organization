import { Router } from "express";
import { create, list, getOne } from "./student.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { createStudentSchema } from "./student.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createStudentSchema), create);
router.get("/", list);
router.get("/:id", getOne);

export default router;