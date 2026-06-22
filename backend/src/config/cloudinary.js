const cloudinary = require("cloudinary").v2;

// WHY .v2: Cloudinary has v1 (callback-based, old) and v2 (promise-based,
// modern). Always use v2 — it works with async/await cleanly.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;