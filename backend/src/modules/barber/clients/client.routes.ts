import { Router } from "express";
import { create, list, getOne } from "./client.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { createClientSchema } from "./client.validation";

const router = Router();

router.use(authenticate, attachTenant); // yeh line saare routes ke liye protection lagati hai

router.post("/", validate(createClientSchema), create);
router.get("/", list);
router.get("/:id", getOne);

export default router;