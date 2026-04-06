import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/Auth";
import { useDivision } from "@/components/context/DivisionContext";
import { useNavigate } from "react-router-dom";
import ErrorModal from "@/components/ErrorModal";
import HomePageSkeleton from "@/components/SkeletonLoaders/HomePageSkeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FaStore,
  FaChartLine,
  FaMoneyBillWave,
  FaUniversity,
  FaWallet,
  FaReceipt,
  FaBox,
  FaUndoAlt,
  FaSun,
  FaFilter,
  FaSyncAlt,
  FaExclamationCircle,
  FaUsers,
  FaCheckCircle,
  FaTruck,
  FaClock,
  FaUserCheck,
  FaUserTimes,
  FaTag,
  FaTrophy,
  FaChevronRight,
  FaCalendarAlt,
  FaShoppingCart,
  FaArrowUp,
  FaArrowDown,
  FaCoins,
  FaChartBar,
  FaExchangeAlt,
  FaCashRegister,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  .hp {
    font-family: 'Outfit', sans-serif;
    color: black;
    --c-gold: #d4a44c;
    --c-gold-bg: rgba(212,164,76,0.10);
    --c-gold-border: rgba(212,164,76,0.22);
    --c-green: #3ec98a;
    --c-green-bg: rgba(62,201,138,0.08);
    --c-green-border: rgba(62,201,138,0.2);
    --c-blue: #5ba8e0;
    --c-blue-bg: rgba(91,168,224,0.08);
    --c-blue-border: rgba(91,168,224,0.2);
    --c-red: #e06060;
    --c-red-bg: rgba(224,96,96,0.08);
    --c-red-border: rgba(224,96,96,0.2);
    --c-amber: #e09644;
    --c-amber-bg: rgba(224,150,68,0.08);
    --c-purple: #a07ae0;
    --c-purple-bg: rgba(160,122,224,0.08);
    --c-purple-border: rgba(160,122,224,0.2);
--bg-page: #f5f6f8;
--bg-section: #ffffff;
--bg-card: #ffffff;
--bg-panel: #ffffff;

--border-soft: #e5e7eb;
--border-mid: #d1d5db;

--t1: #1f2937;
--t2: #6b7280;
--t3: #9ca3af;
  }
  .hp * { box-sizing: border-box; }

.hp-card {
  background: var(--bg-card);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  position: relative;
  overflow: visible;
  z-index: 1;
  transition: border-color .2s, transform .18s;
}

.hp-card:hover {
  border-color: rgba(212,164,76,0.45);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}


  .hp-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(140deg, rgba(255,255,255,0.018) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  .hp-card > * { position: relative; z-index: 1; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hp-fi { animation: fadeUp .4s ease both; }

  @keyframes pulseDot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: .4; transform: scale(1.7); }
  }
  .hp-dot { animation: pulseDot 2s ease infinite; display: inline-block; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .hp-spin { animation: spin .7s linear infinite; }

  .hp-tr { transition: background .1s; }
  .hp-tr:hover { background: rgba(212,164,76,0.035) !important; }

  .hp-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
  .hp-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

  .hp-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 9px; border-radius: 99px;
    font-size: 11px; font-weight: 600;
    font-family: 'Outfit', sans-serif;
  }

  .hp-input {
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 8px; padding: 7px 10px;
    color: #1f2937;
    font-family: 'Outfit', sans-serif; font-size: 13px;
    outline: none; transition: border-color .15s;
  }
  .hp-input:focus { border-color: var(--c-gold); }

  .hp-btn {
    padding: 7px 14px; border-radius: 8px;
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 600;
    cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    transition: all .15s;
  }
  .hp-btn-gold {
    border: 1px solid var(--c-gold-border);
    background: var(--c-gold-bg);
    color: var(--c-gold);
  }
  .hp-btn-gold:hover { background: rgba(212,164,76,0.18); }
  .hp-btn-gold:disabled { opacity: .5; cursor: not-allowed; }

.hp-btn-ghost {
  background: #fff;
  border: 1px solid #d1d5db;
  color: #374151;
}
  .hp-btn-ghost:hover {
  background: #f9fafb;
}
  .hp-btn-ghost:disabled { opacity: .5; cursor: not-allowed; }

  .hp-pill-own       { background: var(--c-green-bg);  color: var(--c-green);  border: 1px solid var(--c-green-border); }
  .hp-pill-franchise { background: var(--c-gold-bg);   color: var(--c-gold);   border: 1px solid var(--c-gold-border); }

  .hp-mono { font-family: 'JetBrains Mono', monospace; }
  transition: "all .2s ease",
.hp-tr:hover div[data-avatar="true"] {
  transform: scale(1.04);
  .react-datepicker {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-family: 'Outfit', sans-serif;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

/* ===== PREMIUM DATEPICKER THEME ===== */

.react-datepicker-popper {
  z-index: 9999 !important;
}

.react-datepicker {
  border: 1px solid #e5e7eb !important;
  border-radius: 16px !important;
  font-family: 'Outfit', sans-serif !important;
  box-shadow: 0 12px 32px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.06) !important;
  background: #ffffff !important;
  overflow: hidden !important;
}

.react-datepicker__triangle {
  display: none !important;
}

.react-datepicker__header {
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%) !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding-top: 16px !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
}

.react-datepicker__current-month {
  font-weight: 700 !important;
  font-size: 15px !important;
  color: #1f2937 !important;
  margin-bottom: 12px !important;
  letter-spacing: -0.2px !important;
}

