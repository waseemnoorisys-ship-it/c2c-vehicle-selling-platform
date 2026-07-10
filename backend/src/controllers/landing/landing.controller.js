const ApiResponse = require("../../utils/ApiResponse");
const AppSettings = require("../../models/appSettings/appSettings.model");
const CmsPage = require("../../models/cmsPage/cmsPage.model");
const Listing = require("../../models/listing/listing.model");
const User = require("../../models/user/user.model");
const makeService = require("../../services/make/make.service");
const modelService = require("../../services/model/model.service");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");

function buildPriceRanges(minCents, maxCents) {
  const any = { label: "Any price", value: "", min: "", max: "" };

  if (!minCents || !maxCents) {
    return [
      any,
      { label: "Under €15,000", value: "0-15000", min: 0, max: 15000 },
      { label: "€15,000 – €30,000", value: "15000-30000", min: 15000, max: 30000 },
      { label: "€30,000 – €50,000", value: "30000-50000", min: 30000, max: 50000 },
      { label: "Over €50,000", value: "50000-", min: 50000, max: "" },
    ];
  }

  const minEuro = Math.floor(minCents / 100 / 5000) * 5000;
  const maxEuro = Math.ceil(maxCents / 100 / 5000) * 5000;
  const span = maxEuro - minEuro || 5000;
  const step = Math.max(5000, Math.round(span / 4 / 5000) * 5000);
  const ranges = [any];

  for (let start = minEuro; start < maxEuro; start += step) {
    const end = start + step;
    ranges.push({
      label: `€${start.toLocaleString("en-US")} – €${end.toLocaleString("en-US")}`,
      value: `${start}-${end}`,
      min: start,
      max: end,
    });
  }

  ranges.push({
    label: `Over €${maxEuro.toLocaleString("en-US")}`,
    value: `${maxEuro}-`,
    min: maxEuro,
    max: "",
  });

  return ranges;
}

const getLandingData = async (req, res, next) => {
  try {
    const lang = getLang(req);
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
        t("success.landing.fetched", lang)
      )
    );
  } catch (err) {
    next(err);
  }
};

const getSearchFilters = async (req, res, next) => {
  try {
    const lang = getLang(req);

    const [makes, models, priceStats] = await Promise.all([
      makeService.findAll({ isActive: true }, 0, 500),
      modelService.findAll({ isActive: true }, 0, 5000),
      Listing.aggregate([
        {
          $match: {
            status: "approved",
            deletedAt: null,
            displayPrice: { $gt: 0 },
          },
        },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$displayPrice" },
            maxPrice: { $max: "$displayPrice" },
          },
        },
      ]),
    ]);

    const modelsByMake = {};
    for (const model of models) {
      const makeId = model.makeId.toString();
      if (!modelsByMake[makeId]) modelsByMake[makeId] = [];
      modelsByMake[makeId].push({
        id: model._id.toString(),
        name: model.name,
      });
    }

    const stats = priceStats[0] || {};

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          makes: makes.map((make) => ({
            id: make._id.toString(),
            name: make.name,
          })),
          models: modelsByMake,
          priceRanges: buildPriceRanges(stats.minPrice, stats.maxPrice),
        },
        t("success.landing.searchFilters", lang)
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getLandingData, getSearchFilters };
