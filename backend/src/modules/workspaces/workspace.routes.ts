import { Router } from "express";
import { create, getMine, update } from "./workspace.controller";
import { authenticate } from "../../common/middleware/auth.middleware";
import { attachTenant } from "../../common/middleware/tenant.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from "./workspace.validation";
import { UserRole } from "../../common/constants/roles";

const router = Router();

router.post("/", authenticate, validate(createWorkspaceSchema), create);
router.get("/me", authenticate, getMine);
router.patch(
  "/me",
  authenticate,
  attachTenant,
  authorize(UserRole.ADMIN),
  validate(updateWorkspaceSchema),
  update
);

export default router;
