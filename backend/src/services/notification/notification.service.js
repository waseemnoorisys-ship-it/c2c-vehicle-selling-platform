const Notification = require("../../models/notification/notification.model");

async function create(data) {
  return Notification.create(data);
}

async function insertMany(notifications) {
  return Notification.insertMany(notifications);
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