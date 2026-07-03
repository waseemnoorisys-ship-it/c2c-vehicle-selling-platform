const CmsPage = require("../../models/cmsPage/cmsPage.model");

async function createPage(data) {
  return CmsPage.create(data);
}

async function findPageBySlug(slug) {
  return CmsPage.findOne({ slug, deletedAt: null });
}

async function findPageById(id) {
  return CmsPage.findOne({ _id: id, deletedAt: null });
}

async function findAllPages(filter, skip, limit) {
  return CmsPage.find(filter)
    .select("title slug isActive createdAt updatedAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

async function countPages(filter) {
  return CmsPage.countDocuments(filter);
}

async function updatePageById(id, update) {
  return CmsPage.findByIdAndUpdate(id, update, { new: true });
}

module.exports = {
  createPage,
  findPageBySlug,
  findPageById,
  findAllPages,
  countPages,
  updatePageById,
};