const mongoose = require("mongoose");
const vehicleMake = require("../vehicleMake/vehicleMake.model");

const listingSchema = new mongoose.Schema(
  {
    // ── Ownership ──────────────────────────────────────
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Vehicle identity (referenced, not duplicated — see Project Bible) ──
    makeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vehicleMake",
      required: true,
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleModel",
      required: true,
    },

    // ── Vehicle details ──────────────────────────────────
    year: {
      type: Number,
      required: true,
      min: 1950,
      max: new Date().getFullYear() + 1,
    },
    registrationNumber: { type: String, trim: true },
    mileage: { type: Number, required: true, min: 0 }, // in km
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "gas", "electric", "hybrid", "hydrogen"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["manual", "automatic", "semi-automatic"],
      required: true,
    },
    condition: { type: String, enum: ["new", "used"], default: "used" },

    // ── Pricing (cents-based to avoid floating point errors) ──────
    askingPrice: { type: Number, required: true, min: 0 }, // vendor's price, in cents
    commissionPercent: { type: Number, required: true }, // SNAPSHOT at creation time
    displayPrice: { type: Number, required: true }, // askingPrice + commission amount

    // ── Location (GeoJSON — needed for Sprint 3's "near me" search) ──
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    locationText: { type: String, trim: true }, // human-readable, e.g. "Pune, Maharashtra"

    // ── Status pipeline ──────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "sold", "inactive"],
      default: "draft",
    },
    isVerified: { type: Boolean, default: false }, // admin-assigned "verified" badge
    rejectionReason: { type: String, default: null },

    // ── Photos ──────────────────────────────────old old old ──────────
    // photos: [{ type: String }], // array of S3 URLs, max 10 enforced in service layer
    // coverPhoto: { type: String, default: null },
    // NEW:
    photos: [
      {
        url: { type: String, required: true }, // display URL
        publicId: { type: String, required: true }, // Cloudinary ID for deletion
      },
    ],
    coverPhoto: { type: String, default: null }, // just the URL string for quick access

    // ── Soft delete (GDPR / record-keeping — see Sprint 1 pattern) ──
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// WHY these indexes:
// vendorId — every "My Listings" query filters by this
// status — admin queues and public browse both filter by status
// location (2dsphere) — required for MongoDB's geo-proximity queries (Sprint 3)
// GET /api/vendor/my-listings
listingSchema.index({ vendorId: 1, deletedAt: 1 });
// GET /api/admin/listings?status=pending
listingSchema.index({ status: 1, deletedAt: 1 });
// GET /api/listings/near-me
// Query

// ```js
// Listing.find({
//  location:{
//    $near:{
//      $geometry:{
//        type:"Point",
//        coordinates:[73.8567,18.5204]
//      },
//      $maxDistance:10000
// Find Vehicles Within 10 KM
//    }
//  }
// });
// ```
listingSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Listing", listingSchema);

// # Listing Schema

// ```js
// const mongoose = require("mongoose");

// const listingSchema = new mongoose.Schema(
// {
//   vendorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },

//   makeId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "VehicleMake",
//     required: true
//   },

//   modelId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "VehicleModel",
//     required: true
//   },

//   year: {
//     type: Number,
//     required: true,
//     min: 1950,
//     max: new Date().getFullYear() + 1
//   },

//   registrationNumber: {
//     type: String,
//     trim: true
//   },

//   mileage: {
//     type: Number,
//     required: true,
//     min: 0
//   },

//   fuelType: {
//     type: String,
//     enum: [
//       "petrol",
//       "diesel",
//       "gas",
//       "electric",
//       "hybrid",
//       "hydrogen"
//     ],
//     required: true
//   },

//   transmission: {
//     type: String,
//     enum: [
//       "manual",
//       "automatic",
//       "semi-automatic"
//     ],
//     required: true
//   },

//   condition: {
//     type: String,
//     enum: ["new", "used"],
//     default: "used"
//   },

//   askingPrice: {
//     type: Number,
//     required: true
//   },

//   commissionPercent: {
//     type: Number,
//     required: true
//   },

