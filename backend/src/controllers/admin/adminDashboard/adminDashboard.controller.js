const ApiResponse = require("../../../utils/ApiResponse");
const User = require("../../../models/user/user.model");
const Listing = require("../../../models/listing/listing.model");
const Transaction = require("../../../models/transaction/transaction.model");
const Withdrawal = require("../../../models/withdrawal/withdrawal.model");

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalVendors,
      totalListings,
      pendingListings,
      approvedListings,
      soldListings,
      totalTransactions,
      releasedTransactions,
      pendingWithdrawals,
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ role: "buyer", deletedAt: null }),
      User.countDocuments({ role: "vendor", deletedAt: null }),
      Listing.countDocuments({ deletedAt: null }),
      Listing.countDocuments({ status: "pending", deletedAt: null }),
      Listing.countDocuments({ status: "approved", deletedAt: null }),
      Listing.countDocuments({ status: "sold", deletedAt: null }),
      Transaction.countDocuments({ deletedAt: null }),
      Transaction.countDocuments({ status: "released", deletedAt: null }),
      Withdrawal.countDocuments({ status: "pending", deletedAt: null }),
    ]);

    const revenueAgg = await Transaction.aggregate([
      { $match: { status: "released", deletedAt: null } },
      { $group: { _id: null, totalRevenue: { $sum: "$commission" } } },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users: { total: totalUsers, buyers: totalBuyers, vendors: totalVendors },
          listings: {
            total: totalListings,
            pending: pendingListings,
            approved: approvedListings,
            sold: soldListings,
          },
          transactions: {
            total: totalTransactions,
            released: releasedTransactions,
          },
          revenue: {
            totalCommissionCents: totalRevenue,
            totalCommissionFormatted: `$${(totalRevenue / 100).toFixed(2)}`,
          },
          pendingWithdrawals,
        },
        "Dashboard stats fetched"
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };