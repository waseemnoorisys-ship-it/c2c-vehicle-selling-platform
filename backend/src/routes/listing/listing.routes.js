const express    = require("express");
const router     = express.Router();
const controller = require("../../controllers/listing/listing.controller");
const validate   = require("../../middleware/validate.middleware");
const { authenticate, requireRole } = require("../../middleware/auth.middleware");
const { handleListingPhotosUpload } = require("../../middleware/upload.middleware");
const {
  createListingSchema,
  createListingWithPhotosSchema,
  updateListingSchema,
  browseListingsSchema,
  getListingByIdSchema,
  listingIdSchema,
  deletePhotoSchema,
  getMyListingsSchema,
} = require("../../validators/listing/listing.validators");

router.post("/browse", validate(browseListingsSchema), controller.browseListings);
router.post("/get", validate(getListingByIdSchema), controller.getPublicListingById);

router.use(authenticate, requireRole("vendor"));

router.post("/mine", validate(getMyListingsSchema), controller.getMyListings);
router.post("/create", validate(createListingSchema), controller.createListing);
router.post(
  "/create-with-photos",
  handleListingPhotosUpload,
  validate(createListingWithPhotosSchema),
  controller.createListingWithPhotos
);
router.post("/update", validate(updateListingSchema), controller.updateListing);
router.post("/delete", validate(listingIdSchema), controller.deleteListing);
router.post("/submit", validate(listingIdSchema), controller.submitListing);
router.post("/photos/add", handleListingPhotosUpload, controller.addPhotos);
router.post("/photos/delete", validate(deletePhotoSchema), controller.deletePhoto);

module.exports = router;
