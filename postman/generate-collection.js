const fs = require("fs");
const path = require("path");

const baseUrl = "{{baseUrl}}";

const saveUserTokens = [
  "const j = pm.response.json();",
  "if (j.success && j.data?.accessToken) {",
  "  pm.collectionVariables.set('userAccessToken', j.data.accessToken);",
  "  pm.collectionVariables.set('userRefreshToken', j.data.refreshToken);",
  "  if (j.data.user?._id) pm.collectionVariables.set('userId', j.data.user._id);",
  "}",
];

const saveAdminTokens = [
  "const j = pm.response.json();",
  "if (j.success && j.data?.accessToken) {",
  "  pm.collectionVariables.set('adminAccessToken', j.data.accessToken);",
  "  pm.collectionVariables.set('adminRefreshToken', j.data.refreshToken);",
  "  if (j.data.admin?._id) pm.collectionVariables.set('adminId', j.data.admin._id);",
  "}",
];

const saveResetToken = [
  "const j = pm.response.json();",
  "if (j.success && j.data?.resetToken) pm.collectionVariables.set('resetToken', j.data.resetToken);",
];

const saveListingId = [
  "const j = pm.response.json();",
  "const id = j.data?._id || j.data?.listing?._id;",
  "if (id) pm.collectionVariables.set('listingId', id);",
];

const saveOfferId = [
  "const j = pm.response.json();",
  "const id = j.data?._id;",
  "if (id) pm.collectionVariables.set('offerId', id);",
];

const saveTransactionId = [
  "const j = pm.response.json();",
  "const id = j.data?.transactionId || j.data?.transaction?._id || j.data?._id;",
  "if (id) pm.collectionVariables.set('transactionId', id);",
];

const saveMakeId = [
  "const j = pm.response.json();",
  "const id = j.data?._id;",
  "if (id) pm.collectionVariables.set('makeId', id);",
];

const saveModelId = [
  "const j = pm.response.json();",
  "const id = j.data?._id;",
  "if (id) pm.collectionVariables.set('modelId', id);",
];

const saveWithdrawalId = [
  "const j = pm.response.json();",
  "const id = j.data?.withdrawal?._id;",
  "if (id) pm.collectionVariables.set('withdrawalId', id);",
];

const saveFirstListingFromList = [
  "const j = pm.response.json();",
  "const l = j.data?.listings?.[0];",
  "if (l?._id) pm.collectionVariables.set('listingId', l._id);",
];

const saveFirstOfferFromList = [
  "const j = pm.response.json();",
  "const o = j.data?.offers?.[0];",
  "if (o?._id) pm.collectionVariables.set('offerId', o._id);",
];

const saveFirstWithdrawalFromList = [
  "const j = pm.response.json();",
  "const w = j.data?.withdrawals?.[0];",
  "if (w?._id) pm.collectionVariables.set('withdrawalId', w._id);",
];

const saveFirstNotificationId = [
  "const j = pm.response.json();",
  "const n = j.data?.notifications?.[0];",
  "if (n?._id) pm.collectionVariables.set('notificationId', n._id);",
];

const saveCmsPageId = [
  "const j = pm.response.json();",
  "const id = j.data?._id || j.data?.page?._id;",
  "if (id) pm.collectionVariables.set('cmsPageId', id);",
];

function req(name, urlPath, body, opts = {}) {
  const item = {
    name,
    request: {
      method: "POST",
      header: [{ key: "Content-Type", value: "application/json" }],
      body: {
        mode: "raw",
        raw: JSON.stringify(body, null, 2),
        options: { raw: { language: "json" } },
      },
      url: `${baseUrl}${urlPath}`,
      description: opts.description || "",
    },
  };
  if (opts.tests?.length) {
    item.event = [{ listen: "test", script: { type: "text/javascript", exec: opts.tests } }];
  }
  if (opts.formdata) {
    item.request.body = { mode: "formdata", formdata: opts.formdata };
    item.request.header = [];
  }
  return item;
}

function folder(name, items, authVar, description) {
  const f = { name, item: items };
  if (description) f.description = description;
  if (authVar) {
    f.auth = {
      type: "bearer",
      bearer: [{ key: "token", value: `{{${authVar}}}`, type: "string" }],
    };
  }
  return f;
}

const collection = {
  info: {
    name: "C2C Vehicle Platform API",
    _postman_id: "c2c-vehicle-platform-v1",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    description:
      "All APIs are POST-only. Base: /api/v1\n\n" +
      "**Quick start**\n" +
      "1. Import `C2C-Local.postman_environment.json`\n" +
      "2. Run folders in order (00 → 12)\n" +
      "3. Login scripts auto-save tokens & IDs\n" +
      "4. Amounts are in **cents** (€45000 = 4500000)\n" +
      "5. Re-login as buyer/vendor when switching roles\n\n" +
      "**Happy path:** Register → Verify → Admin login → Create make/model → " +
      "Vendor login → Create listing → Admin approve → Buyer offer → Vendor accept → Payment",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:5000/api/v1" },
    { key: "buyerEmail", value: "buyer@test.com" },
    { key: "buyerPassword", value: "Buyer@12345" },
    { key: "vendorEmail", value: "vendor@test.com" },
    { key: "vendorPassword", value: "Vendor@12345" },
    { key: "adminEmail", value: "admin@c2c.com" },
    { key: "adminPassword", value: "Admin123!" },
    { key: "userAccessToken", value: "" },
    { key: "userRefreshToken", value: "" },
    { key: "adminAccessToken", value: "" },
    { key: "adminRefreshToken", value: "" },
    { key: "userId", value: "" },
    { key: "adminId", value: "" },
    { key: "listingId", value: "" },
    { key: "makeId", value: "" },
    { key: "modelId", value: "" },
    { key: "offerId", value: "" },
    { key: "transactionId", value: "" },
    { key: "withdrawalId", value: "" },
    { key: "notificationId", value: "" },
    { key: "cmsPageId", value: "" },
    { key: "resetToken", value: "" },
    { key: "otp", value: "123456" },
  ],
  item: [
    {
      name: "00 - Health",
      item: [
        {
          name: "Health Check",
          request: {
            method: "POST",
            header: [],
            url: "http://localhost:5000/health",
            description: "No auth. Returns server status.",
          },
        },
      ],
    },
    folder("01 - Auth (User)", [
      req("Register Buyer", "/auth/register", {
        firstName: "Ahmed",
        lastName: "Buyer",
        email: "{{buyerEmail}}",
        mobile: "612345678",
        countryCode: "+33",
        password: "{{buyerPassword}}",
        role: "buyer",
      }),
      req("Register Vendor", "/auth/register", {
        firstName: "Jean",
        lastName: "Dupont",
        email: "{{vendorEmail}}",
        mobile: "698765432",
        countryCode: "+33",
        password: "{{vendorPassword}}",
        role: "vendor",
      }),
      req("Verify Email (Buyer)", "/auth/verify-email", {
        email: "{{buyerEmail}}",
        otp: "{{otp}}",
      }, { description: "Set otp from email or MongoDB otps collection" }),
      req("Verify Email (Vendor)", "/auth/verify-email", {
        email: "{{vendorEmail}}",
        otp: "{{otp}}",
      }),
      req("Resend OTP", "/auth/resend-otp", {
        email: "{{buyerEmail}}",
        type: "email_verify",
      }),
      req("Login Buyer", "/auth/login", {
        email: "{{buyerEmail}}",
        password: "{{buyerPassword}}",
      }, { tests: saveUserTokens }),
      req("Login Vendor", "/auth/login", {
        email: "{{vendorEmail}}",
        password: "{{vendorPassword}}",
      }, { tests: saveUserTokens }),
      req("Refresh Token", "/auth/refresh-token", {
        refreshToken: "{{userRefreshToken}}",
      }, { tests: saveUserTokens }),
      req("Forgot Password", "/auth/forgot-password", {
        email: "{{buyerEmail}}",
      }),
      req("Verify Reset OTP", "/auth/verify-reset-otp", {
        email: "{{buyerEmail}}",
        otp: "{{otp}}",
      }, { tests: saveResetToken }),
      req("Reset Password", "/auth/reset-password", {
        email: "{{buyerEmail}}",
        resetToken: "{{resetToken}}",
        newPassword: "NewBuyer@12345",
      }),
      req("Logout", "/auth/logout", {
        refreshToken: "{{userRefreshToken}}",
      }),
    ], null, "No Bearer token. Run Login to save tokens."),
    folder("02 - Admin Auth", [
      req("Admin Login", "/admin/auth/login", {
        email: "{{adminEmail}}",
        password: "{{adminPassword}}",
      }, { tests: saveAdminTokens, description: "Seed admin: node backend/src/scripts/seedAdmin.js" }),
      req("Admin Refresh Token", "/admin/auth/refresh-token", {
        refreshToken: "{{adminRefreshToken}}",
      }, { tests: saveAdminTokens }),
      req("Admin Logout", "/admin/auth/logout", {
        refreshToken: "{{adminRefreshToken}}",
      }),
    ], "adminAccessToken"),
    folder("03 - Users", [
      req("Get Me", "/users/me", {}),
      req("Update Profile", "/users/update", {
        firstName: "Ahmed",
        lastName: "Buyer",
        mobile: "612345678",
        countryCode: "+33",
        language: "en",
      }),
      req("Save FCM Token", "/users/fcm-token", {
        fcmToken: "test-fcm-device-token",
      }),
      {
        name: "Upload Profile Photo",
        request: {
          method: "POST",
          header: [],
          body: {
            mode: "formdata",
            formdata: [{ key: "photo", type: "file", src: "" }],
          },
          url: `${baseUrl}/users/photo`,
          description: "Field: photo (JPEG/PNG/WEBP, max 5MB)",
        },
      },
    ], "userAccessToken"),
    folder("04 - Listings (Public)", [
      req("Browse Listings", "/listings/browse", {
        page: 1,
        limit: 20,
        sort: "newest",
      }, { tests: saveFirstListingFromList }),
      req("Browse (with filters)", "/listings/browse", {
        page: 1,
        limit: 20,
        search: "BMW",
        fuelType: "petrol",
        transmission: "automatic",
        minPrice: 1000000,
        maxPrice: 50000000,
        dateFrom: "2024-01-01",
        dateTo: "2026-12-31",
      }),
      req("Get Listing By ID", "/listings/get", { id: "{{listingId}}" }),
    ]),
    folder("05 - Listings (Vendor)", [
      req("My Listings", "/listings/mine", { page: 1, limit: 20 }, { tests: saveFirstListingFromList }),
      req("Create Listing", "/listings/create", {
        makeId: "{{makeId}}",
        modelId: "{{modelId}}",
        year: 2021,
        registrationNumber: "AB-123-CD",
        mileage: 32000,
        fuelType: "petrol",
        transmission: "automatic",
        condition: "used",
        askingPrice: 4500000,
        locationText: "Paris, France",
        latitude: 48.8566,
        longitude: 2.3522,
        submitForApproval: true,
      }, { tests: saveListingId, description: "Use VENDOR token. askingPrice in cents." }),
      {
        name: "Create Listing With Photos",
        request: {
          method: "POST",
          header: [],
          body: {
            mode: "formdata",
            formdata: [
              { key: "makeId", value: "{{makeId}}", type: "text" },
              { key: "modelId", value: "{{modelId}}", type: "text" },
              { key: "year", value: "2021", type: "text" },
              { key: "mileage", value: "32000", type: "text" },
              { key: "fuelType", value: "petrol", type: "text" },
              { key: "transmission", value: "automatic", type: "text" },
              { key: "condition", value: "used", type: "text" },
              { key: "askingPrice", value: "4500000", type: "text" },
              { key: "locationText", value: "Paris, France", type: "text" },
              { key: "submitForApproval", value: "true", type: "text" },
              { key: "photos", type: "file", src: "" },
            ],
          },
          url: `${baseUrl}/listings/create-with-photos`,
        },
      },
      req("Update Listing", "/listings/update", {
        id: "{{listingId}}",
        mileage: 35000,
        askingPrice: 4400000,
      }),
      req("Submit Listing", "/listings/submit", { id: "{{listingId}}" }),
      {
        name: "Add Photos",
        request: {
          method: "POST",
          header: [],
          body: {
            mode: "formdata",
            formdata: [
              { key: "id", value: "{{listingId}}", type: "text" },
              { key: "photos", type: "file", src: "" },
            ],
          },
          url: `${baseUrl}/listings/photos/add`,
        },
      },
      req("Delete Photo", "/listings/photos/delete", {
        id: "{{listingId}}",
        publicId: "cloudinary-public-id",
      }),
      req("Delete Listing", "/listings/delete", { id: "{{listingId}}" }),
    ], "userAccessToken", "Login as VENDOR before running these."),
    folder("06 - Offers (Buyer)", [
      req("Create Offer", "/offers/create", {
        listingId: "{{listingId}}",
        amount: 4400000,
        message: "Interested in this vehicle",
      }, { tests: saveOfferId, description: "Listing must be approved. Use BUYER token." }),
      req("My Offers", "/offers/mine", { page: 1, limit: 20 }, { tests: saveFirstOfferFromList }),
    ], "userAccessToken", "Login as BUYER."),
    folder("07 - Offers (Vendor)", [
      req("Received Offers", "/offers/received", {
        page: 1,
        limit: 20,
        status: "pending",
      }, { tests: saveFirstOfferFromList }),
      req("Received Offers (by listing)", "/offers/received", {
        page: 1,
        limit: 20,
        listingId: "{{listingId}}",
      }),
      req("Accept Offer", "/offers/accept", { id: "{{offerId}}" }),
      req("Reject Offer", "/offers/reject", {
        id: "{{offerId}}",
        reason: "Offer too low",
      }),
    ], "userAccessToken", "Login as VENDOR."),
    folder("08 - Offers (Shared)", [
      req("Get Offer", "/offers/get", { id: "{{offerId}}" }),
    ], "userAccessToken"),
    folder("09 - Notifications", [
      req("My Notifications", "/notifications/mine", {
        page: 1,
        limit: 20,
        unread: true,
      }, { tests: saveFirstNotificationId }),
      req("Mark As Read", "/notifications/read", { id: "{{notificationId}}" }),
      req("Mark All Read", "/notifications/read-all", {}),
    ], "userAccessToken"),
    folder("10 - Payments", [
      req("Create Payment Intent", "/payments/create-intent", {
        offerId: "{{offerId}}",
      }, { tests: saveTransactionId, description: "BUYER token. Offer must be accepted. Needs Stripe." }),
      req("Get Transaction", "/payments/transaction/get", {
        transactionId: "{{transactionId}}",
      }),
      req("Confirm Delivery", "/payments/confirm-delivery", {
        transactionId: "{{transactionId}}",
      }, { description: "Only works when transaction status is escrowed (after Stripe webhook)." }),
    ], "userAccessToken"),
    folder("11 - Wallet", [
      req("Get Wallet", "/wallet/get", {}),
      req("Get Ledger", "/wallet/ledger", { page: 1, limit: 20 }),
      req("Create Bank Details", "/wallet/bank-details/create", {
        accountHolderName: "Jean Dupont",
        accountNumber: "FR7630004000050000001234567",
        ifscOrRouting: "BNPAFRPP",
        bankName: "BNP Paribas",
      }),
      req("Get Bank Details", "/wallet/bank-details/get", {}),
      req("Create Withdrawal", "/wallet/withdrawals/create", {
        amount: 100000,
      }, { tests: saveWithdrawalId, description: "VENDOR token. Min 100 cents. Needs bank details + balance." }),
      req("My Withdrawals", "/wallet/withdrawals/mine", { page: 1, limit: 20 }, { tests: saveFirstWithdrawalFromList }),
      req("Get Withdrawal", "/wallet/withdrawals/get", {
        withdrawalId: "{{withdrawalId}}",
      }),
      req("Get Invoice", "/wallet/invoices/get", {
        transactionId: "{{transactionId}}",
      }),
    ], "userAccessToken", "Login as VENDOR for wallet/withdrawals."),
    folder("12 - Master Data", [
      req("List Countries", "/master/list", { master: "country", page: 1, limit: 20 }),
      req("List States", "/master/list", { master: "state", countryId: 1, page: 1, limit: 20 }),
      req("List Cities", "/master/list", { master: "city", countryId: 1, stateId: 1, page: 1, limit: 20 }),
    ]),
    folder("13 - Landing & CMS (Public)", [
      req("Landing Data", "/landing/data", {}),
      req("Get CMS Page (public)", "/cms/get", { slug: "about-us" }),
    ]),
    folder("14 - Admin Dashboard", [
      req("Dashboard Stats", "/admin/dashboard/stats", {}),
    ], "adminAccessToken"),
    folder("15 - Admin Users", [
      req("List Buyers", "/admin/users/list", { page: 1, limit: 20, role: "buyer", search: "" }),
      req("List Vendors", "/admin/users/list", { page: 1, limit: 20, role: "vendor", search: "" }),
      req("Get User", "/admin/users/get", { userId: "{{userId}}" }),
      req("Activate User", "/admin/users/activate", { userId: "{{userId}}" }),
      req("Deactivate User", "/admin/users/deactivate", { userId: "{{userId}}" }),
      req("Delete User", "/admin/users/delete", { userId: "{{userId}}" }),
    ], "adminAccessToken"),
    folder("16 - Admin Listings", [
      req("List Listings", "/admin/listings/list", { page: 1, limit: 20, status: "pending" }, { tests: saveFirstListingFromList }),
      req("Get Listing", "/admin/listings/get", { listingId: "{{listingId}}" }),
      req("Approve Listing", "/admin/listings/approve", { listingId: "{{listingId}}" }),
      req("Reject Listing", "/admin/listings/reject", {
        listingId: "{{listingId}}",
        rejectionReason: "Photos are unclear",
      }),
      req("Toggle Verified Badge", "/admin/listings/toggle-verified", { listingId: "{{listingId}}" }),
    ], "adminAccessToken"),
    folder("17 - Admin Commission", [
      req("Get Commission", "/admin/commission/get", {}),
      req("Update Commission", "/admin/commission/update", { percentage: 5 }),
    ], "adminAccessToken"),
    folder("18 - Admin Withdrawals", [
      req("List Withdrawals", "/admin/withdrawals/list", { page: 1, limit: 20, status: "pending" }),
      req("Get Withdrawal", "/admin/withdrawals/get", { withdrawalId: "{{withdrawalId}}" }),
      req("Approve Withdrawal", "/admin/withdrawals/approve", { withdrawalId: "{{withdrawalId}}" }),
      req("Mark Withdrawal Paid", "/admin/withdrawals/mark-paid", { withdrawalId: "{{withdrawalId}}" }),
      req("Reject Withdrawal", "/admin/withdrawals/reject", {
        withdrawalId: "{{withdrawalId}}",
        rejectionReason: "Invalid bank details provided",
      }),
    ], "adminAccessToken"),
    folder("19 - Admin Transactions", [
      req("List Transactions", "/admin/transactions/list", {
        page: 1,
        limit: 20,
        status: "released",
      }),
      req("Get Transaction", "/admin/transactions/get", { transactionId: "{{transactionId}}" }),
    ], "adminAccessToken"),
    folder("20 - Admin CMS", [
      req("Create Page", "/admin/cms/create", {
        title: "About Us",
        slug: "about-us",
        content: "<p>About C2C Vehicles</p>",
        isActive: true,
      }, { tests: saveCmsPageId }),
      req("Update Page", "/admin/cms/update", {
        slug: "about-us",
        title: "About Us Updated",
        content: "<p>Updated content</p>",
      }),
      req("List Pages", "/admin/cms/list", { page: 1, limit: 20 }),
      req("Get Page", "/admin/cms/get", { id: "{{cmsPageId}}" }),
      req("Delete Page", "/admin/cms/delete", { id: "{{cmsPageId}}" }),
    ], "adminAccessToken"),
    folder("21 - Admin Settings", [
      req("Get Settings", "/admin/settings/get", {}),
      req("Update Settings", "/admin/settings/update", {
        platformName: "C2C Vehicles",
        supportEmail: "support@c2c.com",
        contactPhone: "+33 123456789",
        contactAddress: "Paris, France",
        maxPhotosPerListing: 10,
        maintenanceMode: false,
      }),
    ], "adminAccessToken"),
    folder("22 - Admin Audit", [
      req("List Audit Logs", "/admin/audit/list", {
        page: 1,
        limit: 20,
        fromDate: "2024-01-01",
        toDate: "2026-12-31",
      }),
    ], "adminAccessToken"),
    folder("23 - Admin Makes", [
      req("List Makes", "/makes/list", { page: 1, limit: 50 }),
      req("Get Make", "/makes/get", { id: "{{makeId}}" }),
      req("Create Make", "/makes/create", { name: "BMW" }, { tests: saveMakeId }),
      req("Update Make", "/makes/update", { id: "{{makeId}}", name: "BMW", isActive: true }),
      req("Delete Make", "/makes/delete", { id: "{{makeId}}" }),
    ], "adminAccessToken"),
    folder("24 - Admin Models", [
      req("List Models", "/models/list", { makeId: "{{makeId}}", page: 1, limit: 100 }),
      req("Get Model", "/models/get", { id: "{{modelId}}" }),
      req("Create Model", "/models/create", { makeId: "{{makeId}}", name: "X5" }, { tests: saveModelId }),
      req("Update Model", "/models/update", { id: "{{modelId}}", name: "X5", isActive: true }),
      req("Delete Model", "/models/delete", { id: "{{modelId}}" }),
    ], "adminAccessToken"),
  ],
};

