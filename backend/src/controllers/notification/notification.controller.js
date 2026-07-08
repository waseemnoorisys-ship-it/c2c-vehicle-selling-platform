const notificationService = require("../../services/notification/notification.service");
const ApiResponse         = require("../../utils/ApiResponse");
const ApiError            = require("../../utils/ApiError");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");

// POST /api/v1/notifications/mine
// Auth: any authenticated user
const getMyNotifications = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const userId = req.user._id;
    const {
      page   = 1,
      limit  = 20,
      unread,
    } = req.body;

    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const filter = { userId, deletedAt: null };
    if (unread === true) filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      notificationService.find(filter, skip, parseInt(limit)),
      notificationService.count(filter),
      notificationService.count({ userId, isRead: false, deletedAt: null }),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        notifications,
        unreadCount,
        pagination: {
          total,
          page:       parseInt(page),
          limit:      parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      }, t("success.notification.retrieved", lang))
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/notifications/read
// Auth: any authenticated user
const markAsRead = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { id } = req.body;
    const userId = req.user._id;

    // WHY userId in filter: prevents user from marking
    // another user's notification as read
    const notification = await notificationService.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { isRead: true }
    );

    if (!notification) {
      throw new ApiError(404, t("errors.notification.notFound", lang));
    }

    res
      .status(200)
      .json(new ApiResponse(200, notification, t("success.notification.markedRead", lang)));
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/notifications/read-all
// Auth: any authenticated user
const markAllAsRead = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const userId = req.user._id;

    await notificationService.updateMany(
      { userId, isRead: false, deletedAt: null },
      { isRead: true }
    );

    const unreadCount = await notificationService.count({
      userId,
      isRead:    false,
      deletedAt: null,
    });

    res
      .status(200)
      .json(new ApiResponse(200, { unreadCount }, t("success.notification.allMarkedRead", lang)));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
