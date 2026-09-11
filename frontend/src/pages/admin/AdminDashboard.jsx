import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SidebarLayout from "../../components/dashboard/SidebarLayout";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { ADMIN_NAV } from "../../config/navigation";
import { fetchAdminDashboard } from "../../api/admin.api";
import useCurrencyStore from "../../store/useCurrencyStore";

export default function AdminDashboard() {
  const { formatPrice } = useCurrencyStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("6m"); // "6m" | "12m"
  const [chartMode, setChartMode] = useState("bar"); // "bar" | "area"
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);
  const [activeSeries, setActiveSeries] = useState({
    revenue: true,
    commission: true,
    sales: true,
  });

  useEffect(() => {
    fetchAdminDashboard()
      .then((res) => setData(res.data.data))
      .catch((err) => console.error("Failed to load admin stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;
  const topMakes = data?.topMakes || [];
  const activeChartData = timeframe === "12m" ? data?.chart12m || [] : data?.chart6m || data?.chart || [];

  // Compute Max Bounds for Chart Y-Axis
  const maxRevenue = Math.max(...activeChartData.map((c) => c.revenue), 10000);
  const maxCommission = Math.max(...activeChartData.map((c) => c.commission), 500);

  // Listing Breakdown
  const approvedCount = stats?.approvedListings || 0;
  const pendingCount = stats?.pendingApprovals || 0;
  const soldCount = stats?.soldListings || 0;
  const totalCount = stats?.totalListings || approvedCount + pendingCount + soldCount || 1;

  const approvedPct = Math.round((approvedCount / totalCount) * 100) || 0;
  const pendingPct = Math.round((pendingCount / totalCount) * 100) || 0;
  const soldPct = Math.round((soldCount / totalCount) * 100) || 0;

  // Buyers vs Vendors ratio
  const buyersCount = stats?.buyersCount || 0;
  const vendorsCount = stats?.vendorsCount || 0;
  const totalUserCount = stats?.totalUsers || buyersCount + vendorsCount || 1;
  const buyerPct = Math.round((buyersCount / totalUserCount) * 100) || 50;

  const toggleSeries = (key) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to build SVG curve paths for "area" mode
  const getCurvePath = (dataKey, maxVal) => {
    if (!activeChartData.length) return "";
    const width = 600;
    const height = 180;
    const step = width / (activeChartData.length - 1);
    const points = activeChartData.map((item, i) => {
      const x = i * step;
      const val = item[dataKey] || 0;
      const y = height - (val / maxVal) * (height - 20) - 10;
      return { x, y };
    });

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    return path;
  };

  const getAreaPath = (dataKey, maxVal) => {
    const curve = getCurvePath(dataKey, maxVal);
    if (!curve) return "";
    const lastX = 600;
    return `${curve} L ${lastX},180 L 0,180 Z`;
  };

  return (
    <SidebarLayout navItems={ADMIN_NAV} roleLabel="Admin Panel">
      <PageHeader
        title="Admin Analytics & Platform Overview"
        subtitle="Real-time vehicle marketplace transactions, commission, and inventory metrics"
        action={
          <Link
            to="/admin/invoices"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            🧾 Invoices & Receipts
          </Link>
        }
      />

      {/* Top Stat Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers?.toLocaleString() ?? "—"} />
        <StatCard label="Total Listings" value={stats?.totalListings?.toLocaleString() ?? "—"} />
        <StatCard label="Total Revenue" value={stats ? formatPrice(stats.totalRevenue) : "—"} />
        <StatCard label="Commission Earned" value={stats ? formatPrice(stats.commissionEarned) : "—"} />
        <StatCard label="Pending Approvals" value={stats?.pendingApprovals ?? "—"} />
        <StatCard label="Pending Withdrawals" value={stats?.pendingWithdrawals ?? "—"} />
      </div>

      {/* Main Interactive Chart Suite */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Main Revenue & Platform Growth Analytics */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-surface flex flex-col justify-between shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-text-primary">
                  Revenue & Sales Performance
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Gross sales volume vs platform commission revenue
              </p>
            </div>

            {/* Timeframe & Chart View Mode Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Range Filters */}
              <div className="flex items-center bg-background border border-border rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeframe("6m")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    timeframe === "6m"
                      ? "bg-surface-elevated text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe("12m")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    timeframe === "12m"
                      ? "bg-surface-elevated text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  1 Year
                </button>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center bg-background border border-border rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setChartMode("bar")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartMode === "bar"
                      ? "bg-primary-500/20 text-primary-400 font-bold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  title="Bar Chart View"
                >
                  📊 Bar
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode("area")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    chartMode === "area"
                      ? "bg-primary-500/20 text-primary-400 font-bold"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                  title="Smooth Trend View"
                >
                  📈 Trend
                </button>
              </div>
            </div>
          </div>

          {/* Series Toggle Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs bg-background/50 p-2.5 rounded-lg border border-border/50">
            <span className="text-text-muted font-medium">Metrics:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleSeries("revenue")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                  activeSeries.revenue
                    ? "border-[#00a884] bg-[#00a884]/15 text-text-primary font-semibold"
                    : "border-border text-text-muted opacity-40"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a884]"></span>
                <span>Sales Volume (€)</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSeries("commission")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                  activeSeries.commission
                    ? "border-[#38bdf8] bg-[#38bdf8]/15 text-text-primary font-semibold"
                    : "border-border text-text-muted opacity-40"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
                <span>Commission (€)</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSeries("sales")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                  activeSeries.sales
                    ? "border-[#f59e0b] bg-[#f59e0b]/15 text-text-primary font-semibold"
                    : "border-border text-text-muted opacity-40"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                <span>Cars Sold (Units)</span>
              </button>
            </div>
          </div>

          {/* Interactive Chart Workspace */}
          <div className="relative pt-2 pb-2">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pb-8 pt-4">
              <div className="border-b border-border w-full flex justify-between text-[10px] text-text-muted">
                <span>{formatPrice(maxRevenue)}</span>
              </div>
              <div className="border-b border-border w-full flex justify-between text-[10px] text-text-muted">
                <span>{formatPrice(maxRevenue * 0.75)}</span>
              </div>
              <div className="border-b border-border w-full flex justify-between text-[10px] text-text-muted">
                <span>{formatPrice(maxRevenue * 0.5)}</span>
              </div>
              <div className="border-b border-border w-full flex justify-between text-[10px] text-text-muted">
                <span>{formatPrice(maxRevenue * 0.25)}</span>
              </div>
              <div className="border-b border-border w-full"></div>
            </div>

            {/* Smooth Area Line Chart View */}
            {chartMode === "area" ? (
              <div className="relative h-64 w-full pt-4">
                <svg className="w-full h-48 overflow-visible" viewBox="0 0 600 180">
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00a884" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00a884" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Revenue Area Curve */}
                  {activeSeries.revenue && (
                    <>
                      <path d={getAreaPath("revenue", maxRevenue)} fill="url(#revGrad)" />
                      <path
                        d={getCurvePath("revenue", maxRevenue)}
                        fill="none"
                        stroke="#00a884"
                        strokeWidth="3"
                      />
                    </>
                  )}

                  {/* Commission Area Curve */}
                  {activeSeries.commission && (
                    <>
                      <path d={getAreaPath("commission", maxCommission)} fill="url(#commGrad)" />
                      <path
                        d={getCurvePath("commission", maxCommission)}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeDasharray="4 2"
                      />
                    </>
                  )}

                  {/* Points & Interactive Nodes */}
                  {activeChartData.map((item, idx) => {
                    const step = 600 / (activeChartData.length - 1 || 1);
                    const cx = idx * step;
                    const revY = 180 - (item.revenue / maxRevenue) * 160 - 10;
                    const commY = 180 - (item.commission / maxCommission) * 160 - 10;
                    const isHovered = hoveredIndex === idx;

                    return (
                      <g key={item.label} className="cursor-pointer">
                        {/* Hover vertical line */}
                        {isHovered && (
                          <line
                            x1={cx}
                            y1="0"
                            x2={cx}
                            y2="180"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            opacity="0.6"
                          />
                        )}

                        {activeSeries.revenue && (
                          <circle
                            cx={cx}
                            cy={revY}
                            r={isHovered ? 6 : 4}
                            fill="#00a884"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                        )}

                        {activeSeries.commission && (
                          <circle
                            cx={cx}
                            cy={commY}
                            r={isHovered ? 6 : 4}
                            fill="#38bdf8"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* X-Axis Month Hover Areas */}
                <div className="absolute inset-0 flex justify-between h-48">
                  {activeChartData.map((item, idx) => (
                    <div
                      key={item.label}
                      className="flex-1 h-full relative cursor-pointer group"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Hover Popover Tooltip */}
                      {hoveredIndex === idx && (
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#182229] border border-gray-700 text-white rounded-xl p-3.5 shadow-2xl z-30 min-w-[170px] text-xs pointer-events-none animate-fadeIn">
                          <div className="font-bold border-b border-gray-700 pb-1.5 mb-2 text-text-accent flex items-center justify-between">
                            <span>{item.label} Summary</span>
                            <span className="text-[10px] text-emerald-400 font-normal">Active</span>
                          </div>
                          <div className="flex justify-between gap-3 py-0.5">
                            <span className="text-gray-400">Sales Volume:</span>
                            <span className="font-bold text-white">{formatPrice(item.revenue)}</span>
                          </div>
                          <div className="flex justify-between gap-3 py-0.5">
                            <span className="text-gray-400">Commission:</span>
                            <span className="font-bold text-cyan-400">{formatPrice(item.commission)}</span>
                          </div>
                          <div className="flex justify-between gap-3 py-0.5">
                            <span className="text-gray-400">Cars Sold:</span>
                            <span className="font-bold text-amber-400">{item.salesCount} units</span>
                          </div>
                          <div className="flex justify-between gap-3 py-0.5 text-[11px]">
                            <span className="text-gray-400">Avg Selling Price:</span>
                            <span className="font-semibold text-emerald-400">
                              {formatPrice(item.salesCount ? Math.round(item.revenue / item.salesCount) : 0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between pt-2 px-1 text-xs text-text-muted font-medium border-t border-border">
                  {activeChartData.map((item, idx) => (
                    <span
                      key={item.label}
                      className={hoveredIndex === idx ? "text-text-accent font-bold" : ""}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              /* Bar Chart View */
              <div className="h-64 flex flex-col justify-end pt-4">
                <div className="h-52 flex items-end justify-between gap-2 px-2 border-b border-border/60">
                  {activeChartData.map((item, idx) => {
                    const revHeightPct = (item.revenue / maxRevenue) * 85;
                    const commHeightPct = (item.commission / maxCommission) * 85;
                    const salesHeightPct = ((item.salesCount || 1) / 20) * 85;
                    const isHovered = hoveredIndex === idx;

                    return (
                      <div
                        key={item.label}
                        className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {/* Hover Popover Tooltip */}
                        {isHovered && (
                          <div className="absolute bottom-full mb-3 bg-[#182229] border border-gray-700 text-white rounded-xl p-3.5 shadow-2xl z-30 min-w-[170px] text-xs pointer-events-none animate-fadeIn">
                            <div className="font-bold border-b border-gray-700 pb-1.5 mb-2 text-text-accent flex items-center justify-between">
                              <span>{item.label} Performance</span>
                              <span className="text-[10px] text-emerald-400 font-normal">Details</span>
                            </div>
                            <div className="flex justify-between gap-3 text-gray-300 py-0.5">
                              <span>Sales Volume:</span>
                              <span className="font-bold text-white">{formatPrice(item.revenue)}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-gray-300 py-0.5">
                              <span>Commission Cut:</span>
                              <span className="font-bold text-cyan-400">{formatPrice(item.commission)}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-gray-300 py-0.5">
                              <span>Cars Sold:</span>
                              <span className="font-bold text-amber-400">{item.salesCount} vehicles</span>
                            </div>
                            <div className="flex justify-between gap-3 text-gray-300 py-0.5 border-t border-gray-800 mt-1 pt-1">
                              <span>Avg Price / Car:</span>
                              <span className="font-semibold text-emerald-400">
                                {formatPrice(item.salesCount ? Math.round(item.revenue / item.salesCount) : 0)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Distinct Bars Group */}
                        <div className="w-full flex items-end justify-center gap-1.5 h-full px-1">
                          {/* Revenue Bar */}
                          {activeSeries.revenue && (
                            <div
                              className="flex-1 max-w-[20px] bg-gradient-to-t from-[#005c4b] to-[#00a884] rounded-t-md transition-all duration-300 hover:brightness-125 shadow-sm"
                              style={{ height: `${Math.max(revHeightPct, 8)}%` }}
                            />
                          )}
                          {/* Commission Bar */}
                          {activeSeries.commission && (
                            <div
                              className="flex-1 max-w-[20px] bg-gradient-to-t from-[#0284c7] to-[#38bdf8] rounded-t-md transition-all duration-300 hover:brightness-125 shadow-sm"
                              style={{ height: `${Math.max(commHeightPct, 8)}%` }}
                            />
                          )}
                          {/* Cars Sold Count Bar */}
                          {activeSeries.sales && (
                            <div
                              className="flex-1 max-w-[20px] bg-gradient-to-t from-[#d97706] to-[#f59e0b] rounded-t-md transition-all duration-300 hover:brightness-125 shadow-sm"
                              style={{ height: `${Math.max(salesHeightPct, 8)}%` }}
                            />
                          )}
                        </div>

                        {/* Month Label */}
                        <span
                          className={`text-xs mt-2.5 font-medium transition-colors ${
                            isHovered ? "text-text-accent font-bold scale-110" : "text-text-muted"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Inventory & Brand Analytics Panel */}
        <div className="flex flex-col gap-6">
          {/* Donut Chart: Inventory Status Breakdown */}
          <div className="p-6 rounded-xl border border-border bg-surface shadow-card flex flex-col justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary mb-0.5">
                Inventory Pipeline
              </h2>
              <p className="text-xs text-text-muted mb-3">
                Live distribution of vehicle listing status
              </p>

              {/* Interactive SVG Donut */}
              <div className="relative flex items-center justify-center my-3">
                <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-border"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Active / Approved Segment */}
                  <path
                    className={`text-[#00a884] transition-all duration-500 cursor-pointer ${
                      hoveredDonutSegment === "approved" ? "stroke-[4.8]" : "stroke-[3.8]"
                    }`}
                    strokeDasharray={`${approvedPct}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    onMouseEnter={() => setHoveredDonutSegment("approved")}
                    onMouseLeave={() => setHoveredDonutSegment(null)}
                  />
                  {/* Sold Segment */}
                  <path
                    className={`text-[#3b82f6] transition-all duration-500 cursor-pointer ${
                      hoveredDonutSegment === "sold" ? "stroke-[4.8]" : "stroke-[3.8]"
                    }`}
                    strokeDasharray={`${soldPct}, 100`}
                    strokeDashoffset={`-${approvedPct}`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    onMouseEnter={() => setHoveredDonutSegment("sold")}
                    onMouseLeave={() => setHoveredDonutSegment(null)}
                  />
                  {/* Pending Segment */}
                  <path
                    className={`text-[#f59e0b] transition-all duration-500 cursor-pointer ${
                      hoveredDonutSegment === "pending" ? "stroke-[4.8]" : "stroke-[3.8]"
                    }`}
                    strokeDasharray={`${pendingPct}, 100`}
                    strokeDashoffset={`-${approvedPct + soldPct}`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    onMouseEnter={() => setHoveredDonutSegment("pending")}
                    onMouseLeave={() => setHoveredDonutSegment(null)}
                  />
                </svg>

                {/* Center Donut Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-display text-2xl font-bold text-text-primary">
                    {totalCount}
                  </span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                    Total Vehicles
                  </span>
                </div>
              </div>

              {/* Status Breakdown Legend Items */}
              <div className="space-y-2 text-xs">
                <div
                  onMouseEnter={() => setHoveredDonutSegment("approved")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                    hoveredDonutSegment === "approved"
                      ? "bg-surface-hover border-emerald-500/40"
                      : "bg-background border-border/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00a884]"></span>
                    <span className="text-text-primary font-medium">Active Listings</span>
                  </div>
                  <span className="font-bold text-emerald-400">{approvedCount} ({approvedPct}%)</span>
                </div>

                <div
                  onMouseEnter={() => setHoveredDonutSegment("pending")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                    hoveredDonutSegment === "pending"
                      ? "bg-surface-hover border-amber-500/40"
                      : "bg-background border-border/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                    <span className="text-text-primary font-medium">Pending Review</span>
                  </div>
                  <span className="font-bold text-amber-400">{pendingCount} ({pendingPct}%)</span>
                </div>

                <div
                  onMouseEnter={() => setHoveredDonutSegment("sold")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                    hoveredDonutSegment === "sold"
                      ? "bg-surface-hover border-blue-500/40"
                      : "bg-background border-border/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                    <span className="text-text-primary font-medium">Sold Vehicles</span>
                  </div>
                  <span className="font-bold text-blue-400">{soldCount} ({soldPct}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Market Share, Demographics & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Vehicle Makes Market Share */}
        <div className="p-6 rounded-xl border border-border bg-surface shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">
                Top Brand Market Share
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Most popular car makes listed on platform
              </p>
            </div>
            <Link
              to="/admin/vehicle-data"
              className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
            >
              View Masters →
            </Link>
          </div>

          <div className="space-y-3.5">
            {topMakes.map((make, idx) => (
              <div key={make.name} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-bold w-4">#{idx + 1}</span>
                    {make.name}
                  </span>
                  <span className="font-bold text-text-primary">
                    {make.count} cars <span className="text-text-muted font-normal">({make.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(make.percentage, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Demographics Split */}
        <div className="p-6 rounded-xl border border-border bg-surface shadow-card">
          <h2 className="font-display text-lg font-bold text-text-primary mb-1">
            User Accounts & Network
          </h2>
          <p className="text-xs text-text-muted mb-4">
            Buyer vs Verified Seller accounts active on C2C Platform
          </p>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-semibold text-text-primary">
              <span className="text-emerald-400">Buyers: {buyersCount} ({buyerPct}%)</span>
              <span className="text-cyan-400">Sellers: {vendorsCount} ({100 - buyerPct}%)</span>
            </div>

            {/* Split Progress Bar */}
            <div className="h-3.5 w-full bg-surface-elevated rounded-full overflow-hidden flex border border-border">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                style={{ width: `${buyerPct}%` }}
              ></div>
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500 flex-1"
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-lg bg-background border border-border flex flex-col justify-between">
                <div>
                  <span className="text-text-muted block font-medium">Registered Buyers</span>
                  <span className="font-bold text-xl text-text-primary mt-1 block">
                    {buyersCount.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 mt-2 block font-medium">
                  ✓ Ready to purchase
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-background border border-border flex flex-col justify-between">
                <div>
                  <span className="text-text-muted block font-medium">Verified Dealers</span>
                  <span className="font-bold text-xl text-text-primary mt-1 block">
                    {vendorsCount.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-cyan-400 mt-2 block font-medium">
                  ★ Active inventory sellers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Platform Action Hub */}
        <div className="p-6 rounded-xl border border-border bg-surface shadow-card flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary mb-1">
              Admin Action Hub
            </h2>
            <p className="text-xs text-text-muted mb-4">
              Instant management actions & approval queues
            </p>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <Link
                to="/admin/listings"
                className="p-3 rounded-xl border border-border bg-background hover:border-primary-400/40 hover:bg-surface-hover transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🚗</span>
                  <div>
                    <span className="font-bold text-text-primary block">Listing Approvals</span>
                    <span className="text-amber-400 font-medium">
                      {pendingCount} Pending
                    </span>
                  </div>
                </div>
                <span className="text-text-muted group-hover:text-text-accent transition-colors">→</span>
              </Link>

              <Link
                to="/admin/withdrawals"
                className="p-3 rounded-xl border border-border bg-background hover:border-primary-400/40 hover:bg-surface-hover transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">💸</span>
                  <div>
                    <span className="font-bold text-text-primary block">Payout Requests</span>
                    <span className="text-blue-400 font-medium">
                      {stats?.pendingWithdrawals || 0} Pending
                    </span>
                  </div>
                </div>
                <span className="text-text-muted group-hover:text-text-accent transition-colors">→</span>
              </Link>

              <Link
                to="/admin/sellers"
                className="p-3 rounded-xl border border-border bg-background hover:border-primary-400/40 hover:bg-surface-hover transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">👤</span>
                  <div>
                    <span className="font-bold text-text-primary block">Vendor Accounts</span>
                    <span className="text-text-muted">{vendorsCount} Active</span>
                  </div>
                </div>
                <span className="text-text-muted group-hover:text-text-accent transition-colors">→</span>
              </Link>

              <Link
                to="/admin/vehicle-data"
                className="p-3 rounded-xl border border-border bg-background hover:border-primary-400/40 hover:bg-surface-hover transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">⚙️</span>
                  <div>
                    <span className="font-bold text-text-primary block">Makes & Models</span>
                    <span className="text-text-muted">Master Database</span>
                  </div>
                </div>
                <span className="text-text-muted group-hover:text-text-accent transition-colors">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

