const mongoose = require("mongoose");

const vehicleModelSchema = new mongoose.Schema(
  {
    makeId:   { type: mongoose.Schema.Types.ObjectId, ref: "VehicleMake", required: true },
    name:     { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// WHY compound index (makeId + name) instead of just name:
// "Civic" could exist only under Honda, but if some other make also has
// a model named "Civic" by coincidence, that's fine — they're different
// documents because they have different makeId. This index ensures
// uniqueness PER MAKE, not globally across all makes.
vehicleModelSchema.index({ makeId: 1, name: 1 }, { unique: true });
vehicleModelSchema.index({ makeId: 1, isActive: 1 }); // for the dropdown filter query

module.exports = mongoose.model("VehicleModel", vehicleModelSchema);