//   displayPrice: {
//     type: Number,
//     required: true
//   },

//   location: {
//     type: {
//       type: String,
//       enum: ["Point"],
//       default: "Point"
//     },
//     coordinates: {
//       type: [Number],
//       default: [0,0]
//     }
//   },

//   locationText: {
//     type: String,
//     trim: true
//   },

//   status: {
//     type: String,
//     enum: [
//       "draft",
//       "pending",
//       "approved",
//       "rejected",
//       "sold",
//       "inactive"
//     ],
//     default: "draft"
//   },

//   isVerified: {
//     type: Boolean,
//     default: false
//   },

//   rejectionReason: {
//     type: String,
//     default: null
//   },

//   photos: [{
//     type: String
//   }],

//   coverPhoto: {
//     type: String,
//     default: null
//   },

//   deletedAt: {
//     type: Date,
//     default: null
//   }

// },
// {
//   timestamps: true
// }
// );

// listingSchema.index({
//   vendorId: 1,
//   deletedAt: 1
// });

// listingSchema.index({
//   status: 1,
//   deletedAt: 1
// });

// listingSchema.index({
//   location: "2dsphere"
// });

// module.exports = mongoose.model(
//   "Listing",
//   listingSchema
// );
// ```

// ---

// # Purpose

// This collection stores vehicle advertisements/listings posted by vendors.

// Example:

// ```text
// Vendor Posts Vehicle

// Honda Civic
// 2023 Model
// 50,000 KM
// ₹10,00,000

// ↓

// Creates One Listing Document
// ```

// ---

// # Collection Relationships

// ```text
// User
//  │
//  └── vendorId
//        │
//        ▼

// Listing
//  │
//  ├── makeId
//  └── modelId

//        │
//        ▼

// VehicleMake
// VehicleModel
// ```

// ---

// # Sample Document

// ```json
// {
//   "_id": "listing123",

//   "vendorId": "vendor001",

//   "makeId": "honda001",
//   "modelId": "civic001",

//   "year": 2023,
//   "registrationNumber": "MH12AB1234",
//   "mileage": 50000,

//   "fuelType": "petrol",
//   "transmission": "manual",
//   "condition": "used",

//   "askingPrice": 1000000,

//   "commissionPercent": 5,

//   "displayPrice": 1050000,

//   "location": {
//     "type": "Point",
//     "coordinates": [73.8567,18.5204]
//   },

//   "locationText": "Pune, Maharashtra",

//   "status": "approved",

//   "isVerified": true,

//   "photos": [
//     "https://s3/photo1.jpg",
//     "https://s3/photo2.jpg"
//   ],

//   "coverPhoto": "https://s3/photo1.jpg",

//   "deletedAt": null
// }
// ```

// ---

// # Visual Structure

// ```text
// Vendor
//  │
//  ▼

// Honda Civic Listing

//  ├── Year = 2023
//  ├── Mileage = 50,000 KM
//  ├── Fuel = Petrol
//  ├── Transmission = Manual
//  ├── Condition = Used
//  ├── Asking Price = ₹10,00,000
//  ├── Commission = 5%
//  ├── Display Price = ₹10,50,000
//  ├── Location = Pune
//  ├── Status = Approved
//  └── Photos
// ```

// ---

// # Ownership Section

// ## vendorId

// ```js
// vendorId:{
//  type:ObjectId,
//  ref:"User"
// }
// ```

// Stores owner of listing.

// Example:

// ```text
// User
//  └── Shoaib

//         │

//         ▼

// Honda Civic Listing
// ```

// ---

// # Vehicle Reference Section

// ## makeId

// ```js
// makeId
// ```

// Reference to:

// ```text
// Honda
// Toyota
// BMW
// ```

// ---

// ## modelId

// ```js
// modelId
// ```

// Reference to:

// ```text
// Civic
// City
// Corolla
// Camry
// ```

// ---

// Visual

// ```text
// Honda
//  │
//  └── Civic

// Listing
//  │
//  ├── makeId  → Honda
//  └── modelId → Civic
// ```

