const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/listing/listing.controller");
const validate    = require("../../middleware/validate.middleware");
const { authenticate, requireRole } = require("../../middleware/auth.middleware");
const { handleListingPhotosUpload } = require("../../middleware/upload.middleware");
const { createListingSchema, updateListingSchema } = require("../../validators/listing/listing.validators");

// WHY every route here requires vendor role: in Sprint 2, ALL listing
// write operations are vendor-only. Public browsing (GET /listings,
// no auth) comes in Sprint 3 as a SEPARATE route file/endpoint —
// we don't mix "manage my listings" with "browse all listings" in one file.
router.use(authenticate, requireRole("vendor"));

router.get("/mine", controller.getMyListings);

router.post("/", validate(createListingSchema), controller.createListing);
router.patch("/:id", validate(updateListingSchema), controller.updateListing);
router.delete("/:id", controller.deleteListing);
router.patch("/:id/submit", controller.submitListing);

router.post("/:id/photos", handleListingPhotosUpload, controller.addPhotos);
router.delete("/:id/photos", controller.deletePhoto);

module.exports = router;