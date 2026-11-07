import { Router } from "express";
import { create, list, getOne, update } from "./client.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { createClientSchema, updateClientSchema } from "./client.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createClientSchema), create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", validate(updateClientSchema), update);

export default router;
