import { Router } from "express";
import {
  create,
  list,
  getOne,
  update,
  deactivate,
} from "./service.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import {
  createServiceSchema,
  updateServiceSchema,
} from "./service.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createServiceSchema), create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", validate(updateServiceSchema), update);
router.delete("/:id", deactivate);

export default router;

