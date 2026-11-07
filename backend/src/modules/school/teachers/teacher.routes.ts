import { Router } from "express";
import {
  create,
  list,
  getOne,
  update,
  remove,
} from "./teacher.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "./teacher.validation";

const router = Router();

router.use(authenticate, attachTenant);

router.post("/", validate(createTeacherSchema), create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", validate(updateTeacherSchema), update);
router.delete("/:id", remove);

export default router;

