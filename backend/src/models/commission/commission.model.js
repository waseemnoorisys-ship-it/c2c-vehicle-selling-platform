const mongoose = require("mongoose");

// WHY this collection will only ever have ONE document:
// Commission is a global platform setting, not per-vendor or per-listing.
// We enforce "singleton" behavior in the service layer (findOneAndUpdate
// with upsert), not at the schema level.
const commissionSchema = new mongoose.Schema(
  {
    percentage: { type: Number, required: true, default: 5, min: 0, max: 100 },
    updatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommissionConfig", commissionSchema);

// # CommissionConfig Schema

// ```js
// const mongoose = require("mongoose");

// // Global Platform Commission Setting
// const commissionSchema = new mongoose.Schema(
// {
//   percentage: {
//     type: Number,
//     required: true,
//     default: 5,
//     min: 0,
//     max: 100
//   },

//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "AdminUser"
//   }
// },
// { timestamps: true }
// );

// module.exports = mongoose.model(
//   "CommissionConfig",
//   commissionSchema
// );
// ```

// ---

// # Purpose

// This collection stores the platform commission percentage.

// Example:

// ```text
// Vehicle Sold = ₹100,000

// Platform Commission = 5%

// Commission Amount = ₹5,000

// Vendor Receives = ₹95,000
// ```

// Instead of storing commission everywhere, we keep it in one central place.

// ---

// # Why Only One Document?

// Commission is a global setting.

// Wrong:

// ```text
// Commission 1 = 5%
// Commission 2 = 8%
// Commission 3 = 12%
// ```

// Now system won't know which commission to use.

// Correct:

// ```text
// Commission = 5%
// ```

// Only one record exists.

// ---

// # Sample Collection

// ```json
// [
//   {
//     "_id": "6860c1111111111111111111",
//     "percentage": 5,
//     "updatedBy": "6850a9999999999999999999",
//     "createdAt": "2026-06-20T10:00:00Z",
//     "updatedAt": "2026-06-20T10:00:00Z"
//   }
// ]
// ```

// ---

// # Visual Representation

// ```text
// CommissionConfig Collection
// │
// └── Document #1
//       │
//       ├── percentage : 5%
//       ├── updatedBy  : Admin
//       ├── createdAt
//       └── updatedAt
// ```

// ---

// # Field Explanation

// ## percentage

// ```js
// percentage: {
//   type: Number,
//   required: true,
//   default: 5,
//   min: 0,
//   max: 100
// }
// ```

// Stores platform commission.

// Examples:

// ```json
// {
//   "percentage": 5
// }
// ```

// Means:

// ```text
// Platform takes 5%
// Vendor gets 95%
// ```

// ---

// Validation:

// ```json
// {
//   "percentage": -5
// }
// ```

// Result:

// ```text
// ❌ Error
// Must be >= 0
// ```

// ---

// ```json
// {
//   "percentage": 150
// }
// ```

// Result:

// ```text
// ❌ Error
// Must be <= 100
// ```

// ---

// ```json
// {
//   "percentage": 10
// }
// ```

// Result:

// ```text
// ✅ Valid
// ```

// ---

// ## updatedBy

// ```js
// updatedBy: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "AdminUser"
// }
// ```

// Stores which admin changed the commission.

// Example:

// ```json
// {
//   "percentage": 8,
//   "updatedBy": "6850a9999999999999999999"
// }
// ```

// Meaning:

// ```text
// Admin User #6850a999...
// updated commission to 8%
// ```

// ---

// # Timestamps

// ```js
// {
//   timestamps:true
// }
// ```

// Automatically creates:

// ```json
// {
//   "createdAt": "2026-06-20",
//   "updatedAt": "2026-06-20"
// }
// ```

// Useful for audit history.

// ---

// # API #1 Get Current Commission

// ```http
// GET /api/admin/commission
// ```

// Controller:

// ```js
// const commission =
// await CommissionConfig.findOne();
// ```

// Mongo Query:

// ```js
// CommissionConfig.findOne();
// ```

// Response:

// ```json
// {
//   "percentage": 5
// }
// ```

// ---

// # API #2 Update Commission

// ```http
// PUT /api/admin/commission
// ```

// Request:

// ```json
// {
//   "percentage": 8
// }
// ```

// Controller:

// ```js
// await CommissionConfig.findOneAndUpdate(
//   {},
//   {
//     percentage: 8,
//     updatedBy: adminId
//   },
//   {
//     new: true,
//     upsert: true
//   }
// );
// ```

// ---

// # Why Use findOneAndUpdate + Upsert?

// Because only one document should exist.

// Mongo executes:

// ```js
// findOneAndUpdate(
//  {},
//  updateData,
//  {
//    upsert:true
//  }
// )
// ```

// Logic:

// ```text
// Record Exists?
// │
// ├── YES
// │     └── Update Existing Record
// │
// └── NO
//       └── Create New Record
// ```

// ---

// # Visual Flow

// ```text
// CommissionConfig Collection

// Empty Collection
//       │
//       ▼

// Admin Sets Commission = 5%

//       │
//       ▼

// Document Created

// {
//   percentage: 5
// }

//       │
//       ▼

// Admin Changes To 8%

//       │
//       ▼

// Same Document Updated

// {
//   percentage: 8
// }

// No New Document Created
// ```

// ---

// # Why No Indexes?

// This collection contains only one document.

// Example:

// ```json
// [
//   {
//     "percentage": 5
//   }
// ]
// ```

// MongoDB can find it instantly.

// Indexes are useful when:

// ```text
// 1000 Records
// 10000 Records
// 100000 Records
// 1000000 Records
// ```

// But here:

// ```text
// Only 1 Record
// ```

// So indexes are unnecessary.

// ---

// # Real Vehicle Marketplace Flow

// ```text
// Admin Sets Commission = 5%

//         │
//         ▼

// Vehicle Sold

// Price = ₹100,000

//         │
//         ▼

// Backend Reads Commission

// CommissionConfig.findOne()

//         │
//         ▼

// Commission = 5%

//         │
//         ▼

// Calculation

// ₹100,000 × 5%

//         │
//         ▼

// Platform = ₹5,000

// Vendor = ₹95,000
// ```

// ---

// # Quick Revision

// ```text
// Collection:
// CommissionConfig

// Purpose:
// Store Global Platform Commission

// Documents:
// Only One

// percentage:
// Commission %

// updatedBy:
// Admin Who Updated It

// Indexes:
// None Required

// Read API:
// CommissionConfig.findOne()

// Update API:
// CommissionConfig.findOneAndUpdate()

// upsert:true:
// Create If Missing
// Update If Exists
// ```

// ---

// # Interview Answer (1 Minute)

// This schema stores the platform-wide commission percentage used during vehicle sales. It acts as a singleton configuration collection, meaning only one document should exist. The `percentage` field stores the commission rate between 0 and 100, while `updatedBy` references the admin who last modified it. Since the collection contains only one document, indexes are unnecessary. The application enforces singleton behavior using `findOneAndUpdate()` with `upsert:true`, which updates the existing document or creates it if it doesn't exist.