.react-datepicker__day-names {
  margin-top: 8px !important;
  padding: 0 8px !important;
}

.react-datepicker__day-name {
  color: #6b7280 !important;
  font-weight: 600 !important;
  font-size: 11px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  width: 2.2rem !important;
  line-height: 2rem !important;
}

.react-datepicker__month {
  margin: 12px !important;
  padding: 4px !important;
}

.react-datepicker__week {
  display: flex !important;
  gap: 2px !important;
}

.react-datepicker__day {
  width: 2.2rem !important;
  line-height: 2.2rem !important;
  border-radius: 10px !important;
  transition: all .2s ease !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  color: #374151 !important;
  margin: 2px !important;
}

.react-datepicker__day:hover {
  background: rgba(212,164,76,0.12) !important;
  transform: scale(1.05) !important;
  color: #1f2937 !important;
}

.react-datepicker__day--selected {
  background: linear-gradient(135deg, #d4a44c 0%, #c89840 100%) !important;
  color: white !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(212,164,76,0.3) !important;
  transform: scale(1.05) !important;
}

.react-datepicker__day--selected:hover {
  background: linear-gradient(135deg, #c89840 0%, #b88834 100%) !important;
}

.react-datepicker__day--keyboard-selected {
  background: rgba(212,164,76,0.2) !important;
  color: #1f2937 !important;
}

.react-datepicker__day--today {
  font-weight: 700 !important;
  color: #d4a44c !important;
  position: relative !important;
}

.react-datepicker__day--today::after {
  content: '' !important;
  position: absolute !important;
  bottom: 3px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 4px !important;
  height: 4px !important;
  border-radius: 50% !important;
  background: #d4a44c !important;
}

.react-datepicker__day--disabled {
  color: #d1d5db !important;
  cursor: not-allowed !important;
  opacity: 0.4 !important;
}

.react-datepicker__day--disabled:hover {
  background: transparent !important;
  transform: none !important;
}

.react-datepicker__day--outside-month {
  color: #d1d5db !important;
  opacity: 0.5 !important;
}

.react-datepicker__day--in-range {
  background: rgba(212,164,76,0.1) !important;
  color: #1f2937 !important;
}

.react-datepicker__day--in-selecting-range {
  background: rgba(212,164,76,0.15) !important;
}

.react-datepicker__navigation {
  top: 16px !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  transition: all .2s ease !important;
}

.react-datepicker__navigation:hover {
  background: rgba(212,164,76,0.1) !important;
}

.react-datepicker__navigation--previous {
  left: 12px !important;
}

.react-datepicker__navigation--next {
  right: 12px !important;
}

.react-datepicker__navigation-icon::before {
  border-color: #6b7280 !important;
  border-width: 2px 2px 0 0 !important;
  width: 7px !important;
  height: 7px !important;
  top: 11px !important;
}

.react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
  border-color: #d4a44c !important;
}

/* dropdown selectors with premium styling */
.react-datepicker__month-select,
.react-datepicker__year-select {
  border: 1px solid #e5e7eb !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  font-family: 'Outfit', sans-serif !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  color: #1f2937 !important;
  background: #ffffff !important;
  cursor: pointer !important;
  transition: all .2s ease !important;
  outline: none !important;
}

.react-datepicker__month-select:hover,
.react-datepicker__year-select:hover {
  border-color: #d4a44c !important;
  background: rgba(212,164,76,0.05) !important;
}

.react-datepicker__month-select:focus,
.react-datepicker__year-select:focus {
  border-color: #d4a44c !important;
  box-shadow: 0 0 0 3px rgba(212,164,76,0.1) !important;
}

/* Input field enhancement */
.hp-input[class*="react-datepicker"] {
  font-weight: 500 !important;
  cursor: pointer !important;
}

.hp-input[class*="react-datepicker"]:hover {
  border-color: rgba(212,164,76,0.4) !important;
}

.hp-input[class*="react-datepicker"]:focus {
  border-color: #d4a44c !important;
  box-shadow: 0 0 0 3px rgba(212,164,76,0.1) !important;
}


}


  /* Responsive Grids */
  .hp-grid-main { display: grid; grid-template-columns: 3fr 2fr; gap: 14px; }
  .hp-grid-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .hp-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .hp-grid-1-2 { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; }
  .hp-grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
  
  @media (max-width: 768px) {
    .hp-grid-main, 
    .hp-grid-3col, 
    .hp-grid-1-2 { 
      grid-template-columns: 1fr !important; 
    }
    
    .hp-grid-auto {
      grid-template-columns: 1fr !important;
    }

    .hp-header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    
    .hp-header-controls {
      width: 100%;
      flex-wrap: wrap;
    }
    
    .hp-header-controls .hp-input {
      flex: 1;
    }
    
    .hp-card {
      padding: 16px !important;
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, d = 0) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: d });

const fmtC = (n) => {
  const v = Number(n || 0);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
};

