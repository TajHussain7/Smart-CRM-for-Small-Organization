import { Router } from "express";
import {
  list,
  getOne,
  create,
  update,
  remove,
} from "./user.controller";
import { authenticate } from "../../common/middleware/auth.middleware";
import { attachTenant } from "../../common/middleware/tenant.middleware";
import { authorize } from "../../common/middleware/authorize.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createUserSchema, updateUserSchema } from "./user.validation";
import { UserRole } from "../../common/constants/roles";

const router = Router();

router.use(authenticate, attachTenant);

router.get("/", list);
router.get("/:id", getOne);
router.post(
  "/",
  authorize(UserRole.ADMIN),
  validate(createUserSchema),
  create
);
router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  validate(updateUserSchema),
  update
);
router.delete("/:id", authorize(UserRole.ADMIN), remove);

export default router;

