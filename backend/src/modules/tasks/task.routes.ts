import { Router } from "express";
import { create, list, listMine, updateStatus } from "./task.controller";
import { authenticate } from "../../common/middleware/auth.middleware";
import { attachTenant } from "../../common/middleware/tenant.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createTaskSchema, updateTaskStatusSchema } from "./task.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createTaskSchema), create);
router.get("/", list);
router.get("/mine", listMine);
router.patch("/:id/status", validate(updateTaskStatusSchema), updateStatus);

export default router;