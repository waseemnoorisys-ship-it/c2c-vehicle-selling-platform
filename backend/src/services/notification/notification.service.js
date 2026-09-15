const Notification = require("../../models/notification/notification.model");
const { getIO } = require("../../socket/socket");

function emitRealtimeNotification(doc) {
  try {
    const io = getIO();
    if (io && doc && doc.userId) {
      const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
      io.to(doc.userId.toString()).emit("new_notification", plain);
    }
  } catch (err) {
    // Non-blocking socket notification error
  }
}

async function create(data) {
  const notification = await Notification.create(data);
  emitRealtimeNotification(notification);
  return notification;
}

async function insertMany(notifications) {
  const docs = await Notification.insertMany(notifications);
  (docs || []).forEach(emitRealtimeNotification);
  return docs;
}

async function findOne(filter) {
  return Notification.findOne(filter);
}

async function find(filter, skip, limit) {
  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

async function count(filter) {
  return Notification.countDocuments(filter);
}

async function findOneAndUpdate(filter, update) {
  return Notification.findOneAndUpdate(filter, update, { new: true });
}

async function updateMany(filter, update) {
  return Notification.updateMany(filter, update);
}

module.exports = {
  create,
  insertMany,
  findOne,
  find,
  count,
  findOneAndUpdate,
  updateMany,
};