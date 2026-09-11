const express = require("express");
const router = express.Router();

// Anti-caching middleware so browser never returns 304 blank page
router.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "C2C Vehicle Selling Platform API",
    version: "1.0.0",
    description: "Comprehensive REST API documentation for the C2C Vehicle Selling Platform including Authentication, Vehicle Listings, Offers, Escrow Payments, Wallet, Invoices, Chat, Admin and UCP endpoints.",
    contact: {
      name: "C2C Platform Support",
      email: "support@c2cvehicleplatform.com"
    }
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server"
    },
    {
      url: "https://c2c-vehicle-selling-platform.onrender.com",
      description: "Production Live Server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "API Health Check",
        tags: ["System"],
        responses: {
          200: { description: "API status healthy" }
        }
      },
      post: {
        summary: "API Health Check (POST)",
        tags: ["System"],
        responses: {
          200: { description: "API status healthy" }
        }
      }
    },
    "/api/v1/auth/register": {
      post: {
        summary: "Register new user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string", example: "John" },
                  lastName: { type: "string", example: "Doe" },
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "Password123!" },
                  countryCode: { type: "string", example: "+1" },
                  mobile: { type: "string", example: "1234567890" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "User registered, OTP sent" } }
      }
    },
    "/api/v1/auth/login": {
      post: {
        summary: "Login with email & password",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "Password123!" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Login successful" } }
      }
    },
    "/api/v1/auth/verify-otp": {
      post: {
        summary: "Verify registration OTP",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "john@example.com" },
                  otp: { type: "string", example: "123456" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "OTP verified successfully" } }
      }
    },
    "/api/v1/auth/me": {
      get: {
        summary: "Get current authenticated user profile",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "User profile fetched" } }
      }
    },
    "/api/v1/listings": {
      get: {
        summary: "List all active vehicle listings",
        tags: ["Listings"],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } }
        ],
        responses: { 200: { description: "Listings list" } }
      },
      post: {
        summary: "Create vehicle listing",
        tags: ["Listings"],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Listing created" } }
      }
    },
    "/api/v1/makes": {
      get: {
        summary: "Get vehicle makes",
        tags: ["Master Data"],
        responses: { 200: { description: "Vehicle makes list" } }
      }
    },
    "/api/v1/models": {
      get: {
        summary: "Get vehicle models",
        tags: ["Master Data"],
        parameters: [{ name: "makeId", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "Vehicle models list" } }
      }
    },
    "/api/v1/offers": {
      post: {
        summary: "Create vehicle offer",
        tags: ["Offers"],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Offer submitted" } }
      }
    },
    "/api/v1/offers/mine": {
      post: {
        summary: "Fetch user's sent or received offers",
        tags: ["Offers"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Offers list" } }
      }
    },
    "/api/v1/payments/create-intent": {
      post: {
        summary: "Create Stripe payment intent for accepted offer",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Checkout session created" } }
      }
    },
    "/api/v1/payments/confirm-delivery": {
      post: {
        summary: "Confirm delivery & release escrow funds to vendor",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Escrow released" } }
      }
    },
    "/api/v1/wallet/get": {
      post: {
        summary: "Fetch user wallet balance & info",
        tags: ["Wallet"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Wallet info" } }
      }
    },
    "/api/v1/wallet/ledger": {
      post: {
        summary: "Fetch wallet transaction ledger entries",
        tags: ["Wallet"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Ledger entries" } }
      }
    },
    "/api/v1/wallet/withdrawals/create": {
      post: {
        summary: "Create withdrawal request",
        tags: ["Wallet"],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Withdrawal requested" } }
      }
    },
    "/api/v1/wallet/invoices/get": {
      post: {
        summary: "Fetch purchase invoice PDF & details",
        tags: ["Invoices"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  transactionId: { type: "string", example: "60f7b1b9e6b3a10015f8a001" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "Invoice details & Cloudinary PDF URL" } }
      }
    },
    "/api/v1/chat/conversations": {
      post: {
        summary: "Fetch user chat conversations",
        tags: ["Chat"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Conversations list" } }
      }
    },
    "/api/v1/chat/send": {
      post: {
        summary: "Send chat message",
        tags: ["Chat"],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Message sent" } }
      }
    }
  }
};

// JSON spec endpoint
router.get("/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI HTML Page
router.get("/", (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>C2C Vehicle Selling Platform - API Documentation</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/favicon-32x32.png" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .swagger-ui .topbar { background-color: #0f172a; padding: 10px 0; }
    .swagger-ui .topbar a { max-width: 300px; }
  </style>
</head>
<body>
  <div id="swagger-ui">
    <div style="padding: 40px; text-align: center; color: #475569; font-family: sans-serif;">
      <h2>Loading C2C API Documentation...</h2>
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function() {
      if (typeof SwaggerUIBundle !== 'undefined') {
        window.ui = SwaggerUIBundle({
          url: "/api-docs/swagger.json",
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout"
        });
      } else {
        document.getElementById('swagger-ui').innerHTML = '<div style="padding:40px; color:red;">Failed to load Swagger UI scripts. Please check your internet connection.</div>';
      }
    };
  </script>
</body>
</html>`;
  res.status(200).send(html);
});

module.exports = router;