// ---

// # Vehicle Details

// ## year

// ```js
// year:2023
// ```

// Valid:

// ```text
// 1950 → Next Year
// ```

// ---

// ## registrationNumber

// ```js
// MH12AB1234
// ```

// Vehicle registration number.

// ---

// ## mileage

// ```js
// 50000
// ```

// Means:

// ```text
// 50,000 KM Driven
// ```

// ---

// ## fuelType

// Allowed:

// ```text
// petrol
// diesel
// gas
// electric
// hybrid
// hydrogen
// ```

// ---

// ## transmission

// Allowed:

// ```text
// manual
// automatic
// semi-automatic
// ```

// ---

// ## condition

// Allowed:

// ```text
// new
// used
// ```

// Default:

// ```text
// used
// ```

// ---

// # Pricing Section

// ## askingPrice

// ```js
// askingPrice:1000000
// ```

// Vendor wants:

// ```text
// ₹10,00,000
// ```

// ---

// ## commissionPercent

// ```js
// commissionPercent:5
// ```

// Snapshot commission.

// Why Snapshot?

// Suppose:

// ```text
// Today Commission = 5%
// ```

// Listing Created.

// Later:

// ```text
// Commission Changed To 10%
// ```

// Old listing should still remember:

// ```text
// 5%
// ```

// Therefore snapshot stored.

// ---

// ## displayPrice

// ```js
// displayPrice:1050000
// ```

// Calculation:

// ```text
// Asking Price = ₹10,00,000

// Commission = 5%

// Display Price

// = 10,00,000
// + 50,000

// = ₹10,50,000
// ```

// ---

// # Location Section

// ## GeoJSON Format

// ```json
// {
//   "type":"Point",
//   "coordinates":[73.8567,18.5204]
// }
// ```

// Meaning:

// ```text
// Longitude = 73.8567
// Latitude  = 18.5204
// ```

// ---

// ## locationText

// ```js
// "Pune, Maharashtra"
// ```

// Human-readable location.

// ---

// Visual

// ```text
// Map Coordinates

// [73.8567,18.5204]

//       ↓

// Pune, Maharashtra
// ```

// ---

// # Status Pipeline

// ```text
// draft
//   ↓
// pending
//   ↓
// approved
//   ↓
// sold
// ```

// or

// ```text
// pending
//   ↓
// rejected
// ```

// ---

// ## draft

// Vendor still editing.

// ---

// ## pending

// Waiting for admin approval.

// ---

// ## approved

// Visible publicly.

// ---

// ## rejected

// Rejected by admin.

// ---

// ## sold

// Vehicle sold.

// ---

// ## inactive

// Hidden temporarily.

// ---

// # isVerified

// ```js
// isVerified:true
// ```

// Admin verified badge.

// Visual:

// ```text
// Honda Civic

// ✓ Verified Vehicle
// ```

// ---

// # rejectionReason

// ```js
// "Uploaded fake documents"
// ```

// Only used if listing rejected.

// ---

// # Photos

// ## photos

// ```json
// [
//   "photo1.jpg",
//   "photo2.jpg",
//   "photo3.jpg"
// ]
// ```

// Stores all images.

// ---

// ## coverPhoto

// ```js
// photo1.jpg
// ```

// Main image shown first.

// ---

// # Soft Delete

// ## deletedAt

// ```js
// deletedAt:null
// ```

// Active Listing.

// ---

// Soft Deleted:

// ```js
// deletedAt:"2026-06-20"
// ```

// Visual:

// ```text
// Listing Exists In DB

// But Hidden From Users
// ```

// ---

// # INDEX #1

// ```js
// listingSchema.index({
//  vendorId:1,
//  deletedAt:1
// });
// ```

// Purpose:

// Fast "My Listings" query.

// ---

// API

// ```http
// GET /api/vendor/my-listings
// ```

// Query

// ```js
// Listing.find({
//  vendorId:req.user._id,
//  deletedAt:null
// });
// ```

// Mongo Uses:

// ```js
// {
//  vendorId:1,
//  deletedAt:1
// }
// ```

