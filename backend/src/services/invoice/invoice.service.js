const Invoice = require("../../models/invoice/invoice.model");
const userService = require("../user/user.service");
const listingService = require("../listing/listing.service");
const { uploadBufferToCloudinary } = require("../upload/upload.service");
const { generateInvoicePDF } = require("../../utils/invoiceGenerator");
const ApiError = require("../../utils/ApiError");

async function createInvoice(data) {
  return Invoice.create(data);
}

async function findInvoiceByTransactionId(transactionId) {
  return Invoice.findOne({ transactionId, deletedAt: null });
}

async function countInvoices() {
  return Invoice.countDocuments({ deletedAt: null });
}

function formatUserName(user, fallback) {
  if (!user) return fallback;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return name || user.email || fallback;
}

function formatPhone(user) {
  if (!user?.mobile) return "—";
  return `${user.countryCode || ""} ${user.mobile}`.trim();
}

function formatListingTitle(listing) {
  const make = listing.makeId?.name || "";
  const model = listing.modelId?.name || "";
  const vehicleName = [make, model].filter(Boolean).join(" ");
  if (listing.year && vehicleName) return `${listing.year} ${vehicleName}`;
  if (vehicleName) return vehicleName;
  if (listing.year) return `${listing.year} Vehicle`;
  return "Vehicle";
}

async function generateInvoiceForTransaction(transaction) {
  const existing = await findInvoiceByTransactionId(transaction._id);
  if (existing) return existing;

  if (transaction.status !== "released") {
    throw new ApiError(
      400,
      "Invoice is available only after delivery is confirmed and payment is released"
    );
  }

  const [buyer, vendor, listing] = await Promise.all([
    userService.findById(transaction.buyerId),
    userService.findById(transaction.vendorId),
    listingService.findListingById(transaction.listingId),

  ]);

  if (!buyer || !vendor || !listing) {
    throw new ApiError(400, "Cannot generate invoice: transaction data is incomplete");
  }

  const invoiceCount = await countInvoices();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(6, "0")}`;

  const pdfBuffer = await generateInvoicePDF({
    invoiceNumber,
    date: new Date().toLocaleDateString(),
    buyerName: formatUserName(buyer, "Buyer"),
    vendorName: formatUserName(vendor, "Vendor"),
    listingTitle: formatListingTitle(listing),
    askingPrice: transaction.vendorAmount,
    commission: transaction.commission,
    displayPrice: transaction.amount,
    buyerEmail: buyer.email || "—",
    buyerPhone: formatPhone(buyer),
    vendorEmail: vendor.email || "—",
    vendorPhone: formatPhone(vendor),
    vendorAddress: listing.locationText || "—",
  });

  const uploadResult = await uploadBufferToCloudinary(pdfBuffer, "invoices", "raw");

  return createInvoice({
    transactionId: transaction._id,
    buyerId: transaction.buyerId,
    vendorId: transaction.vendorId,
    listingId: transaction.listingId,
    invoiceNumber,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  });
}

function getInvoiceDownloadUrl(url) {
  if (!url) return url;
  if (url.includes("/upload/fl_attachment/")) return url;
  return url.replace("/upload/", "/upload/fl_attachment/");
}

module.exports = {
  createInvoice,
  findInvoiceByTransactionId,
  countInvoices,
  generateInvoiceForTransaction,
  getInvoiceDownloadUrl,
};
