const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const AppSettings = require("../../models/appSettings/appSettings.model");
const CmsPage = require("../../models/cmsPage/cmsPage.model");
const Listing = require("../../models/listing/listing.model");
const User = require("../../models/user/user.model");

const getLandingData = async (req, res, next) => {
  try {
    const [settings, pages, totalListings, totalVendors] = await Promise.all([
      AppSettings.findOne({}),
      CmsPage.find({ isActive: true, deletedAt: null })
        .select("title slug")
        .sort({ createdAt: 1 }),
      Listing.countDocuments({ status: "approved", deletedAt: null }),
      User.countDocuments({ role: "vendor", deletedAt: null }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          platform: {
            name: settings?.platformName || "C2C Vehicles",
            supportEmail: settings?.supportEmail || "",
            contactPhone: settings?.contactPhone || "",
            contactAddress: settings?.contactAddress || "",
          },
          stats: {
            totalListings,
            totalVendors,
          },
          pages,
        },
        "Landing data fetched"
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getLandingData };