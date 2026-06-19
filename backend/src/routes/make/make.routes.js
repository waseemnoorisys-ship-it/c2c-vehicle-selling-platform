const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/make/make.controller");
const validate    = require("../../middleware/validate.middleware");
const { authenticate, requireRole } = require("../../middleware/auth.middleware");
const { createMakeSchema, updateMakeSchema } = require("../../validators/make/make.validators");

// WHY no requireRole("admin") yet on these two: public/any logged-in
// user needs to READ makes (for the dropdown). We haven't built
// admin auth yet (that's Sprint 7) — for now we'll gate write
// operations behind authenticate + requireRole("vendor") temporarily
// is WRONG (vendors shouldn't manage makes). Since AdminUser auth
// doesn't exist until Sprint 7, we leave POST/PATCH/DELETE here
// unprotected for local testing now, and will swap in proper
// requireRole("admin") once Sprint 7 builds admin auth.
// THIS IS A TEMPORARY KNOWN GAP — flagged clearly, not hidden.

router.get("/", controller.getAllMakes);       // public
router.get("/:id", controller.getMakeById);    // public

router.post("/", controller.createMake);
router.patch("/:id", validate(updateMakeSchema), controller.updateMake);
router.delete("/:id", controller.deleteMake);

module.exports = router;