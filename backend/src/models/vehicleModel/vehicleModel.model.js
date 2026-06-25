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

// # VehicleModel Schema

// ```jsz
// const mongoose = require("mongoose");

// const vehicleModelSchema = new mongoose.Schema(
// {
//   makeId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "VehicleMake",
//     required: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// },
// { timestamps: true }
// );

// // Unique model per make
// vehicleModelSchema.index(
//   { makeId: 1, name: 1 },
//   { unique: true }
// );

// // Fast dropdown query
// vehicleModelSchema.index(
//   { makeId: 1, isActive: 1 }
// );

// module.exports = mongoose.model("VehicleModel", vehicleModelSchema);
// ```

// ---

// # Sample Collections

// ## VehicleMake Collection

// ```json
// [
//   {
//     "_id": "6850a1111111111111111111",
//     "name": "Honda"
//   },
//   {
//     "_id": "6850a2222222222222222222",
//     "name": "Toyota"
//   }
// ]
// ```

// ## VehicleModel Collection

// ```json
// [
//   {
//     "_id": "6860b1111111111111111111",
//     "makeId": "6850a1111111111111111111",
//     "name": "Civic",
//     "isActive": true
//   },
//   {
//     "_id": "6860b2222222222222222222",
//     "makeId": "6850a1111111111111111111",
//     "name": "City",
//     "isActive": true
//   },
//   {
//     "_id": "6860b3333333333333333333",
//     "makeId": "6850a2222222222222222222",
//     "name": "Corolla",
//     "isActive": true
//   }
// ]
// ```

// ---

// # Visual Structure

// ```text
// Vehicle Makes
// │
// ├── Honda (6850a111...)
// │     ├── Civic
// │     └── City
// │
// └── Toyota (6850a222...)
//       └── Corolla
// ```

// ---

// # INDEX #1

// ```js
// vehicleModelSchema.index(
//   { makeId: 1, name: 1 },
//   { unique: true }
// );
// ```

// Purpose:
// - Prevent duplicate model names inside the same make.
// - Used during CREATE and UPDATE operations.

// MongoDB internally creates something like:

// ```text
// (Honda,Civic)    -> Doc1
// (Honda,City)     -> Doc2
// (Toyota,Corolla) -> Doc3
// ```

// ---

// ## API Using Index #1

// ### Create Model

// ```http
// POST /api/admin/vehicle-model
// ```

// Request:

// ```json
// {
//   "makeId": "6850a1111111111111111111",
//   "name": "Civic"
// }
// ```

// Controller:

// ```js
// await VehicleModel.create({
//   makeId,
//   name
// });
// ```

// MongoDB checks:

// ```text
// (Honda,Civic)
// ```

// If exists:

// ```text
// ❌ Duplicate Key Error
// ```

// If not exists:

// ```text
// ✅ Insert Record
// ```

// Examples:

// ```json
// {
//   "makeId": "Honda",
//   "name": "Civic"
// }
// ```

// Already exists:

// ```text
// ❌ Not Allowed
// ```

// ---

// ```json
// {
//   "makeId": "Toyota",
//   "name": "Civic"
// }
// ```

// Does not exist:

// ```text
// ✅ Allowed
// ```

// Because uniqueness is checked on:

// ```text
// makeId + name
// ```

// NOT on:

// ```text
// name only
// ```

// Visual:

// ```text
// Honda
//  ├── Civic
//  └── City

// Toyota
//  ├── Civic  ✅ Allowed
//  └── Corolla
// ```

// ---

// # INDEX #2

// ```js
// vehicleModelSchema.index({
//   makeId: 1,
//   isActive: 1
// });
// ```

// Purpose:
// - Speed up dropdown/search/filter queries.
// - Used during FIND operations.

// MongoDB internally creates something like:

// ```text
// (Honda,true)
//     -> Civic
//     -> City

// (Honda,false)
//     -> Amaze

// (Toyota,true)
//     -> Corolla
// ```

// ---

// ## API Using Index #2

// ### Get Models Dropdown

// ```http
// GET /api/models?makeId=6850a1111111111111111111
// ```

// Controller:

// ```js
// const models = await VehicleModel.find({
//   makeId: req.query.makeId,
//   isActive: true
// });
// ```

// Mongo Query:

// ```js
// VehicleModel.find({
//   makeId: "HondaId",
//   isActive: true
// });
// ```

// MongoDB directly jumps to:

// ```text
// (Honda,true)
// ```

// Returns:

// ```json
// [
//   {
//     "name": "Civic"
//   },
//   {
//     "name": "City"
//   }
// ]
// ```

// Without scanning Toyota records.

// ---

// # Real Project Flow

// ```text
// Admin Creates Makes
// │
// ├── Honda
// ├── Toyota
// └── BMW

//           ↓

// Admin Creates Models
// │
// ├── Honda
// │     ├── Civic
// │     ├── City
// │     └── Amaze
// │
// ├── Toyota
// │     ├── Corolla
// │     └── Camry
// │
// └── BMW
//       └── X5

//           ↓

// User Selects Honda

//           ↓

// Frontend Calls

// GET /api/models?makeId=HondaId

//           ↓

// Backend Executes

// VehicleModel.find({
//   makeId: HondaId,
//   isActive: true
// })

//           ↓

// Mongo Uses Index

// {
//   makeId:1,
//   isActive:1
// }

//           ↓

// Response

// [
//   {
//     "name":"Civic"
//   },
//   {
//     "name":"City"
//   }
// ]
// ```

// ---

// # Quick Revision

// ```text
// INDEX #1

// { makeId:1, name:1 }

// Used In:
// ✅ Create
// ✅ Update

// Purpose:
// Prevent Duplicate Models Per Make

// Example:

// Honda + Civic  ❌ Duplicate
// Toyota + Civic ✅ Allowed
// ```

// ```text
// INDEX #2

// { makeId:1, isActive:1 }

// Used In:
// ✅ Find
// ✅ Dropdown
// ✅ Filter

// Purpose:
// Fast Model Lookup

// Example:

// VehicleModel.find({
//   makeId: HondaId,
//   isActive: true
// })
// ```

// ---

// # Interview Answer (1 Minute)

// This schema stores vehicle models linked to vehicle makes using makeId. The first compound unique index `{makeId:1, name:1}` ensures the same model cannot be created twice under the same make, but allows the same model name under different makes. The second compound index `{makeId:1, isActive:1}` optimizes dropdown and filter queries where models are fetched by make and active status. These indexes improve query performance and enforce data integrity.