const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return String(d);
  }
};

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to = 0, dur = 800 }) {
  const [v, setV] = useState(0);
  const r = useRef(null);
  useEffect(() => {
    const s = performance.now();
    const tick = (now) => {
      const p = Math.min((now - s) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(eased * to));
      if (p < 1) r.current = requestAnimationFrame(tick);
    };
    r.current = requestAnimationFrame(tick);
    return () => {
      if (r.current) cancelAnimationFrame(r.current);
    };
  }, [to, dur]);
  return <span>{v.toLocaleString("en-IN")}</span>;
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SH({ title, sub, right, Icon, ac = "var(--c-gold)" }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: `${ac}18`,
              border: `1px solid ${ac}28`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: ac,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <Icon />
          </div>
        )}
        <div>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--t1)",
            }}
          >
            {title}
          </h3>
          {sub && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: "var(--t3)",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>
      {right || null}
    </div>
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────
function MetricCard({ Icon, label, rawVal, prefix = "", sub, ac, delay = 0, onClick, cursor = "default" }) {
  return (
    <div
      className="hp-card hp-fi"
      onClick={onClick}
      style={{
        padding: "20px 18px",
        animationDelay: `${delay}ms`,
        cursor: cursor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 20px ${ac}22, 0 8px 28px rgba(0,0,0,0.35)`;
        e.currentTarget.style.borderColor = `${ac}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.borderColor = "";
      }}
    >
      {/* top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${ac}66, transparent)`,
          zIndex: 2,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: `${ac}14`,
            border: `1px solid ${ac}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: ac,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          <Icon />
        </div>
        <span
          style={{
            fontSize: 10,
            color: "var(--t3)",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            fontWeight: 600,
            marginTop: 3,
          }}
        >
          {label}
        </span>
      </div>
      <div
        className="hp-mono"
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "var(--t1)",
          lineHeight: 1,
          marginBottom: 7,
        }}
      >
        {prefix}
        <Counter to={rawVal} />
      </div>
      {sub && (
        <div
          style={{
            fontSize: 11,
            color: `${ac}cc`,
            fontFamily: "'Outfit',sans-serif",
            lineHeight: 1.3,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Sales trend chart ────────────────────────────────────────────────────────
function TrendChart({ data }) {
  if (!data?.length)
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "var(--t3)",
        }}
      >
        <FaChartLine style={{ fontSize: 28, opacity: 0.22 }} />
        <span style={{ fontSize: 13 }}>No sales data for this period</span>
      </div>
    );

  const rows = data.map((d) => ({
    date: fmtDate(d.date),
    sales: Number(d.sales || 0),
  }));

  const TooltipBox = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          borderRadius: 10,
          padding: "10px 14px",
        }}
      >
        <div style={{ color: "var(--t2)", fontSize: 11, marginBottom: 3 }}>
          {label}
        </div>
        <div
          className="hp-mono"
          style={{ color: "var(--c-gold)", fontWeight: 600, fontSize: 16 }}
        >
          ₹{fmt(payload[0].value)}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={rows}
        margin={{ top: 6, right: 6, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="hpTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a44c" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#d4a44c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          tick={{
            fill: "#5a5550",
            fontSize: 11,
            fontFamily: "'Outfit',sans-serif",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{
            fill: "#5a5550",
            fontSize: 11,
            fontFamily: "'Outfit',sans-serif",
          }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => fmtC(v)}
        />
        <Tooltip content={<TooltipBox />} />
        <Area
          type="monotone"
          dataKey="sales"
          stroke="#d4a44c"
          strokeWidth={2}
          fill="url(#hpTrendGrad)"
          dot={{ fill: "#d4a44c", r: 4, strokeWidth: 0 }}
          activeDot={{ r: 7, fill: "#d4a44c", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Top stores ───────────────────────────────────────────────────────────────
function TopStores({ stores }) {
  const active = (stores || []).filter((s) => s.totalSales > 0);
  if (!active.length)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "28px 0",
          color: "var(--t3)",
        }}
      >
        <FaTrophy style={{ fontSize: 26, opacity: 0.2 }} />
        <span style={{ fontSize: 13 }}>No sales yet this period</span>
      </div>
    );

  const max = Math.max(...stores.map((s) => s.totalSales), 1);
  const medals = ["🥇", "🥈", "🥉", "4th", "5th"];
  const colors = ["#d4a44c", "#9a958e", "#c07840", "#5ba8e0", "#3ec98a"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {stores.slice(0, 5).map((s, i) => (
        <div key={s.storeId}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                style={{
                  fontSize: i < 3 ? 16 : 11,
                  minWidth: 22,
                  textAlign: "center",
                  color: i >= 3 ? "var(--t3)" : undefined,
                  fontWeight: 700,
                }}
              >
                {medals[i]}
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: s.totalSales > 0 ? "#1f2937" : "var(--t2)",
                  }}
                >
                  {s.storeName?.trim()}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--t3)" }}>
                  {s.storeCode} · {fmt(s.totalOrders)} orders
                </div>
              </div>
            </div>
            <div
              className="hp-mono"
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: colors[i] || "#5ba8e0",
              }}
            >
              {fmtC(s.totalSales)}
            </div>
          </div>
          <div
            style={{
              height: 3,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(s.totalSales / max) * 100}%`,
                background: colors[i] || "#5ba8e0",
                borderRadius: 99,
                transition: "width .7s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Order status ─────────────────────────────────────────────────────────────
function OrderStatus({ statuses, onNav }) {
  const items = [
    {
      key: "confirmed",
      label: "Confirmed",
      v: statuses?.confirmed || 0,
      Icon: FaCheckCircle,
      c: "#5ba8e0",
      cbg: "rgba(91,168,224,0.08)",
      cb: "rgba(91,168,224,0.2)",
    },
    {
      key: "dispatched",
      label: "Dispatched",
      v: statuses?.dispatched || 0,
      Icon: FaTruck,
      c: "#e09644",
      cbg: "rgba(224,150,68,0.08)",
      cb: "rgba(224,150,68,0.2)",
    },
    {
      key: "delivered",
      label: "Delivered",
      v: statuses?.delivered || 0,
      Icon: FaCheckCircle,
      c: "#3ec98a",
      cbg: "rgba(62,201,138,0.08)",
      cb: "rgba(62,201,138,0.2)",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      v: statuses?.cancelled || 0,
      Icon: FaUndoAlt,
      c: "#e06060",
      cbg: "rgba(224,96,96,0.08)",
      cb: "rgba(224,96,96,0.2)",
    },
    {
      key: "pendingPaymentApprovals",
      label: "Pmt. Pending",
      v: statuses?.pendingPaymentApprovals || 0,
      Icon: FaClock,
      c: "#a07ae0",
      cbg: "rgba(160,122,224,0.08)",
      cb: "rgba(160,122,224,0.2)",
    },
  ];
  return (
    <div className="hp-grid-2col">
      {items.map(({ key, label, v, Icon, c, cbg, cb }) => (
        <div
          key={key}
          onClick={() => onNav(key)}
          style={{
            background: cbg,
            border: `1px solid ${cb}`,
            borderRadius: 12,
            padding: "13px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.borderColor = c + "44";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.borderColor = cb;
          }}
        >
          <Icon style={{ color: c, fontSize: 14, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div
              className="hp-mono"
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: "var(--t1)",
                lineHeight: 1,
              }}
            >
              {fmt(v)}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--t2)", marginTop: 3 }}>
              {label}
            </div>
          </div>
          <FaChevronRight style={{ color: c, fontSize: 9, opacity: 0.4 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Customer panel ───────────────────────────────────────────────────────────
function CustomerPanel({ customers }) {
  const total = customers?.total || 0;
  const segs = [
    { label: "Active", v: customers?.active || 0, col: "#3ec98a" },
    { label: "KYC Pending", v: customers?.kycPending || 0, col: "#e09644" },
    { label: "Inactive", v: customers?.inactive || 0, col: "#5a5550" },
    { label: "Rejected", v: customers?.rejected || 0, col: "#e06060" },
  ];
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span
          className="hp-mono"
          style={{
            fontWeight: 600,
            fontSize: 38,
            color: "var(--t1)",
            lineHeight: 1,
          }}
        >
          {fmt(total)}
        </span>
        <span style={{ fontSize: 12, color: "var(--t2)" }}>total</span>
      </div>
      {total > 0 && (
        <div
          style={{
            height: 5,
            borderRadius: 99,
            overflow: "hidden",
            display: "flex",
            marginBottom: 14,
          }}
        >
          {segs.map(
            (s) =>
              s.v > 0 && (
                <div
                  key={s.label}
                  style={{
                    width: `${(s.v / total) * 100}%`,
                    background: s.col,
                    transition: "width .5s ease",
                  }}
                />
              ),
          )}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {segs.map(({ label, v, col }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: col,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12.5, color: "var(--t2)" }}>
                {label}
              </span>
            </div>
            <span
              className="hp-mono"
              style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)" }}
            >
              {fmt(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top products ─────────────────────────────────────────────────────────────
function TopProducts({ products }) {
  if (!products?.length)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "20px 0",
          color: "var(--t3)",
          fontSize: 13,
        }}
      >
        No product data
      </div>
    );
  const max = Math.max(...products.map((p) => p.sales), 1);
  const hues = [38, 200, 145, 280, 20];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {products.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `hsl(${hues[i]},45%,18%)`,
              border: `1px solid hsl(${hues[i]},45%,30%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FaBox style={{ color: `hsl(${hues[i]},65%,58%)`, fontSize: 12 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 12.5,
                  color: "var(--t1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.name}
              </span>
              <span
                className="hp-mono"
                style={{
                  fontWeight: 600,
                  fontSize: 11.5,
                  color: `hsl(${hues[i]},65%,60%)`,
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                {fmt(p.sales)}
              </span>
            </div>
            <div
              style={{
                height: 3,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(p.sales / max) * 100}%`,
                  background: `hsl(${hues[i]},55%,50%)`,
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Cash flow summary ────────────────────────────────────────────────────────
function CashFlow({ cards }) {
  const rows = [
    {
      label: "Cash Sales",
      v: cards?.cashSales || 0,
      Icon: FaMoneyBillWave,
      c: "#d4a44c",
      note: "Cash received",
    },
    {
      label: "Bank Sales",
      v: cards?.bankSales || 0,
      Icon: FaUniversity,
      c: "#5ba8e0",
      note: "Digital payments",
    },
    {
      label: "Deposited",
      v: cards?.cashDeposited || 0,
      Icon: FaWallet,
      c: "#3ec98a",
      note: "Cash to bank",
    },
    {
      label: "Balance",
      v: cards?.availableCashBalance || 0,
      Icon: FaCoins,
      c: (cards?.availableCashBalance || 0) >= 0 ? "#3ec98a" : "#e06060",
      note: "Undeposited",
      hl: true,
    },
    {
      label: "Bank Receipts",
      v: cards?.bankReceipts || 0,
      Icon: FaReceipt,
      c: "#a07ae0",
      note: "Confirmed",
    },
    {
      label: "Expenses",
      v: cards?.totalExpenses || 0,
      Icon: FaExchangeAlt,
      c: "#e06060",
      note: "Expenditure",
    },
  ];
  return (
    <div className="hp-grid-3col">
      {rows.map(({ label, v, Icon, c, note, hl }) => (
        <div
          key={label}
          style={{
            background: hl ? `${c}0c` : "rgba(255,255,255,0.02)",
            borderRadius: 12,
            padding: "14px 15px",
            border: `1px solid ${c}1e`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -12,
              right: -12,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `${c}08`,
              pointerEvents: "none",
            }}
          />
          <Icon style={{ color: c, fontSize: 15, marginBottom: 9 }} />
          <div
            className="hp-mono"
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "var(--t1)",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {fmtC(v)}
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 11.5,
              color: "var(--t1)",
              marginBottom: 2,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 10, color: "var(--t3)" }}>{note}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Low stock ────────────────────────────────────────────────────────────────
function LowStock({ alerts }) {
  if (!alerts?.length)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "26px 0",
          color: "var(--t3)",
        }}
      >
        <FaCheckCircle
          style={{ fontSize: 28, color: "#3ec98a", opacity: 0.6 }}
        />
        <span style={{ fontSize: 13, color: "#3ec98a", fontWeight: 600 }}>
          All stock healthy
        </span>
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {alerts.slice(0, 8).map((a, i) => {
        const pct = Math.min((a.stock / Math.max(a.threshold, 1)) * 100, 100);
        const crit = pct < 30;
        return (
          <div
            key={i}
            style={{
              background: crit ? "var(--c-red-bg)" : "var(--c-amber-bg)",
              borderRadius: 10,
              padding: "10px 13px",
              border: `1px solid ${crit ? "rgba(224,96,96,.18)" : "rgba(224,150,68,.18)"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 12.5,
                  color: crit ? "#e06060" : "#e09644",
                }}
              >
                {a.product}
              </span>
              <span
                className="hp-mono"
                style={{ fontWeight: 600, fontSize: 11, color: "var(--t2)" }}
              >
                {a.stock}/{a.threshold}
              </span>
            </div>
            <div
              style={{
                height: 3,
                background: "rgba(255,255,255,0.07)",
                borderRadius: 99,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: crit ? "#e06060" : "#e09644",
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Store breakdown table ────────────────────────────────────────────────────
function StoreTable({ stores }) {
  const [q, setQ] = useState("");
  const [sk, setSk] = useState("totalSales");
  const [sd, setSd] = useState("desc");
  const [activeOnly, setAO] = useState(false);

  const toggle = (k) => {
    if (sk === k) setSd((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSk(k);
      setSd("desc");
    }
  };

  const rows = (stores || [])
    .filter((s) => !activeOnly || s.totalSales > 0)
    .filter(
      (s) =>
        !q ||
        s.storeName?.toLowerCase().includes(q.toLowerCase()) ||
        s.storeCode?.toLowerCase().includes(q.toLowerCase()),
    )
    .sort((a, b) => {
      const av = a[sk] ?? 0,
        bv = b[sk] ?? 0;
      return sd === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

  const SortIndicator = ({ col }) => (
    <span style={{ marginLeft: 3, opacity: sk === col ? 1 : 0.2, fontSize: 9 }}>
      {sk === col && sd === "asc" ? "▲" : "▼"}
    </span>
  );

  const cols = [
    { k: "_idx", label: "", sort: false, w: 36 },
    { k: "storeName", label: "Store", sort: true },
    { k: "storeType", label: "Type", sort: false, w: 90 },
    { k: "totalSales", label: "Total Sales", sort: true },
    { k: "cashSales", label: "Cash", sort: true },
    { k: "bankSales", label: "Bank", sort: true },
    { k: "totalOrders", label: "Orders", sort: true, center: true },
    { k: "cashDeposited", label: "Deposited", sort: true },
    { k: "availableCashBalance", label: "Balance", sort: true },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search store name or code…"
          className="hp-input"
          style={{ flex: 1, minWidth: 160 }}
        />
        <button
          className="hp-btn"
          onClick={() => setAO((x) => !x)}
          style={{
            border: `1px solid ${activeOnly ? "var(--c-gold-border)" : "var(--border-mid)"}`,
            background: activeOnly ? "var(--c-gold-bg)" : "var(--bg-panel)",
            color: activeOnly ? "var(--c-gold)" : "var(--t2)",
          }}
        >
          {activeOnly ? "Active Only ✓" : "Active Only"}
        </button>
        <span style={{ fontSize: 11.5, color: "var(--t3)" }}>
          {rows.length} stores
        </span>
      </div>

      <div
        className="hp-scroll"
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "550px",
          borderRadius: 12,
          border: "1px solid var(--border-soft)",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-mid)" }}>
              {cols.map((c) => (
                <th
                  key={c.k}
                  onClick={() => c.sort && toggle(c.k)}
                  style={{
                    padding: "10px 13px",
                    color: "var(--t3)",
                    fontWeight: 600,
                    textAlign: c.center ? "center" : "left",
                    whiteSpace: "nowrap",
                    cursor: c.sort ? "pointer" : "default",
                    userSelect: "none",
                    width: c.w,
                    background: "#f9fafb",
                    position: "sticky",
                    top: 0,
                    left: c.k === "_idx" ? 0 : c.k === "storeName" ? 36 : undefined,
                    zIndex: (c.k === "_idx" || c.k === "storeName") ? 11 : 10,
                  }}
                >
                  {c.label}
                  {c.sort && <SortIndicator col={c.k} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => {
              const isActive = s.totalSales > 0 || s.cashDeposited > 0;
              return (
                <tr
                  key={s.storeId}
                  className="hp-tr"
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td
                    style={{
                      padding: "10px 13px",
                      textAlign: "center",
                      position: "sticky",
                      left: 0,
                      background: "white",
                      zIndex: 9,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--t2)",
                          fontSize: 11,
                          fontWeight: 600,
                          minWidth: 12,
                        }}
                      >
                        {i + 1}
                      </span>

                      {isActive && (
                        <span
                          style={{
                            display: "inline-block",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#3ec98a",
                            opacity: 0.8,
                          }}
                        />
                      )}
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "10px 13px",
                      position: "sticky",
                      left: 36,
                      background: "white",
                      zIndex: 9,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 9 }}
                    >
                      <div
                        data-avatar="true"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `hsl(${(s.storeId * 53 + 100) % 360}, 70%, 94%)`,
                          border: `1px solid hsl(${(s.storeId * 53 + 100) % 360}, 45%, 82%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          color: `hsl(${(s.storeId * 53 + 100) % 360}, 45%, 35%)`,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {(s.storeName?.trim() || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "var(--t1)" : "var(--t2)",
                            maxWidth: 180,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.storeName?.trim()}
                        </div>
                        <div
                          className="hp-mono"
                          style={{ fontSize: 10, color: "var(--t3)" }}
                        >
                          {s.storeCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span className={`hp-badge hp-pill-${s.storeType}`}>
                      {s.storeType}
                    </span>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      className="hp-mono"
                      style={{
                        fontWeight: s.totalSales > 0 ? 700 : 400,
                        color: s.totalSales > 0 ? "#3ec98a" : "var(--t3)",
                      }}
                    >
                      {s.totalSales > 0 ? `₹${fmt(s.totalSales)}` : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      className="hp-mono"
                      style={{
                        color: s.cashSales > 0 ? "#d4a44c" : "var(--t3)",
                      }}
                    >
                      {s.cashSales > 0 ? `₹${fmt(s.cashSales)}` : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      className="hp-mono"
                      style={{
                        color: s.bankSales > 0 ? "#5ba8e0" : "var(--t3)",
                      }}
                    >
                      {s.bankSales > 0 ? `₹${fmt(s.bankSales)}` : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 13px", textAlign: "center" }}>
                    <span
                      className="hp-mono"
                      style={{
                        fontWeight: s.totalOrders > 0 ? 700 : 400,
                        color: s.totalOrders > 0 ? "#e09644" : "var(--t3)",
                      }}
                    >
                      {s.totalOrders > 0 ? s.totalOrders : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      className="hp-mono"
                      style={{
                        color: s.cashDeposited > 0 ? "var(--t2)" : "var(--t3)",
                      }}
                    >
                      {s.cashDeposited > 0 ? `₹${fmt(s.cashDeposited)}` : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    {s.availableCashBalance !== 0 ? (
                      <span
                        className="hp-badge"
                        style={{
                          background:
                            s.availableCashBalance > 0
                              ? "rgba(62,201,138,0.1)"
                              : "rgba(224,96,96,0.1)",
                          color:
                            s.availableCashBalance > 0 ? "#3ec98a" : "#e06060",
                          border: `1px solid ${s.availableCashBalance > 0 ? "rgba(62,201,138,0.22)" : "rgba(224,96,96,0.22)"}`,
                        }}
                      >
                        {s.availableCashBalance > 0 ? (
                          <FaArrowUp style={{ fontSize: 7 }} />
                        ) : (
                          <FaArrowDown style={{ fontSize: 7 }} />
                        )}
                        ₹{fmt(Math.abs(s.availableCashBalance))}
                      </span>
                    ) : (
                      <span style={{ color: "var(--t3)" }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const hour = new Date().getHours();
  const wish =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const { selectedDivision, showAllDivisions } = useDivision();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [df, setDf] = useState({
    from: null,
    to: null,
  });

  const [data, setData] = useState(null);

  const fetchData = useCallback(
    async (from = "", to = "") => {
      const id = selectedDivision?.id;
      if (!id) return;
      try {
        setLoading(true);
        const p = new URLSearchParams();
        if (showAllDivisions || id === "all") p.set("showAllDivisions", "true");
        else p.set("divisionId", String(id));
        if (from) p.set("fromDate", from.toISOString().split("T")[0]);

        if (to) p.set("toDate", to.toISOString().split("T")[0]);

        const res = await axiosAPI.get(`/dashboard/home?${p}`);
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard.");
        setModalOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [selectedDivision, showAllDivisions, axiosAPI],
  );

  useEffect(() => {
    fetchData(df.from, df.to);
  }, [selectedDivision?.id, showAllDivisions]); // eslint-disable-line

  const applyDates = (from, to) => {
    setDf({ from, to });
    fetchData(from, to);
  };

  const onNav = (status) => {
    const m = {
      confirmed: "Confirmed",
      dispatched: "Dispatched",
      delivered: "Delivered",
      cancelled: "Cancelled",
      pendingPaymentApprovals: "pendingPaymentApprovals",
    };
    navigate(`/sales/orders?status=${m[status] || status}`);
  };

  // ── Data extraction — exact API field mapping ─────────────────────────────
  const sd = data?.storeDashboard;
  const hi = data?.homeInteractive;
  const cards = sd?.cards || hi?.cards || {};
  const salesTrend = sd?.salesTrend || hi?.trend || [];
  const topStores =
    sd?.topStoresBySales || hi?.topStores || data?.topPerformingBOs || [];
  const storeBreakdown = sd?.storeBreakdown || hi?.storeBreakdown || [];
  const availableStores = sd?.availableStores || hi?.availableStores || [];
  const selectedIds = sd?.selectedStoreIds || hi?.selectedStoreIds || [];
  const filters = sd?.filters || hi?.filters || {};
  const customers = data?.customers || {};
  const orderStatuses = data?.orderStatuses || {};
  const topProducts = data?.topSellingProducts || [];
  const lowStockAlerts = data?.lowStockAlerts || [];
  const totalProducts = data?.totalProducts || 0;
  const hasData = !!data;

  const metricCards = [
    {
      Icon: FaStore,
      label: "Total Stores",
      rawVal: cards.totalStores || 0,
      prefix: "",
      sub: `${selectedIds.length} selected · ${availableStores.length} accessible`,
      ac: "#d4a44c",
      delay: 0,
      path: "/stores-abstract",
    },
    {
      Icon: FaChartLine,
      label: "Total Sales",
      rawVal: cards.totalSales || 0,
      prefix: "₹",
      sub: `${fmt(cards.totalOrders || 0)} orders`,
      ac: "#3ec98a",
      delay: 55,
      path: "/inventory/stock-summary",
    },
    {
      Icon: FaSun,
      label: "Today's Sales",
      rawVal: cards.todaySales || 0,
      prefix: "₹",
      sub: data?.todayContext?.from || "Today",
      ac: "#e09644",
      delay: 110,
      path: "/inventory/current-stock",
    },
    {
      Icon: FaMoneyBillWave,
      label: "Cash Sales",
      rawVal: cards.cashSales || 0,
      prefix: "₹",
      sub: "Cash payment mode",
      ac: "#d4a44c",
      delay: 165,
    },
    {
      Icon: FaUniversity,
      label: "Bank Sales",
      rawVal: cards.bankSales || 0,
      prefix: "₹",
      sub: "Digital/bank mode",
      ac: "#5ba8e0",
      delay: 220,
    },
    {
      Icon: FaWallet,
      label: "Cash Deposited",
      rawVal: cards.cashDeposited || 0,
      prefix: "₹",
      sub: `Balance ₹${fmt(cards.availableCashBalance || 0)}`,
      ac: "#3ec98a",
      delay: 275,
    },
    {
      Icon: FaReceipt,
      label: "Bank Receipts",
      rawVal: cards.bankReceipts || 0,
      prefix: "₹",
      sub: "Confirmed bank deposits",
      ac: "#5ba8e0",
      delay: 330,
    },
    {
      Icon: FaUndoAlt,
      label: "Returns",
      rawVal: cards.returnAmount || 0,
      prefix: "₹",
      sub: `Expenses ₹${fmt(cards.totalExpenses || 0)}`,
      ac: "#e06060",
      delay: 385,
      path: "/returns",
    },
  ];

  return (
    <div
      className="hp"
      style={{
        width: "100%",
        background: "var(--bg-page)",
        padding: "16px 18px 24px",
        minHeight: "100vh",
      }}
    >
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div
        className="hp-fi hp-header-content"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 32,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 5,
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                color: "var(--t3)",
                textTransform: "uppercase",
                letterSpacing: "1.1px",
                fontWeight: 600,
              }}
            ></span>
          </div>
          <h1
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 22,

              color: "var(--t1)",
              letterSpacing: "-.3px",
              lineHeight: 1.1,
            }}
          >
            {wish}, {user?.name || "User"} 👋
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12.5,
              color: "var(--t2)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {filters.fromDate && (
              <span
                className="hp-badge"
                style={{
                  background: "var(--c-gold-bg)",
                  color: "var(--c-gold)",
                  border: "1px solid var(--c-gold-border)",
                }}
              >
                {new Date(filters.fromDate).toLocaleDateString("en-IN")} →
                {new Date(filters.toDate).toLocaleDateString("en-IN")}
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div
          className="hp-header-controls"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FaCalendarAlt
            style={{ color: "var(--t3)", fontSize: 13, flexShrink: 0 }}
          />
          <DatePicker
            selected={df.from}
            onChange={(date) => setDf((x) => ({ ...x, from: date }))}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            className="hp-input"
            popperPlacement="bottom-start"
            portalId="root"
            /* 🔥 QUICK YEAR NAVIGATION */
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            /* Optional but VERY useful */
            yearDropdownItemNumber={15}
            scrollableYearDropdown
            peekNextMonth
            showPopperArrow={false}
          />

          <span style={{ color: "var(--t3)", fontSize: 11 }}>→</span>

          <DatePicker
            selected={df.to}
            onChange={(date) => setDf((x) => ({ ...x, to: date }))}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            className="hp-input"
            popperPlacement="bottom-start"
            portalId="root"
            maxDate={new Date()}
            /* 🔥 QUICK YEAR NAVIGATION */
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            /* Optional but VERY useful */
            yearDropdownItemNumber={15}
            scrollableYearDropdown
          />

          <button
            className="hp-btn hp-btn-gold"
            onClick={() => applyDates(df.from, df.to)}
            disabled={loading}
          >
            <FaFilter style={{ fontSize: 10 }} />
            Apply
          </button>
          <button
            className="hp-btn hp-btn-ghost"
            onClick={() => fetchData(df.from, df.to)}
            disabled={loading}
          >
            <FaSyncAlt
              className={loading ? "hp-spin" : ""}
              style={{ fontSize: 11 }}
            />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── No division selected ── */}
      {!selectedDivision?.id && (
        <div
          style={{
            background: "var(--c-blue-bg)",
            border: "1px solid var(--c-blue-border)",
            borderRadius: 13,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <FaExclamationCircle
            style={{ color: "#5ba8e0", fontSize: 18, flexShrink: 0 }}
          />
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "#5ba8e0",
                marginBottom: 2,
                fontSize: 13,
              }}
            >
              Select a Division
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              Please select a division from the top navigation to load dashboard
              data.
            </div>
          </div>
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && <HomePageSkeleton />}

      {/* ── Main dashboard ── */}
      {!loading && hasData && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 8 metric cards */}
          <div className="hp-grid-auto">
            {metricCards.map((m) => (
              <MetricCard 
                key={m.label} 
                {...m} 
                onClick={() => m.path && navigate(m.path)}
                cursor={m.path ? "pointer" : "default"}
              />
            ))}
          </div>

          {/* Trend + Top Stores */}
          <div className="hp-grid-main">
            <div className="hp-card" style={{ padding: 20 }}>
              <SH
                title="Sales Trend"
                sub={`Daily · ${
                  filters.fromDate
                    ? new Date(filters.fromDate).toLocaleDateString("en-IN")
                    : "This Month"
                } – ${
                  filters.toDate
                    ? new Date(filters.toDate).toLocaleDateString("en-IN")
                    : "Today"
                }`}
                Icon={FaChartLine}
              />
              <TrendChart data={salesTrend} />
            </div>
            <div className="hp-card" style={{ padding: 20 }}>
              <SH
                title="Top Stores"
                sub="By total sales this period"
                Icon={FaTrophy}
                ac="#d4a44c"
              />
              <TopStores stores={topStores} />
            </div>
          </div>

          {/* Orders + Customers + Low Stock */}
          <div className="hp-grid-auto">
            <div className="hp-card" style={{ padding: 20 }}>
              <SH
                title="Order Status"
                sub="Click to navigate"
                Icon={FaShoppingCart}
                ac="#5ba8e0"
              />
              <OrderStatus statuses={orderStatuses} onNav={onNav} />
            </div>
            <div className="hp-card" style={{ padding: 20 }}>
              <SH
                title="Customers"
                sub={`${totalProducts} products available`}
                Icon={FaUsers}
                ac="#3ec98a"
              />
              <CustomerPanel customers={customers} />
            </div>
            <div className="hp-card" style={{ padding: 20 }}>
              <SH
                title="Low Stock"
                sub={
                  lowStockAlerts.length
                    ? `${lowStockAlerts.length} below threshold`
                    : "All healthy"
                }
                Icon={FaBox}
                ac={lowStockAlerts.length ? "#e06060" : "#3ec98a"}
              />
              <LowStock alerts={lowStockAlerts} />
            </div>
          </div>

          {/* Top Products + Cash Flow */}
          <div className="hp-grid-1-2">
            <div className="hp-card" style={{ padding: 20 }}>
              <SH
                title="Top Products"
                sub="By units sold"
                Icon={FaTag}
                ac="#e09644"
              />
              <TopProducts products={topProducts} />
            </div>
            <div className="hp-card" style={{ padding: 20 }}>
              <SH
                title="Cash Flow"
                sub="All selected stores combined"
                Icon={FaCashRegister}
                ac="#d4a44c"
              />
              <CashFlow cards={cards} />
            </div>
          </div>

          {/* Store breakdown table */}
          <div className="hp-card" style={{ padding: 20 }}>
            <SH
              title="Store-Level Breakdown"
              sub={`${storeBreakdown.length} stores · ${
                filters.fromDate
                  ? new Date(filters.fromDate).toLocaleDateString("en-IN")
                  : ""
              } to ${
                filters.toDate
                  ? new Date(filters.toDate).toLocaleDateString("en-IN")
                  : "Today"
              }`}
              Icon={FaStore}
              right={
                <div style={{ display: "flex", gap: 6 }}>
                  <span
                    className="hp-badge"
                    style={{
                      background: "var(--c-green-bg)",
                      color: "var(--c-green)",
                      border: "1px solid var(--c-green-border)",
                    }}
                  >
                    {storeBreakdown.filter((s) => s.totalSales > 0).length}{" "}
                    active
                  </span>
                  <span
                    className="hp-badge"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--t2)",
                      border: "1px solid var(--border-soft)",
                    }}
                  >
                    {storeBreakdown.length} total
                  </span>
                </div>
              }
            />
            <StoreTable stores={storeBreakdown} />
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && selectedDivision?.id && !hasData && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "70px 0",
            gap: 14,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--c-gold-bg)",
              border: "1px solid var(--c-gold-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaChartLine
              style={{ fontSize: 24, color: "var(--c-gold)", opacity: 0.5 }}
            />
          </div>
          <h3
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: 17,
              color: "var(--t1)",
            }}
          >
            No Data Found
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--t2)",
              maxWidth: 340,
              lineHeight: 1.6,
            }}
          >
            No orders or sales in this period. Adjust the date range or select a
            different division.
          </p>
          <button className="hp-btn hp-btn-gold" onClick={() => fetchData()}>
            Retry
          </button>
        </div>
      )}

      {modalOpen && (
        <ErrorModal
          isOpen={modalOpen}
          message={error}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
