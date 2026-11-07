import { Router } from "express";
import { register, login, refresh, getMe } from "./auth.controller";
import { validate } from "../../common/middleware/validate.middleware";
import { registerSchema, loginSchema } from "./auth.validation";
import { authRateLimiter } from "../../common/middleware/rateLimit.middleware";
import { authenticate } from "../../common/middleware/auth.middleware";
import { attachTenant } from "../../common/middleware/tenant.middleware";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.get("/me", authenticate, attachTenant, getMe);

export default router;