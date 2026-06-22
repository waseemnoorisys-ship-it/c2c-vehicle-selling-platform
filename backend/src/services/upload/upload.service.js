const cloudinary = require("../../config/cloudinary");
const logger     = require("../../config/logger");

// WHY upload via stream (buffer → Cloudinary) instead of file path:
// We're using memoryStorage in Multer — there IS no file path.
// The file only exists as a Buffer in memory (req.file.buffer).
// Cloudinary's upload_stream lets us pipe that buffer directly to
// their servers without ever writing to disk.
function uploadFileToCloudinary(fileBuffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,                // e.g. "c2c/profiles" or "c2c/listings/listingId"
      resource_type: "image",
      ...options,
    };

    // upload_stream returns a writable stream.
    // We pipe our buffer into it. When done → resolve with Cloudinary's result.
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error(`Cloudinary upload failed: ${error.message}`);
        return reject(new Error(`Upload failed: ${error.message}`));
      }
      logger.info(`Uploaded to Cloudinary: ${result.public_id}`);
      resolve(result);
    });

    // WHY end() not pipe(): stream.end(buffer) writes the entire buffer
    // to the stream at once, which is correct for in-memory file buffers.
    stream.end(fileBuffer);
  });
}

// WHY we need delete: same reason as S3 version — orphaned files cost
// storage quota. Cloudinary free tier has limits, so clean up matters.
async function deleteFileFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted from Cloudinary: ${publicId}`);
  } catch (err) {
    // Same philosophy as S3 version: log, don't throw.
    logger.error(`Cloudinary delete failed for ${publicId}: ${err.message}`);
  }
}

// ── Profile photo upload ─────────────────────────────────────────
async function uploadProfilePhoto(fileBuffer, originalName) {
  const result = await uploadFileToCloudinary(fileBuffer, "c2c/profiles", {
    // WHY transformation here: auto-crop to a square and resize to 400x400.
    // Profile photos are always shown as circles/squares, so we normalize
    // them at upload time rather than doing it in every frontend component.
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    // WHY use_filename: uses original filename as part of the public_id
    // (still appended with a unique suffix by Cloudinary to avoid collisions).
    use_filename: true,
    unique_filename: true,
  });

  return {
    url:      result.secure_url, // HTTPS URL to display the image
    publicId: result.public_id,  // Cloudinary's ID — needed to delete later
  };
}

// ── Listing photo upload ─────────────────────────────────────────
async function uploadListingPhoto(fileBuffer, listingId) {
  const result = await uploadFileToCloudinary(
    fileBuffer,
    `c2c/listings/${listingId}`, // each listing gets its own subfolder
    {
      // WHY limit size: vehicle photos displayed at ~800px wide max.
      // No need to store a 4K phone photo — wastes bandwidth & quota.
      transformation: [{ width: 1200, height: 900, crop: "limit" }],
      use_filename: true,
      unique_filename: true,
    }
  );

  return {
    url:      result.secure_url,
    publicId: result.public_id,
  };
}

// Upload multiple listing photos (in parallel — same Promise.all as S3 version)
async function uploadListingPhotos(files, listingId) {
  const uploadPromises = files.map((file) =>
    uploadListingPhoto(file.buffer, listingId)
  );
  return Promise.all(uploadPromises);
}

module.exports = {
  uploadProfilePhoto,
  uploadListingPhotos,
  deleteFileFromCloudinary,
};