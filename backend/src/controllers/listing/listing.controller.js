const listingService = require("../../services/listing/listing.service");
const ApiResponse     = require("../../utils/ApiResponse");
const ApiError        = require("../../utils/ApiError");

const createListing = async (req, res, next) => {
  try {
    const listing = await listingService.createListing(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, listing, "Listing created"));
  } catch (err) { next(err); }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await listingService.updateListing(req.params.id, req.user._id, req.body);
    res.status(200).json(new ApiResponse(200, listing, "Listing updated"));
  } catch (err) { next(err); }
};

const deleteListing = async (req, res, next) => {
  try {
    const result = await listingService.deleteListing(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, result, "Listing deleted"));
  } catch (err) { next(err); }
};

const submitListing = async (req, res, next) => {
  try {
    const listing = await listingService.submitListing(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(200, listing, "Listing submitted for approval"));
  } catch (err) { next(err); }
};

const addPhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "No photo files provided");
    }
    const listing = await listingService.addPhotos(req.params.id, req.user._id, req.files);
    res.status(200).json(new ApiResponse(200, listing, "Photos uploaded"));
  } catch (err) { next(err); }
};

const deletePhoto = async (req, res, next) => {
  try {
    // WHY photo URL comes from body, not URL param:
    // S3 URLs contain characters (colons, slashes) that are awkward
    // and error-prone to pass as a raw URL path segment.
    const listing = await listingService.deletePhoto(req.params.id, req.user._id, req.body.photoUrl);
    res.status(200).json(new ApiResponse(200, listing, "Photo removed"));
  } catch (err) { next(err); }
};

const getMyListings = async (req, res, next) => {
  try {
    const result = await listingService.getMyListings(req.user._id, req.query);
    res.status(200).json(new ApiResponse(200, result));
  } catch (err) { next(err); }
};

module.exports = {
  createListing, updateListing, deleteListing,
  submitListing, addPhotos, deletePhoto, getMyListings,
};