// Visual

// ```text
// Vendor A
//  ├── Listing 1
//  ├── Listing 2
//  └── Listing 3
// ```

// Mongo jumps directly to Vendor A records.

// ---

// # INDEX #2

// ```js
// listingSchema.index({
//  status:1,
//  deletedAt:1
// });
// ```

// Purpose:

// Fast Admin Queue.

// ---

// API

// ```http
// GET /api/admin/listings?status=pending
// ```

// Qury
// ```js
// Listing.find({
//  status:"pending",
//  deletedAt:null
// });
// ```
// Mongo Uses:
// ```js
// {
//  status:1,
//  deletedAt:1
// }
// ```
// Visual
// ```text
// Pending Listings
//  ├── Honda Civic
//  ├── BMW X5
//  └── Toyota Camry
// ```
// ---
// # INDEX #3
// ```js
// listingSchema.index({
//  location:"2dsphere"
// });
// ```
// Purpose:
// Near Me Search.
// Required for geospatial queries.
// ---
// API
// ```http
// GET /api/listings/near-me
// ```
// Query
// ```js
// Listing.find({
//  location:{
//    $near:{
//      $geometry:{
//        type:"Point",
//        coordinates:[73.8567,18.5204]
//      },
//      $maxDistance:10000
//    }
//  }
// });
// ```
// Meaning:
// ```text
// Find Vehicles Within 10 KM
// ```
// ---
// Visual
// ```text
// User Location
//        ●
//    10 KM Radius
//  ┌───────────┐
//  │ Civic     │
//  │ BMW X5    │
//  │ Camry     │
//  └───────────┘
// ```
// Mongo uses:
// ```js
// {
//  location:"2dsphere"
// }
// ```
// Without this index:
// ```text
// Geo Search Will Not Work
// ```
// ---
// # Real Project Flow
// ```text
// Vendor Creates Listing
// Honda Civic
//         ↓
// Status = Draft
//         ↓
// Submit
//         ↓
// Status = Pending
//         ↓
// Admin Approves
//         ↓
// Status = Approved
//         ↓
// Visible To Public
//         ↓
// User Searches Nearby
//         ↓
// 2dsphere Index Used
//         ↓
// Vehicle Found
//         ↓
// Vehicle Sold
//         ↓
// Status = Sold
// ```
// ---
// # Quick Revision
// ```text
// vendorId
// Purpose:
// Owner Of Listing
// ```
// ```text
// makeId
// Purpose:
// Vehicle Brand
// ```
// ```text
// modelId
// Purpose:
// Vehicle Model
// ```
// ```text
// askingPrice
// Purpose:
// Vendor Price
// ``
// ```text
// commissionPercent
// Purpose:
// Snapshot Commission
// ```
// ```text
// displayPrice
// Purpose:
// Price Visible To Customer
// ```
// ```text
// status
// Purpose:
// Listing Workflow
// ```
// ```text
// deletedAt
// Purpose:
// Soft Delete
// ```
// ```text
// location
// Purpose:
// Near Me Search
// ```
// ---
// # Index Summary
// ```text
// Index #1
// {
//  vendorId:1,
//  deletedAt:1
// }
// Used By:
// GET /vendor/my-listings
// ```
// ```text
// Index #2
// {
//  status:1,
//  deletedAt:1
// }
// Used By:
// GET /admin/listings?status=pending
// ```
// ```text
// Index #3
// {
//  location:"2dsphere"
// }
// Used By:
// GET /listings/near-me
// ```
// ---
// # Interview Answer (1 Minute)
// The Listing collection stores vehicle advertisements created by vendors. It references User, VehicleMake, and VehicleModel collections through ObjectIds. It stores vehicle information, pricing, location, status workflow, verification state, photos, and soft delete information. Three indexes are used: `{vendorId, deletedAt}` for fast vendor listings, `{status, deletedAt}` for admin approval queues and public browsing, and a `2dsphere` index on location to support MongoDB geospatial queries such as "vehicles near me". The commission percentage is stored as a snapshot so future commission changes do not affect existing listings.
