require("dotenv").config();
const cloudinary = require("./src/config/cloudinary");
const fs         = require("fs");
const path       = require("path");

async function test() {
  try {
    console.log("Testing Cloudinary connection...");

    // Upload a tiny test image (1x1 red pixel PNG, base64 encoded)
    // WHY: tests the full upload pipeline without needing a real file
    const result = await cloudinary.uploader.upload(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
      {
        folder:    "c2c/test",
        public_id: "sanity-test-pixel",
      }
    );

    console.log("✅ Upload successful!");
    console.log("   URL:", result.secure_url);
    console.log("   Public ID:", result.public_id);

    // Now delete it
    await cloudinary.uploader.destroy(result.public_id);
    console.log("✅ Delete successful!");
    console.log("\n👉 Cloudinary is working. You can delete this test file.");

  } catch (err) {
    console.error("❌ Cloudinary test failed:", err.message);
    console.error("\n--- Troubleshooting ---");
    console.error("1. Check CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET in .env");
    console.error("2. Make sure .env is in /backend folder");
    console.error("3. Run: npm install cloudinary");
  }
}

test();