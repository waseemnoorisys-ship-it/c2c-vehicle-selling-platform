const UCP_VERSION = "2026-04-08";

function getUcpBaseUrl() {
  return (process.env.UCP_BASE_URL || process.env.APP_URL || "http://localhost:5000").replace(/\/$/, "");
}

function buildUcpProfile() {
  const baseUrl = getUcpBaseUrl();

  return {
    ucp: {
      version: UCP_VERSION,
      services: {
        "dev.ucp.shopping": [
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/2026-04-08/specification/overview",
            transport: "rest",
            endpoint: `${baseUrl}/ucp/v1`,
            schema: "https://ucp.dev/2026-04-08/services/shopping/rest.openapi.json",
          },
        ],
      },
      capabilities: {
        "dev.ucp.shopping.catalog.search": [
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/2026-04-08/specification/catalog/search",
            schema: "https://ucp.dev/2026-04-08/schemas/shopping/catalog_search.json",
          },
        ],
        "dev.ucp.shopping.catalog.lookup": [
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/2026-04-08/specification/catalog/lookup",
            schema: "https://ucp.dev/2026-04-08/schemas/shopping/catalog_lookup.json",
          },
        ],
        "dev.ucp.shopping.checkout": [
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/2026-04-08/specification/checkout",
            schema: "https://ucp.dev/2026-04-08/schemas/shopping/checkout.json",
          },
        ],
        "dev.ucp.shopping.order": [
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/2026-04-08/specification/order",
            schema: "https://ucp.dev/2026-04-08/schemas/shopping/order.json",
          },
        ],
      },
    },
    signing_keys: [],
  };
}

module.exports = { UCP_VERSION, buildUcpProfile };