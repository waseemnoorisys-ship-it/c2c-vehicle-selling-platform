const mongoose = require("mongoose");
const Transaction = require("../../models/transaction/transaction.model");
const { UCP_VERSION } = require("../../ucp/ucp.profile");

function toOrderMetadata() {
  return {
    version: UCP_VERSION,
    capabilities: {
      "dev.ucp.shopping.order": [{ version: UCP_VERSION }],
    },
  };
}

function toOrder(transaction) {
  const listing = transaction.listingId;
  const make = listing?.makeId?.name || "";
  const model = listing?.modelId?.name || "";
  const title = `${listing?.year || ""} ${make} ${model}`.trim() || "Vehicle purchase";
  const orderId = `order_${transaction._id}`;
  const baseUrl = (process.env.APP_URL || "http://localhost:5000").replace(/\/$/, "");

  return {
    ucp: toOrderMetadata(),
    id: orderId,
    label: `#${transaction._id.toString().slice(-8)}`,
    checkout_id: `ucp_chk_${transaction.offerId}`,
    permalink_url: `${baseUrl}/buyer/offers`,
    currency: transaction.currency || "EUR",
    line_items: [
      {
        id: "line_1",
        item: {
          id: listing?._id?.toString(),
          title,
          price: transaction.amount,
        },
        quantity: 1,
      },
    ],
    fulfillment: {
      methods: [{
        type: "pickup",
        status: transaction.status === "released" ? "completed" : "pending",
        line_item_ids: ["line_1"],
      }],
    },
    totals: [{ type: "total", display_text: "Total", amount: transaction.amount }],
    payment_status: transaction.status,
  };
}

async function getOrder(req, res, next) {
  try {
    const rawId = String(req.params.id || "").replace(/^order_/, "");
    if (!mongoose.isValidObjectId(rawId)) {
      return res.status(404).json({ code: "not_found", content: "Order not found" });
    }

    const transaction = await Transaction.findOne({
      _id: rawId,
      buyerId: req.user._id,
      deletedAt: null,
    })
      .populate({
        path: "listingId",
        populate: [
          { path: "makeId", select: "name" },
          { path: "modelId", select: "name" },
        ],
      })
      .lean();

    if (!transaction) return res.status(404).json({ code: "not_found", content: "Order not found" });
    return res.json(toOrder(transaction));
  } catch (error) {
    next(error);
  }
}

module.exports = { getOrder };