import { Router } from "express";
import { create, getMine } from "./workspace.controller";
import { authenticate } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createWorkspaceSchema } from "./workspace.validation";

const router = Router();

router.post("/", authenticate, validate(createWorkspaceSchema), create);
router.get("/me", authenticate, getMine);

export default router;