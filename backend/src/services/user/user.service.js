const User           = require("../../models/user/user.model");
const ApiError        = require("../../utils/ApiError");
const { uploadFileToS3, deleteFileFromS3 } = require("../upload/upload.service");

// WHY this function exists separately from the controller:
// keeps the "which fields are allowed to update" logic testable
// and reusable, away from HTTP-specific code.
//user id ki bunyaad par update karna hai 
//updates ka matlab humko kya kya update karwana hai kon kon si field yeh saari cheezien iss updates me parse hogi
async function updateProfile(userId, updates) {
  // Whitelist enforced again here as a second layer of defense —
  // even though Joi validation already stripped unknown fields,
  // we never blindly trust upstream layers in critical paths.
  const allowedFields = ["firstName", "lastName", "mobile", "countryCode", "language"];
  const safeUpdates = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }

  const user = await User.findByIdAndUpdate(userId, safeUpdates, {
    new: true,           // return the UPDATED document, not the old one
    runValidators: true, // re-run schema validation (e.g. enum checks) on update
  }).select("-passwordHash");

  if (!user) throw new ApiError(404, "User not found");
  return user;
}

async function updateProfilePhoto(userId, file) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // WHY delete old photo first: avoid accumulating orphaned files in S3
  // every time a user changes their profile picture (storage cost + clutter).
  if (user.profilePhoto) {
    await deleteFileFromS3(user.profilePhoto);
  }

  const url = await uploadFileToS3(file.buffer, file.originalname, file.mimetype, "profiles");

  user.profilePhoto = url;
  await user.save();

  return { profilePhoto: url };
}

module.exports = { updateProfile, updateProfilePhoto };