const mongoose = require("mongoose");
const Listing = require("../../models/listing/listing.model");
const { UCP_VERSION } = require("../../ucp/ucp.profile");

const CURRENCY = process.env.UCP_CURRENCY || "EUR";

function ucpMetadata(capability) {
  return {
    version: UCP_VERSION,
    capabilities: {
      [capability]: [{ version: UCP_VERSION }],
    },
  };
}

function toProduct(listing) {
  const make = listing.makeId?.name || "";
  const model = listing.modelId?.name || "";
  const title = `${listing.year} ${make} ${model}`.trim();
  const imageUrl = listing.coverPhoto || listing.photos?.[0]?.url;

  return {
    id: listing._id.toString(),
    title,
    description: listing.description || `${title} vehicle listing`,
    url: `${(process.env.APP_URL || "http://localhost:5000").replace(/\/$/, "")}/vehicles/${listing._id}`,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    price: {
      amount: listing.displayPrice,
      currency: CURRENCY,
    },
    availability: "in_stock",
    vehicle: {
      make,
      model,
      year: listing.year,
      mileage: listing.mileage,
      fuel_type: listing.fuelType,
      transmission: listing.transmission,
      condition: listing.condition,
      location: listing.locationText || "",
    },
  };
}

function buildFilter(query, filters = {}) {
  const filter = { status: "approved", deletedAt: null };
  const search = typeof query === "string" ? query.trim() : "";

  if (search) {
    const expression = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ locationText: expression }, { description: expression }];
  }

  if (filters.price?.min !== undefined || filters.price?.max !== undefined) {
    filter.displayPrice = {};
    if (filters.price.min !== undefined) filter.displayPrice.$gte = Number(filters.price.min);
    if (filters.price.max !== undefined) filter.displayPrice.$lte = Number(filters.price.max);
  }

  if (filters.categories?.length) {
    filter.condition = { $in: filters.categories };
  }

  return filter;
}

async function searchCatalog(req, res, next) {
  try {
    const { query, filters, pagination } = req.body || {};
    const limit = Math.min(Math.max(Number(pagination?.limit) || 10, 1), 50);
    const listings = await Listing.find(buildFilter(query, filters))
      .populate("makeId", "name")
      .populate("modelId", "name")
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasNextPage = listings.length > limit;
    const products = listings.slice(0, limit).map(toProduct);

    res.json({
      ucp: ucpMetadata("dev.ucp.shopping.catalog.search"),
      products,
      ...(hasNextPage ? { pagination: { next_page_token: products.at(-1).id } } : {}),
    });
  } catch (error) {
    next(error);
  }
}

async function lookupCatalog(req, res, next) {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0 || ids.length > 50) {
      return res.status(400).json({
        code: "request_too_large",
        content: "ids must contain between 1 and 50 listing IDs",
      });
    }

    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
    const listings = await Listing.find({
      _id: { $in: validIds },
      status: "approved",
      deletedAt: null,
    })
      .populate("makeId", "name")
      .populate("modelId", "name")
      .lean();

    const products = listings.map(toProduct);
    const foundIds = new Set(products.map((product) => product.id));
    const messages = ids
      .filter((id) => !foundIds.has(id))
      .map((id) => ({ type: "info", code: "not_found", content: id }));

    res.json({
      ucp: ucpMetadata("dev.ucp.shopping.catalog.lookup"),
      products,
      ...(messages.length ? { messages } : {}),
    });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.json({
        ucp: { ...ucpMetadata("dev.ucp.shopping.catalog.lookup"), status: "error" },
        messages: [{ type: "error", code: "not_found", content: `Product not found: ${id}` }],
      });
    }

    const listing = await Listing.findOne({ _id: id, status: "approved", deletedAt: null })
      .populate("makeId", "name")
      .populate("modelId", "name")
      .lean();

    if (!listing) {
      return res.json({
        ucp: { ...ucpMetadata("dev.ucp.shopping.catalog.lookup"), status: "error" },
        messages: [{ type: "error", code: "not_found", content: `Product not found: ${id}` }],
      });
    }

    return res.json({
      ucp: ucpMetadata("dev.ucp.shopping.catalog.lookup"),
      product: toProduct(listing),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { searchCatalog, lookupCatalog, getProduct };