const env = {
  id: "c2c-local-env-id",
  name: "C2C Local",
  values: [
    { key: "baseUrl", value: "http://localhost:5000/api/v1", type: "default", enabled: true },
    { key: "buyerEmail", value: "buyer@test.com", type: "default", enabled: true },
    { key: "buyerPassword", value: "Buyer@12345", type: "default", enabled: true },
    { key: "vendorEmail", value: "vendor@test.com", type: "default", enabled: true },
    { key: "vendorPassword", value: "Vendor@12345", type: "default", enabled: true },
    { key: "adminEmail", value: "admin@c2c.com", type: "default", enabled: true },
    { key: "adminPassword", value: "Admin123!", type: "default", enabled: true },
    { key: "userAccessToken", value: "", type: "default", enabled: true },
    { key: "userRefreshToken", value: "", type: "default", enabled: true },
    { key: "adminAccessToken", value: "", type: "default", enabled: true },
    { key: "adminRefreshToken", value: "", type: "default", enabled: true },
    { key: "userId", value: "", type: "default", enabled: true },
    { key: "adminId", value: "", type: "default", enabled: true },
    { key: "listingId", value: "", type: "default", enabled: true },
    { key: "makeId", value: "", type: "default", enabled: true },
    { key: "modelId", value: "", type: "default", enabled: true },
    { key: "offerId", value: "", type: "default", enabled: true },
    { key: "transactionId", value: "", type: "default", enabled: true },
    { key: "withdrawalId", value: "", type: "default", enabled: true },
    { key: "notificationId", value: "", type: "default", enabled: true },
    { key: "cmsPageId", value: "", type: "default", enabled: true },
    { key: "resetToken", value: "", type: "default", enabled: true },
    { key: "otp", value: "123456", type: "default", enabled: true },
  ],
  _postman_variable_scope: "environment",
};

const dir = __dirname;
fs.writeFileSync(
  path.join(dir, "C2C-Vehicle-Platform.postman_collection.json"),
  JSON.stringify(collection, null, 2)
);
fs.writeFileSync(
  path.join(dir, "C2C-Local.postman_environment.json"),
  JSON.stringify(env, null, 2)
);
console.log("Generated:");
console.log("  - C2C-Vehicle-Platform.postman_collection.json");
console.log("  - C2C-Local.postman_environment.json");
