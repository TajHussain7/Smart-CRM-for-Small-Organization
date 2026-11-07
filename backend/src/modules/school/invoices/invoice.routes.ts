import { Router } from "express";
import { generate, pay, listInvoices, listPayments } from "./invoice.controller";
import { authenticate } from "../../../common/middleware/auth.middleware";
import { attachTenant } from "../../../common/middleware/tenant.middleware";
import { validate } from "../../../common/middleware/validate.middleware";
import { generateInvoicesSchema, recordPaymentSchema } from "./invoice.validation";
import { downloadInvoicePdf, downloadReceiptPdf } from "./invoice.controller";
const router = Router();

router.use(authenticate, attachTenant);

router.post("/generate", validate(generateInvoicesSchema), generate);
router.post("/pay", validate(recordPaymentSchema), pay);
router.get("/", listInvoices);
router.get("/payments", listPayments);
router.get("/:id/pdf", downloadInvoicePdf);
router.get("/payments/:id/receipt", downloadReceiptPdf);
export default router;