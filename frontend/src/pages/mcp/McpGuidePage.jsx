import { useState } from "react";
import LandingHeader from "../../components/landing/LandingHeader";
import LandingFooter from "../../components/landing/LandingFooter";

export default function McpGuidePage() {
  const [activeClientTab, setActiveClientTab] = useState("claude");
  const [activeCategory, setActiveCategory] = useState("vehicle");
  const [copied, setCopied] = useState(false);

  const liveMcpEndpoint = "https://c2c-vehicle-selling-platform-mcp.onrender.com/mcp";

  const mcpConfigJson = `{
  "mcpServers": {
    "c2c-vehicle-platform": {
      "url": "https://c2c-vehicle-selling-platform-mcp.onrender.com/mcp"
    }
  }
}`;

  const copyConfigToClipboard = () => {
    navigator.clipboard.writeText(mcpConfigJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyEndpointToClipboard = () => {
    navigator.clipboard.writeText(liveMcpEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toolsCatalog = {
    vehicle: [
      {
        name: "search_vehicles",
        params: "make, model, year, price, fuel, transmission, condition, radius",
        desc: "Search approved vehicle listings with multi-criteria filters and price range.",
      },
      {
        name: "get_vehicle_details",
        params: "listingId (ObjectId)",
        desc: "Retrieve complete technical specifications, inspection data, images, and seller details.",
      },
      {
        name: "get_makes_and_models",
        params: "makeId (optional)",
        desc: "Fetch master list of vehicle makes and models registered in the platform database.",
      },
    ],
    listings: [
      {
        name: "listing_create",
        params: "makeId, modelId, year, mileage, askingPrice, fuelType",
        desc: "Create a draft vehicle listing with initial specs and asking price.",
      },
      {
        name: "listing_create_with_photos",
        params: "listingData, photoUrls",
        desc: "Create a complete vehicle listing in one step including uploaded photo URLs.",
      },
      {
        name: "create_listing_smart",
        params: "rawVehicleText",
        desc: "AI-assisted smart listing helper parsing vehicle specifications automatically.",
      },
      {
        name: "listing_mine",
        params: "status (optional), page, limit",
        desc: "Fetch all vehicle listings owned by the authenticated seller.",
      },
      {
        name: "listing_update",
        params: "listingId, updateData",
        desc: "Update vehicle listing details, price, condition, or specifications.",
      },
      {
        name: "listing_delete",
        params: "listingId",
        desc: "Soft-delete or archive a vehicle listing from seller inventory.",
      },
      {
        name: "listing_submit",
        params: "listingId",
        desc: "Submit a draft listing to admin queue for verification and approval.",
      },
    ],
    photos: [
      {
        name: "listing_photos_add",
        params: "listingId, photos (Array of photo objects)",
        desc: "Upload and attach high-resolution photo URLs to a listing.",
      },
      {
        name: "listing_photos_delete",
        params: "listingId, photoPublicId",
        desc: "Remove specific photos from a vehicle listing.",
      },
    ],
    offers: [
      {
        name: "offer_create",
        params: "listingId, offerAmount (in cents), note",
        desc: "Submit a monetary purchase offer to the seller for an approved vehicle listing.",
      },
      {
        name: "offer_get",
        params: "offerId (ObjectId)",
        desc: "Check the status (pending, accepted, rejected) and details of an offer by ID.",
      },
      {
        name: "offer_mine",
        params: "page, limit",
        desc: "Retrieve all marketplace purchase offers submitted by the buyer.",
      },
      {
        name: "offer_received",
        params: "page, limit",
        desc: "Retrieve all purchase offers received on vendor's listings.",
      },
      {
        name: "offer_accept",
        params: "offerId",
        desc: "Vendor accepts buyer purchase offer on a vehicle listing.",
      },
      {
        name: "offer_reject",
        params: "offerId, reasonNote",
        desc: "Vendor rejects buyer purchase offer with an optional note.",
      },
    ],
    notifications: [
      {
        name: "notification_list",
        params: "page, limit",
        desc: "Fetch platform notifications for new offers, chat messages, and status updates.",
      },
      {
        name: "notification_read",
        params: "notificationId",
        desc: "Mark a specific notification as read.",
      },
      {
        name: "notification_read_all",
        params: "None",
        desc: "Mark all unread notifications as read.",
      },
    ],
    payments: [
      {
        name: "payment_create",
        params: "listingId, offerId, amount (cents)",
        desc: "Initialize a secure escrow transaction for vehicle purchase.",
      },
      {
        name: "payment_status",
        params: "transactionId",
        desc: "Check current escrow payment status (pending, held, released).",
      },
      {
        name: "payment_confirm_delivery",
        params: "transactionId",
        desc: "Confirm vehicle delivery and authorize escrow fund release to vendor.",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0b1219] text-gray-100 flex flex-col font-body">
      <LandingHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero Section (NSE Style) */}
        <div className="text-center max-w-4xl mx-auto mb-16 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              ✓ Open Access
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              🌐 Public Live Server
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              ⚡ In-House MCP
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
            C2C Vehicle Data, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Native to Your AI.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Access real-time vehicle marketplace listings, platform analytics, pricing metrics, and escrow transactions natively from your AI assistants and LLMs.
          </p>

          {/* Live Endpoint Display Banner */}
          <div className="p-4 rounded-2xl bg-[#141e28] border border-gray-800 flex flex-wrap items-center justify-between gap-4 max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center gap-3 min-w-0 text-left">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <div className="min-w-0">
                <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider block">
                  Live Public Endpoint
                </span>
                <code className="text-xs font-mono text-emerald-300 font-bold truncate block">
                  {liveMcpEndpoint}
                </code>
              </div>
            </div>
            <button
              type="button"
              onClick={copyEndpointToClipboard}
              className="px-3.5 py-1.5 rounded-xl bg-[#202c38] hover:bg-[#2a3948] text-xs font-medium text-cyan-400 border border-gray-700 transition-all shrink-0"
            >
              {copied ? "✓ Copied" : "Copy Endpoint"}
            </button>
          </div>
        </div>

        {/* Tools Available Section */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">
                Tools Available (24 Live Tools)
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Explore our comprehensive suite of tools built for seamless AI integration and automation
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-[#141e28] p-1.5 rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => setActiveCategory("vehicle")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === "vehicle"
                    ? "bg-[#202c38] text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🚘 Vehicle & Makes
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("listings")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === "listings"
                    ? "bg-[#202c38] text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🚗 Listing Management
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("photos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === "photos"
                    ? "bg-[#202c38] text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                📸 Listing Photos
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("offers")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === "offers"
                    ? "bg-[#202c38] text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                💰 Offers
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("notifications")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === "notifications"
                    ? "bg-[#202c38] text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🔔 Notifications
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("payments")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === "payments"
                    ? "bg-[#202c38] text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                💳 Payments & Delivery
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {toolsCatalog[activeCategory].map((tool) => (
              <div
                key={tool.name}
                className="p-5 rounded-2xl border border-gray-800 bg-[#141e28] hover:border-emerald-500/40 transition-colors shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {tool.name}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      MCP Tool
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-800 text-[11px]">
                  <span className="text-gray-400 font-medium block">Parameters:</span>
                  <code className="text-cyan-400 font-mono block mt-0.5 truncate">
                    {tool.params}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started Overview */}
        <div className="mb-20 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#141e28] border border-gray-800 md:col-span-2">
            <h3 className="font-display text-xl font-bold text-white mb-2">
              What is Model Context Protocol (MCP)?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Model Context Protocol (MCP) is an open standard that enables AI assistants like <strong className="text-emerald-400">Claude</strong> and <strong className="text-cyan-400">ChatGPT</strong> to interact directly with external databases, applications, and APIs. Instead of manual copy-pasting, your AI assistant connects natively to the live C2C Vehicle Marketplace database to search vehicles, inspect details, negotiate offers, and manage listings in real time.
            </p>

            <h4 className="font-display text-sm font-bold text-white mb-1">
              Supported Platforms:
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Exclusively optimized for <span className="text-emerald-400 font-semibold">Anthropic Claude</span> (Claude Desktop & Claude AI Connectors) and <span className="text-cyan-400 font-semibold">OpenAI ChatGPT</span> (Developer Mode, Custom GPTs & MCP Plugins).
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#141e28] border border-gray-800">
              <span className="text-lg mb-1 block">🤖</span>
              <h4 className="font-bold text-xs text-white">ChatGPT & Claude Native</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Direct plug-and-play SSE connection for ChatGPT and Claude Desktop.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141e28] border border-gray-800">
              <span className="text-lg mb-1 block">🔒</span>
              <h4 className="font-bold text-xs text-white">Production Security</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Zero exposed local paths or personal secrets. Public enterprise SSE URL.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141e28] border border-gray-800">
              <span className="text-lg mb-1 block">⚡</span>
              <h4 className="font-bold text-xs text-white">24 Live Tools Included</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Full lifecycle access: search, listings, photos, offers, notifications & escrow payments.
              </p>
            </div>
          </div>
        </div>

        {/* Integration Instructions Section for ChatGPT & Claude */}
        <div className="mb-20 p-8 rounded-3xl bg-gradient-to-b from-[#141e28] to-[#0d141c] border border-gray-800 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider block mb-1">
              Connection Setup Guide
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Connect via Claude or ChatGPT
            </h2>
            <p className="text-xs text-gray-400 mt-2">
              Follow step-by-step instructions to enable Developer Mode and connect plugins/connectors.
            </p>
          </div>

          {/* Client Selection Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => setActiveClientTab("claude")}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeClientTab === "claude"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 scale-105"
                  : "bg-[#202c38] text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-sm">🟠</span> Anthropic Claude
            </button>
            <button
              type="button"
              onClick={() => setActiveClientTab("chatgpt")}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeClientTab === "chatgpt"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20 scale-105"
                  : "bg-[#202c38] text-gray-400 hover:text-white"
              }`}
            >
              <span className="text-sm">🟢</span> OpenAI ChatGPT
            </button>
          </div>

          {/* Claude Tab Content */}
          {activeClientTab === "claude" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
                <span className="text-lg">💡</span>
                <span>
                  Claude supports both <strong>Claude Desktop Config</strong> and <strong>Claude AI Connectors (Developer Mode)</strong>.
                </span>
              </div>

              {/* Code Container */}
              <div className="relative">
                <div className="flex items-center justify-between bg-[#0d1117] px-4 py-2 rounded-t-xl border border-gray-800 border-b-0 text-xs text-gray-400 font-mono">
                  <span>claude_desktop_config.json</span>
                  <button
                    type="button"
                    onClick={copyConfigToClipboard}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    {copied ? "✓ Copied" : "Copy JSON"}
                  </button>
                </div>
                <pre className="p-4 rounded-b-xl bg-[#080c10] border border-gray-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                  {mcpConfigJson}
                </pre>
              </div>

              {/* Steps Steps Grid for Claude */}
              <div className="grid sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-4 rounded-xl bg-[#141e28] border border-gray-800 text-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs inline-flex items-center justify-center mb-2">
                    1
                  </span>
                  <h4 className="font-bold text-white mb-1">Developer Mode</h4>
                  <p className="text-gray-400 text-[11px]">
                    Open Claude Settings → Enable <strong>Developer Mode: ON</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141e28] border border-gray-800 text-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs inline-flex items-center justify-center mb-2">
                    2
                  </span>
                  <h4 className="font-bold text-white mb-1">Add Connector</h4>
                  <p className="text-gray-400 text-[11px]">
                    Click <strong>Add MCP Server / Connector</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141e28] border border-gray-800 text-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs inline-flex items-center justify-center mb-2">
                    3
                  </span>
                  <h4 className="font-bold text-white mb-1">Paste Endpoint</h4>
                  <p className="text-gray-400 text-[11px]">
                    Enter SSE URL: <code className="text-cyan-400">{liveMcpEndpoint}</code>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141e28] border border-gray-800 text-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs inline-flex items-center justify-center mb-2">
                    4
                  </span>
                  <h4 className="font-bold text-white mb-1">Save & Connect</h4>
                  <p className="text-gray-400 text-[11px]">
                    Claude auto-discovers all 24 tools. Start asking!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ChatGPT Tab Content */}
          {activeClientTab === "chatgpt" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center gap-3">
                <span className="text-lg">⚡</span>
                <span>
                  Connect ChatGPT using <strong>Developer Mode (Plugins / Connectors)</strong> or via <strong>Custom GPT Actions</strong>.
                </span>
              </div>

              {/* Live URL Copy Card for ChatGPT */}
              <div className="p-4 rounded-xl bg-[#0d1117] border border-gray-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">ChatGPT Connector SSE Endpoint</span>
                  <code className="text-xs text-cyan-300 font-mono font-bold">{liveMcpEndpoint}</code>
                </div>
                <button
                  type="button"
                  onClick={copyEndpointToClipboard}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-bold transition-all border border-cyan-500/30"
                >
                  {copied ? "✓ Copied" : "Copy SSE URL"}
                </button>
              </div>

              {/* Steps Steps Grid for ChatGPT */}
              <div className="grid sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-4 rounded-xl bg-[#141e28] border border-gray-800 text-center">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs inline-flex items-center justify-center mb-2">
                    1
                  </span>
                  <h4 className="font-bold text-white mb-1">Enable Dev Mode</h4>
                  <p className="text-gray-400 text-[11px]">
                    Open ChatGPT Settings → Enable <strong>Developer Mode: ON</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141e28] border border-gray-800 text-center">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs inline-flex items-center justify-center mb-2">
                    2
                  </span>
                  <h4 className="font-bold text-white mb-1">Add Plugin / Action</h4>
                  <p className="text-gray-400 text-[11px]">
                    Go to <strong>Plugins & Connectors</strong> → Click <strong>Add Connector</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141e28] border border-gray-800 text-center">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs inline-flex items-center justify-center mb-2">
                    3
                  </span>
                  <h4 className="font-bold text-white mb-1">Select SSE Protocol</h4>
                  <p className="text-gray-400 text-[11px]">
                    Choose <strong>Server-Sent Events (SSE)</strong> and paste the live endpoint.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141e28] border border-gray-800 text-center">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs inline-flex items-center justify-center mb-2">
                    4
                  </span>
                  <h4 className="font-bold text-white mb-1">Enable & Prompt</h4>
                  <p className="text-gray-400 text-[11px]">
                    Save connector. ChatGPT can now execute all 24 marketplace tools!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer Section (Matching NSE Reference) */}
        <div className="p-6 rounded-2xl bg-[#0e1720] border border-gray-800 text-gray-400 text-xs leading-relaxed max-w-4xl mx-auto">
          <h3 className="font-bold text-white mb-2">Disclaimer</h3>
          <p className="mb-2">
            The C2C Model Context Protocol (MCP) server provides live public data access for vehicle marketplace inventory, pricing metrics, and informational features. Use of the MCP endpoint is subject to standard API rate limits and terms of service.
          </p>
          <p>
            No personal local file systems or sensitive user credentials are exposed via this public endpoint. All data transfers use encrypted HTTPS/TLS protocols.
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

