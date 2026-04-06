import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/Auth";
import { useDivision } from "@/components/context/DivisionContext";
import ErrorModal from "@/components/ErrorModal";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import xls from "../../../images/xls-logo.jpg";
import pdf from "../../../images/pdf.jpg.jpg";
import {
  Package,
  PackageOpen,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Warehouse,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  LayoutGrid,
  Filter,
  Eye,
  Info,
  Calendar,
  Store,
  Layers,
  DollarSign,
  ShoppingBag,
  Tag,
  BarChart3,
  MoveRight,
  MoveLeft,
  Clock,
  MapPin,
  FileText,
  CheckSquare,
  Square,
  Activity,
  Boxes,
  CircleDot,
  Shuffle,
  FileDown,
  AlertCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

  .cs-page * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
  .cs-page {
    background: #f0f4fa;
    min-height: 100vh;
    padding: 0 0 48px;
  }

  /* ── Custom Loading Overlay ── */
  .cs-loader-overlay {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(240,244,250,0.92);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: loaderFadeIn 0.25s ease;
  }
  @keyframes loaderFadeIn { from { opacity:0 } to { opacity:1 } }

  .cs-loader-card {
    background: #fff;
    border-radius: 24px;
    padding: 40px 48px;
    display: flex; flex-direction: column; align-items: center; gap: 24px;
    box-shadow: 0 8px 48px rgba(0,49,118,0.16), 0 2px 8px rgba(0,49,118,0.08);
    border: 1px solid rgba(0,49,118,0.08);
    min-width: 300px;
    animation: loaderCardIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes loaderCardIn {
    from { opacity:0; transform:scale(0.9) translateY(16px) }
    to   { opacity:1; transform:scale(1) translateY(0) }
  }

  /* Inventory shelf animation */
  .cs-loader-shelf {
    position: relative;
    width: 80px; height: 80px;
  }
  .cs-shelf-svg { width: 80px; height: 80px; }

  /* Floating boxes animation */
  .cs-loader-boxes {
    display: flex; gap: 10px; align-items: flex-end;
  }
  .cs-lbox {
    width: 14px; border-radius: 3px;
    background: linear-gradient(135deg, #003176, #0055cc);
    animation: boxPulse 1.4s ease-in-out infinite;
    box-shadow: 0 2px 6px rgba(0,49,118,0.3);
  }
  .cs-lbox:nth-child(1) { height: 28px; animation-delay: 0s; }
  .cs-lbox:nth-child(2) { height: 42px; animation-delay: 0.15s; background: linear-gradient(135deg, #22a634, #1d8f2c); box-shadow: 0 2px 6px rgba(34,166,52,0.3); }
  .cs-lbox:nth-child(3) { height: 20px; animation-delay: 0.3s; }
  .cs-lbox:nth-child(4) { height: 36px; animation-delay: 0.45s; background: linear-gradient(135deg, #0066cc, #004299); }
  .cs-lbox:nth-child(5) { height: 48px; animation-delay: 0.6s; background: linear-gradient(135deg, #22a634, #1d8f2c); box-shadow: 0 2px 6px rgba(34,166,52,0.3); }
  .cs-lbox:nth-child(6) { height: 24px; animation-delay: 0.75s; }
  @keyframes boxPulse {
    0%, 100% { transform: scaleY(1); opacity: 0.7; }
    50%       { transform: scaleY(1.2); opacity: 1; }
  }

  /* Scanning line */
  .cs-loader-scan-wrap {
    position: relative; width: 160px; height: 4px;
    background: #edf0f7; border-radius: 99px; overflow: hidden;
  }
  .cs-loader-scan {
    position: absolute; top: 0; left: 0; height: 100%; width: 40%;
    background: linear-gradient(to right, transparent, #003176, #22a634, transparent);
    border-radius: 99px;
    animation: scanMove 1.6s ease-in-out infinite;
  }
  @keyframes scanMove {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }

  .cs-loader-text {
    font-size: 14px; font-weight: 600; color: #1a2236; text-align: center;
  }
  .cs-loader-sub {
    font-size: 12px; color: #7a88a8; margin-top: -16px; text-align: center;
  }
  .cs-loader-dots span {
    display: inline-block;
    animation: dotBounce 1.4s ease-in-out infinite;
    color: #003176;
  }
  .cs-loader-dots span:nth-child(2) { animation-delay: 0.2s; }
  .cs-loader-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotBounce { 0%, 80%, 100% { opacity:0.2 } 40% { opacity:1 } }

  /* ── Breadcrumb ── */
  .cs-breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: #7a88a8; padding: 16px 28px 0;
  }
  .cs-breadcrumb-link {
    cursor: pointer; transition: color 0.15s;
    display: flex; align-items: center; gap: 4px;
  }
  .cs-breadcrumb-link:hover { color: #003176; }
  .cs-breadcrumb .sep { color: #c0c8dc; }
  .cs-breadcrumb .active { color: #003176; font-weight: 600; }

  /* ── Page Header ── */
  .cs-page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 16px 28px 0; flex-wrap: wrap; gap: 14px;
  }
  .cs-page-title h1 {
    font-size: 24px; font-weight: 700; color: #0d1a36; margin: 0;
    letter-spacing: -0.025em; line-height: 1.2;
  }
  .cs-page-title p { font-size: 13px; color: #7a88a8; margin: 4px 0 0; }
  .cs-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  /* ── Export Buttons ── */
  .cs-export-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 9px;
    font-size: 12.5px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.15s; border: 1.5px solid;
  }
  .cs-export-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .cs-export-btn img { width: 16px; height: 16px; object-fit: contain; border-radius: 3px; }
  .cs-export-btn.xls { background: #fff; color: #1d6f42; border-color: #b8dcc8; }
  .cs-export-btn.xls:hover:not(:disabled) { background: #f0faf4; border-color: #22a634; }
  .cs-export-btn.pdf { background: #fff; color: #c0392b; border-color: #f5c0bc; }
  .cs-export-btn.pdf:hover:not(:disabled) { background: #fff5f4; border-color: #e53e3e; }

  /* ── KPI Strip ── */
  .cs-kpi-strip {
    display: flex; gap: 12px; padding: 20px 28px 0;
    overflow-x: auto; scrollbar-width: none; flex-wrap: wrap;
  }
  .cs-kpi-strip::-webkit-scrollbar { display: none; }

  .cs-kpi-card {
    flex: 1; min-width: 140px;
    background: #fff; border-radius: 14px;
    padding: 14px 16px;
    border: 1px solid rgba(0,49,118,0.07);
    box-shadow: 0 1px 6px rgba(0,49,118,0.04);
    position: relative; overflow: hidden;
    animation: kpiIn 0.4s ease both;
    cursor: default;
    transition: box-shadow 0.18s, transform 0.18s;
  }
  .cs-kpi-card:hover { box-shadow: 0 4px 18px rgba(0,49,118,0.10); transform: translateY(-2px); }
  .cs-kpi-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 14px 14px 0 0;
  }
  .cs-kpi-card.navy::before    { background: #003176; }
  .cs-kpi-card.green::before   { background: #22a634; }
  .cs-kpi-card.amber::before   { background: #f59e0b; }
  .cs-kpi-card.red::before     { background: #ef4444; }
  .cs-kpi-card.blue::before    { background: #0066cc; }
  .cs-kpi-card.purple::before  { background: #7c3aed; }
  .cs-kpi-card.cyan::before    { background: #0891b2; }

  @keyframes kpiIn { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  .cs-kpi-card:nth-child(1) { animation-delay:0.04s }
  .cs-kpi-card:nth-child(2) { animation-delay:0.08s }
  .cs-kpi-card:nth-child(3) { animation-delay:0.12s }
  .cs-kpi-card:nth-child(4) { animation-delay:0.16s }
  .cs-kpi-card:nth-child(5) { animation-delay:0.20s }
  .cs-kpi-card:nth-child(6) { animation-delay:0.24s }
  .cs-kpi-card:nth-child(7) { animation-delay:0.28s }

  .cs-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .cs-kpi-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .cs-kpi-card.navy   .cs-kpi-icon-wrap { background: rgba(0,49,118,0.08);   color: #003176; }
  .cs-kpi-card.green  .cs-kpi-icon-wrap { background: rgba(34,166,52,0.10);  color: #22a634; }
  .cs-kpi-card.amber  .cs-kpi-icon-wrap { background: rgba(245,158,11,0.10); color: #d97706; }
  .cs-kpi-card.red    .cs-kpi-icon-wrap { background: rgba(239,68,68,0.10);  color: #ef4444; }
  .cs-kpi-card.blue   .cs-kpi-icon-wrap { background: rgba(0,102,204,0.08);  color: #0066cc; }
  .cs-kpi-card.purple .cs-kpi-icon-wrap { background: rgba(124,58,237,0.08); color: #7c3aed; }
  .cs-kpi-card.cyan   .cs-kpi-icon-wrap { background: rgba(8,145,178,0.08);  color: #0891b2; }

  .cs-kpi-num   { font-size: 22px; font-weight: 700; color: #0d1a36; line-height: 1; margin-bottom: 3px; }
  .cs-kpi-label { font-size: 11px; font-weight: 600; color: #8a94b0; text-transform: uppercase; letter-spacing: 0.05em; }

  /* ── Toolbar ── */
  .cs-toolbar {
    display: flex; align-items: flex-end; gap: 12px;
    padding: 20px 28px 0; flex-wrap: wrap;
  }
  .cs-toolbar-field { display: flex; flex-direction: column; gap: 5px; }
  .cs-toolbar-field label {
    font-size: 10.5px; font-weight: 700; color: #4a5878;
    text-transform: uppercase; letter-spacing: 0.06em;
  }

  /* Store multi-select */
  .cs-dd-wrap { position: relative; }
  .cs-dd-trigger {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 9px 12px; min-width: 200px;
    background: #fff; border: 1.5px solid #d0d8ee; border-radius: 10px;
    font-size: 13px; color: #1a2236; cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s; font-family: inherit;
  }
  .cs-dd-trigger:hover { border-color: #003176; }
  .cs-dd-trigger.open {
    border-color: #003176; box-shadow: 0 0 0 3px rgba(0,49,118,0.1);
    border-bottom-left-radius: 0; border-bottom-right-radius: 0;
  }
  .cs-dd-panel {
    position: absolute; top: 100%; left: 0; min-width: 100%; z-index: 300;
    background: #fff; border: 1.5px solid #003176; border-top: none;
    border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;
    box-shadow: 0 12px 32px rgba(0,49,118,0.14); overflow: hidden;
    animation: ddSlide 0.15s ease;
    min-width: 240px;
  }
  @keyframes ddSlide { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }
  .cs-dd-search-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-bottom: 1px solid #edf0f7; background: #f7f9fd;
    color: #a0aabf;
  }
  .cs-dd-search-bar input {
    flex:1; border:none; outline:none; background:transparent;
    font-size:13px; font-family:inherit; color:#1a2236;
  }
  .cs-dd-search-bar input::placeholder { color: #b8c4d8; }
  .cs-dd-select-all-row {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-bottom: 1px solid #edf0f7;
    background: #f0f5ff; cursor: pointer; user-select: none;
    font-size: 12px; font-weight: 600; color: #003176; transition: background 0.1s;
  }
  .cs-dd-select-all-row:hover { background: #e4edfb; }
  .cs-dd-list { max-height: 200px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #d0d8ee transparent; }
  .cs-dd-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; cursor: pointer; font-size: 13px; color: #1a2236;
    border-bottom: 1px solid #f4f6fb; transition: background 0.1s; user-select: none;
  }
  .cs-dd-item:last-child { border-bottom: none; }
  .cs-dd-item:hover { background: #f4f7ff; }
  .cs-dd-item.checked { background: rgba(34,166,52,0.04); }
  .cs-dd-done {
    padding: 8px 12px; border-top: 1px solid #edf0f7; background: #f7f9fd;
    display: flex; justify-content: flex-end;
  }
  .cs-dd-done button {
    background: #003176; color: #fff; border: none; border-radius: 7px;
    padding: 5px 16px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: background 0.15s;
  }
  .cs-dd-done button:hover { background: #00276a; }

  /* Toolbar buttons */
  .cs-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.16s; border: none; white-space: nowrap;
  }
  .cs-btn-primary { background: linear-gradient(135deg,#003176,#004299); color:#fff; box-shadow:0 2px 8px rgba(0,49,118,0.22); }
  .cs-btn-primary:hover { background: linear-gradient(135deg,#00276a,#003c8a); transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,49,118,0.3); }
  .cs-btn-ghost { background:#fff; color:#4a5878; border:1.5px solid #d0d8ee; }
  .cs-btn-ghost:hover { border-color:#003176; color:#003176; }

  .cs-entity-select {
    padding:9px 12px; border:1.5px solid #d0d8ee; border-radius:10px;
    font-size:13px; font-family:inherit; color:#1a2236;
    background:#fff; outline:none; cursor:pointer; transition:border-color 0.15s;
  }
  .cs-entity-select:focus { border-color:#003176; box-shadow:0 0 0 3px rgba(0,49,118,0.1); }

  /* Store tags */
  .cs-store-tags { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 28px 0; }
  .cs-store-tag {
    display: flex; align-items: center; gap: 5px; padding: 4px 8px 4px 10px;
    background: rgba(0,49,118,0.07); border: 1px solid rgba(0,49,118,0.14);
    color: #003176; border-radius: 99px; font-size: 12px; font-weight: 500;
    animation: tagIn 0.2s ease;
  }
  @keyframes tagIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
  .cs-store-tag button {
    background:none; border:none; cursor:pointer; padding:0; color:#003176;
    display:flex; align-items:center; transition:color 0.12s;
  }
  .cs-store-tag button:hover { color:#e53e3e; }
  .cs-tag-clear {
    display:flex; align-items:center; gap:5px; padding:4px 10px;
    background:rgba(229,62,62,0.07); border:1px solid rgba(229,62,62,0.18);
    color:#e53e3e; border-radius:99px; font-size:12px; font-weight:500; cursor:pointer;
    transition:all 0.15s;
  }
  .cs-tag-clear:hover { background:rgba(229,62,62,0.12); }

  /* ── Table Container ── */
  .cs-table-wrap {
    margin: 20px 28px 0;
    background: #fff; border-radius: 16px;
    border: 1px solid rgba(0,49,118,0.08);
    box-shadow: 0 2px 12px rgba(0,49,118,0.05);
    overflow: hidden;
  }
  .cs-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid #edf0f7;
    background: linear-gradient(to right, rgba(0,49,118,0.025), transparent);
    flex-wrap: wrap; gap: 8px;
  }
  .cs-table-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; font-weight: 700; color: #0d1a36;
  }
  .cs-count-badge {
    font-size: 11px; font-weight: 700; padding: 2px 9px;
    background: rgba(0,49,118,0.08); color: #003176; border-radius: 99px;
  }
  .cs-filter-badge {
    font-size: 11px; font-weight: 600; padding: 2px 9px;
    background: rgba(34,166,52,0.1); color: #22a634; border-radius: 99px;
  }
  .cs-legend {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 11.5px; color: #7a88a8;
  }
  .cs-legend-item { display: flex; align-items: center; gap: 4px; }
  .cs-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  /* ── Table ── */
  .cs-table { width: 100%; border-collapse: collapse; }
  .cs-table thead tr { background: #f7f9fd; }
  .cs-table thead th {
    padding: 10px 14px; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em; color: #8a94b0;
    border-bottom: 1px solid #edf0f7; white-space: nowrap;
    position: sticky; top: 0; background: #f7f9fd; z-index: 2;
  }
  .cs-table thead th.searchable { cursor: pointer; }
  .cs-table thead th.searchable:hover { color: #003176; background: #f0f4fb; }
  .cs-table thead th.has-filter { color: #003176; background: rgba(0,49,118,0.04); }
  .cs-th-inner { display: flex; align-items: center; gap: 6px; }
  .cs-th-search-box {
    display: flex; align-items: center; gap: 5px;
    background: #fff; border: 1.5px solid #003176; border-radius: 7px;
    padding: 3px 7px; box-shadow: 0 0 0 2px rgba(0,49,118,0.08);
  }
  .cs-th-search-box input {
    border:none; outline:none; background:transparent;
    font-size:12px; font-family:inherit; color:#1a2236; width:110px;
  }
  .cs-th-search-box input::placeholder { color:#b8c4d8; }
  .cs-th-clear { background:none; border:none; cursor:pointer; padding:0; color:#a0aabf; display:flex; line-height:1; }
  .cs-th-clear:hover { color:#e53e3e; }

  .cs-table tbody tr.main-row {
    border-bottom: 1px solid #f0f3fa;
    transition: background 0.1s;
    animation: rowIn 0.25s ease both;
  }
  @keyframes rowIn { from { opacity:0; transform:translateX(-6px) } to { opacity:1; transform:translateX(0) } }
  .cs-table tbody tr.main-row:hover { background: #f7faff; }
  .cs-table tbody tr.main-row.expanded { background: #f0f5ff; border-bottom: none; }

  .cs-table tbody td {
    padding: 11px 14px; font-size: 13px; color: #2a3452; vertical-align: middle;
  }
  .cs-table tbody td.sno { color: #a0aabf; font-size: 11.5px; font-weight: 500; width: 44px; }

  /* expand toggle cell */
  .cs-expand-cell {
    width: 36px; padding: 11px 8px !important;
    cursor: pointer; text-align: center;
  }
  .cs-expand-btn {
    width: 26px; height: 26px; border-radius: 7px; border: 1.5px solid #d0d8ee;
    background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: #7a88a8; transition: all 0.18s;
  }
  .cs-expand-btn:hover { border-color: #003176; color: #003176; background: rgba(0,49,118,0.05); }
  .cs-expand-btn.open { background: #003176; border-color: #003176; color: #fff; }
  .cs-expand-btn .chev { transition: transform 0.22s; }
  .cs-expand-btn.open .chev { transform: rotate(90deg); }

  /* Product info cell */
  .cs-product-name { font-weight: 600; color: #0d1a36; font-size: 13.5px; }
  .cs-product-sku {
    font-family: 'DM Mono', monospace; font-size: 11px;
    background: #f0f3fa; color: #7a88a8;
    padding: 2px 7px; border-radius: 4px; display: inline-block; margin-top: 2px;
  }

  /* Stock badges */
  .cs-stock-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    font-size: 12.5px; font-weight: 600;
  }
  .cs-stock-badge.ok  { background:rgba(34,166,52,0.1);  color:#22a634; }
  .cs-stock-badge.low { background:rgba(245,158,11,0.10); color:#d97706; }
  .cs-stock-badge.out { background:rgba(239,68,68,0.10);  color:#ef4444; }
  .cs-low-tag {
    font-size: 10px; font-weight: 700; color: #d97706;
    background: rgba(245,158,11,0.1); padding: 1px 6px; border-radius: 4px;
    display: inline-block; margin-top: 2px; letter-spacing: 0.03em;
  }

  .cs-type-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 6px;
  }
  .cs-type-badge.packed { background:rgba(124,58,237,0.08); color:#7c3aed; }
  .cs-type-badge.loose  { background:rgba(8,145,178,0.08);  color:#0891b2; }

  .cs-value-mono { font-family:'DM Mono',monospace; font-size:13px; color:#0d1a36; font-weight:500; }
  .cs-unit-pill {
    font-size:10.5px; background:#f0f3fa; color:#7a88a8;
    padding:2px 6px; border-radius:4px; font-family:'DM Mono',monospace;
  }

  /* Movement preview in main row */
  .cs-movement-preview {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  }
  .cs-movement-chip {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 2px 7px; border-radius: 5px; font-size: 11px; font-weight: 600;
  }
  .cs-movement-chip.inward  { background:rgba(34,166,52,0.10); color:#22a634; }
  .cs-movement-chip.outward { background:rgba(239,68,68,0.10);  color:#ef4444; }
  .cs-movement-chip.stockin { background:rgba(8,145,178,0.10);  color:#0891b2; }
  .cs-movement-chip.stockout { background:rgba(245,158,11,0.10); color:#d97706; }
  .cs-movement-more { font-size:11px; color:#a0aabf; }

  .cs-view-movements-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 7px;
    font-size: 11.5px; font-weight: 600; font-family: inherit;
    background: rgba(0,49,118,0.07); color: #003176;
    border: 1px solid rgba(0,49,118,0.15); cursor: pointer;
    transition: all 0.15s; white-space: nowrap;
  }
  .cs-view-movements-btn:hover { background: rgba(0,49,118,0.12); border-color: #003176; }

  /* ── Expanded Movement Panel ── */
  .cs-expand-row td {
    padding: 0 !important; background: #f0f5ff !important;
    border-bottom: 2px solid #003176 !important;
  }
  .cs-expand-panel {
    padding: 0 18px 18px;
    animation: expandIn 0.22s ease;
  }
  @keyframes expandIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }

  .cs-expand-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0 12px; border-bottom: 1px solid rgba(0,49,118,0.1);
    margin-bottom: 14px;
  }
  .cs-expand-panel-title {
    font-size: 13px; font-weight: 700; color: #003176;
    display: flex; align-items: center; gap: 7px;
  }
  .cs-expand-stats {
    display: flex; gap: 16px; flex-wrap: wrap;
  }
  .cs-expand-stat {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: #5a6880; font-weight: 500;
  }

  /* Movement timeline */
/* Movement timeline */
.cs-timeline { display: flex; flex-direction: column; }
.cs-tl-item {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 0 14px;
  position: relative;
}
/* connector line drawn on the icon column, not a separate element */
.cs-tl-item:not(:last-child) .cs-tl-icon-col::after {
  content: '';
  display: block;
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: linear-gradient(to bottom, #d0d8ee, transparent);
  margin: 4px auto 0;
}
.cs-tl-icon-col {
  display: flex; flex-direction: column; align-items: center; padding-top: 2px;
}
.cs-tl-icon {
  width: 30px; height: 30px; border-radius: 50%; border: 2px solid;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  background: #fff;
}
.cs-tl-icon.inward   { border-color: #22a634; color: #22a634; }
.cs-tl-icon.outward  { border-color: #ef4444; color: #ef4444; }
.cs-tl-icon.stockin  { border-color: #0891b2; color: #0891b2; }
.cs-tl-icon.stockout { border-color: #f59e0b; color: #f59e0b; }
.cs-tl-content { padding: 4px 0 16px; }
.cs-tl-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.cs-tl-type { font-size: 11.5px; font-weight: 700; text-transform: capitalize; padding: 2px 8px; border-radius: 5px; }
.cs-tl-type.inward   { background:rgba(34,166,52,0.10);  color:#22a634; }
.cs-tl-type.outward  { background:rgba(239,68,68,0.10);   color:#ef4444; }
.cs-tl-type.stockin  { background:rgba(8,145,178,0.10);   color:#0891b2; }
.cs-tl-type.stockout { background:rgba(245,158,11,0.10);  color:#d97706; }
.cs-tl-qty { font-family:'DM Mono',monospace; font-size:12px; font-weight:600; color:#0d1a36; background:#f0f3fa; padding:2px 8px; border-radius:5px; }
.cs-tl-meta { display:flex; align-items:center; gap:12px; flex-wrap:wrap; font-size:11.5px; color:#7a88a8; }
.cs-tl-meta-item { display:flex; align-items:center; gap:4px; }
.cs-tl-remarks { font-size:11.5px; color:#5a6880; margin-top:3px; font-style:italic; border-left:2px solid #d0d8ee; padding-left:8px; }

  /* ── Table Footer ── */
  .cs-table-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 18px; border-top: 1px solid #edf0f7; background: #f7f9fd;
    font-size: 12.5px; color: #7a88a8; flex-wrap: wrap; gap: 8px;
  }
  .cs-show-more-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: 1.5px solid #d0d8ee; border-radius: 8px;
    padding: 5px 14px; font-size: 12.5px; color: #003176;
    font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s;
  }
  .cs-show-more-btn:hover { border-color: #003176; background: rgba(0,49,118,0.04); }

  /* ── Alert banners ── */
  .cs-alert {
    display: flex; align-items: flex-start; gap: 10px;
    margin: 16px 28px 0; padding: 12px 16px; border-radius: 12px; font-size: 13px;
  }
  .cs-alert.info { background: rgba(0,49,118,0.04); border: 1px solid rgba(0,49,118,0.12); color: #003176; }
  .cs-alert.warning { background: #fffbeb; border: 1px solid #f6d860; color: #92700a; }

  /* ── Empty state ── */
  .cs-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 56px 24px; gap: 10px;
  }
  .cs-empty-icon-wrap {
    width: 64px; height: 64px; border-radius: 16px;
    background: rgba(0,49,118,0.06); display: flex; align-items: center; justify-content: center;
    color: #a0aabf; margin-bottom: 6px;
  }
  .cs-empty h3 { font-size: 15px; font-weight: 700; color: #4a5878; margin: 0; }
  .cs-empty p  { font-size: 13px; color: #a0aabf; margin: 0; text-align: center; }

  /* ── Spin animation for refresh ── */
  .cs-spinning { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .cs-page-header, .cs-toolbar, .cs-kpi-strip, .cs-store-tags, .cs-alert { padding-left:16px; padding-right:16px; }
    .cs-table-wrap { margin-left:16px; margin-right:16px; }
  }
`;

/* ═══════════════════════════════════════════════════════
   CUSTOM LOADING ANIMATION
═══════════════════════════════════════════════════════ */
function InventoryLoader({ message = "Fetching inventory data" }) {
  return (
    <div className="cs-loader-overlay">
      <div className="cs-loader-card">
        {/* Animated bar chart (inventory levels) */}
        <div style={{ position: "relative" }}>
          <div className="cs-loader-boxes">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="cs-lbox" />
            ))}
          </div>
          {/* Scan line below boxes */}
          <div style={{ marginTop: 10 }}>
            <div className="cs-loader-scan-wrap">
              <div className="cs-loader-scan" />
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div className="cs-loader-text">
            {message}
            <span className="cs-loader-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
          <div className="cs-loader-sub">
            Scanning stock levels across all stores
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MOVEMENT TIMELINE — inside expanded row
═══════════════════════════════════════════════════════ */
const txMeta = {
  inward: { label: "Inward", Icon: ArrowDownCircle, cls: "inward" },
  outward: { label: "Outward", Icon: ArrowUpCircle, cls: "outward" },
  stockin: { label: "Stock In", Icon: PackageOpen, cls: "stockin" },
  stockout: { label: "Stock Out", Icon: MoveRight, cls: "stockout" },
};

function MovementTimeline({ movements }) {
  if (!movements || !movements.length)
    return (
      <p style={{ color: "#a0aabf", fontSize: 13, margin: 0 }}>
        No recent movements recorded.
      </p>
    );

  const inTotal = movements
    .filter(
      (m) => m.transactionType === "inward" || m.transactionType === "stockin",
    )
    .reduce((s, m) => s + m.quantity, 0);
  const outTotal = movements
    .filter(
      (m) =>
        m.transactionType === "outward" || m.transactionType === "stockout",
    )
    .reduce((s, m) => s + m.quantity, 0);
  const storeSet = [
    ...new Set(movements.map((m) => m.store?.name).filter(Boolean)),
  ];

  return (
    <div>
      <div className="cs-expand-panel-header">
        <div className="cs-expand-panel-title">
          <Activity size={15} />
          Recent Movements
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: "rgba(0,49,118,0.08)",
              color: "#003176",
              borderRadius: 99,
              padding: "2px 8px",
            }}
          >
            Last {movements.length}
          </span>
        </div>
        <div className="cs-expand-stats">
          <div className="cs-expand-stat">
            <ArrowDownCircle size={13} color="#22a634" />
            <span style={{ color: "#22a634", fontWeight: 700 }}>
              +{inTotal}
            </span>
            <span>units in</span>
          </div>
          <div className="cs-expand-stat">
            <ArrowUpCircle size={13} color="#ef4444" />
            <span style={{ color: "#ef4444", fontWeight: 700 }}>
              −{outTotal}
            </span>
            <span>units out</span>
          </div>
          <div className="cs-expand-stat">
            <MapPin size={13} color="#003176" />
            <span style={{ fontWeight: 700, color: "#003176" }}>
              {storeSet.length}
            </span>
            <span>store{storeSet.length !== 1 ? "s" : ""} involved</span>
          </div>
        </div>
      </div>

      <div className="cs-timeline">
        {movements.map((m, i) => {
          const meta = txMeta[m.transactionType] || {
            label: m.transactionType,
            Icon: CircleDot,
            cls: "inward",
          };
          const { Icon: TxIcon, cls } = meta;
          const dateStr = m.recordedAt
            ? new Date(m.recordedAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A";

          return (
            <div key={i} className="cs-tl-item">
              <div className="cs-tl-icon-col">
                <div className={`cs-tl-icon ${cls}`}>
                  <TxIcon size={13} />
                </div>
              </div>
              <div className="cs-tl-content">
                <div className="cs-tl-header">
                  <span className={`cs-tl-type ${cls}`}>{meta.label}</span>
                  <span className="cs-tl-qty">
                    {cls === "inward" || cls === "stockin" ? "+" : "−"}
                    {m.quantity} bags
                  </span>
                </div>
                <div className="cs-tl-meta">
                  {m.store?.name && (
                    <span className="cs-tl-meta-item">
                      <Store size={11} color="#003176" />
                      <strong style={{ color: "#003176" }}>
                        {m.store.name}
                      </strong>
                    </span>
                  )}
                  <span className="cs-tl-meta-item">
                    <Clock size={11} />
                    {dateStr}
                  </span>
                </div>
                {m.remarks && (
                  <div className="cs-tl-remarks">
                    <FileText
                      size={10}
                      style={{
                        display: "inline",
                        marginRight: 4,
                        verticalAlign: "middle",
                      }}
                    />
                    {m.remarks}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STORE DROPDOWN
═══════════════════════════════════════════════════════ */
function StoreDropdown({
  stores,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = stores.filter((s) =>
    (s.name || s.storeName || "").toLowerCase().includes(q.toLowerCase()),
  );
  const allSel = stores.length > 0 && selectedIds.length === stores.length;

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQ("");
  }, [open]);

  const label =
    selectedIds.length === 0
      ? "All Stores"
      : `${selectedIds.length} Store${selectedIds.length !== 1 ? "s" : ""} Selected`;

  return (
    <div className="cs-dd-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`cs-dd-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Store size={14} color={selectedIds.length ? "#003176" : "#a0aabf"} />
          <span style={{ color: selectedIds.length ? "#003176" : "#a0aabf" }}>
            {label}
          </span>
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "#a0aabf",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      {open && (
        <div className="cs-dd-panel">
          <div className="cs-store-dd-search cs-dd-search-bar">
            <Search size={13} />
            <input
              ref={inputRef}
              placeholder="Search stores…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#a0aabf",
                  display: "flex",
                  padding: 0,
                }}
                onClick={() => setQ("")}
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div
            className="cs-dd-select-all-row"
            onClick={() => (allSel ? onDeselectAll() : onSelectAll())}
          >
            {allSel ? (
              <CheckSquare size={14} color="#22a634" />
            ) : (
              <Square size={14} color="#c0c8dc" />
            )}
            <span>{allSel ? "Deselect All" : "Select All"}</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                background: "rgba(0,49,118,0.1)",
                color: "#003176",
                padding: "1px 7px",
                borderRadius: 99,
                fontWeight: 700,
              }}
            >
              {filtered.length}
            </span>
          </div>
          <div className="cs-dd-list">
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  textAlign: "center",
                  color: "#b0bcd4",
                  fontSize: 13,
                }}
              >
                No stores found
              </div>
            ) : (
              filtered.map((s) => {
                const checked = selectedIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className={`cs-dd-item${checked ? " checked" : ""}`}
                    onClick={() => onToggle(s.id)}
                  >
                    {checked ? (
                      <CheckSquare size={14} color="#22a634" />
                    ) : (
                      <Square size={14} color="#c0c8dc" />
                    )}
                    <span>{s.name || s.storeName}</span>
                  </div>
                );
              })
            )}
          </div>
          <div className="cs-dd-done">
            <button onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SEARCHABLE TH
═══════════════════════════════════════════════════════ */
function SearchableTH({
  label,
  icon: Icon,
  searchTerm,
  setSearchTerm,
  show,
  setShow,
}) {
  const inputRef = useRef(null);
  useEffect(() => {
    if (show) setTimeout(() => inputRef.current?.focus(), 40);
  }, [show]);
  return (
    <th
      className={`searchable${show || searchTerm ? " has-filter" : ""}`}
      onClick={() => !show && setShow(true)}
    >
      {show ? (
        <div className="cs-th-search-box" onClick={(e) => e.stopPropagation()}>
          <Search size={12} color="#003176" />
          <input
            ref={inputRef}
            placeholder={`Search…`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="cs-th-clear"
              onClick={() => {
                setSearchTerm("");
                setShow(false);
              }}
            >
              <X size={11} />
            </button>
          )}
        </div>
      ) : (
        <div className="cs-th-inner">
          {Icon && <Icon size={12} />}
          {label}
          {searchTerm ? (
            <span
              style={{
                fontSize: 10,
                background: "#003176",
                color: "#fff",
                borderRadius: 4,
                padding: "1px 5px",
                marginLeft: 2,
              }}
            >
              ●
            </span>
          ) : (
            <Search size={11} style={{ color: "#c0c8dc", marginLeft: 2 }} />
          )}
        </div>
      )}
    </th>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
function CurrentStock({ navigate }) {
  const { axiosAPI } = useAuth();
  const { selectedDivision, showAllDivisions } = useDivision();

  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [limit, setLimit] = useState(20);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Search
  const [nameSearch, setNameSearch] = useState("");
  const [showName, setShowName] = useState(false);
  const [skuSearch, setSkuSearch] = useState("");
  const [showSku, setShowSku] = useState(false);

  /* ─ Derived ─ */
  const filteredData = rawData.filter((item) => {
    if (
      nameSearch &&
      !(item.product?.name || "")
        .toLowerCase()
        .includes(nameSearch.toLowerCase())
    )
      return false;
    if (
      skuSearch &&
      !(item.product?.SKU || "").toLowerCase().includes(skuSearch.toLowerCase())
    )
      return false;
    return true;
  });

  const totalValue = filteredData.reduce(
    (s, i) => s + i.currentStock * parseFloat(i.product?.basePrice || 0),
    0,
  );
  const inStock = filteredData.filter((i) => i.currentStock > 0).length;
  const lowStock = filteredData.filter(
    (i) => i.isLowStock || (i.currentStock > 0 && i.currentStock < 5),
  ).length;
  const outOfStock = filteredData.filter((i) => i.currentStock === 0).length;
  const packedCnt = filteredData.filter(
    (i) => i.product?.productType === "packed",
  ).length;
  const looseCnt = filteredData.filter(
    (i) => i.product?.productType === "loose",
  ).length;
  const anySearch = nameSearch || skuSearch;

  /* ─ Init ─ */
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setUser(u);
  }, []);

  /* ─ Fetch stores ─ */
  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await axiosAPI.get("/auth/available-stores");
        let stores =
          res.data?.data ||
          res.data?.stores ||
          (Array.isArray(res.data) ? res.data : []);
        stores = stores.filter((s) => s.storeType?.toLowerCase() === "own");
        setWarehouses(stores);
        if (stores.length === 1) setSelectedStoreIds([stores[0].id]);
      } catch {
        try {
          const res = await axiosAPI.get("/stores?limit=1000");
          setWarehouses(res.data.stores || res.data.data || []);
        } catch {
          setError("Failed to load store list");
        }
      }
    }
    fetchStores();
  }, []);

  /* ─ Auto-fetch on division change ─ */
  useEffect(() => {
    if (selectedDivision?.id || showAllDivisions) fetchCurrentStock();
  }, [selectedDivision?.id, showAllDivisions]);

  /* ─ ESC to close search ─ */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") {
        setShowName(false);
        setNameSearch("");
        setShowSku(false);
        setSkuSearch("");
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  /* ─ API ─ */
  const fetchCurrentStock = async () => {
    try {
      setLoading(true);
      setError(null);
      setExpandedRows(new Set());
      let q = "/stores/admin/inventory";
      if (selectedStoreIds.length > 0)
        q += `?storeIds=${selectedStoreIds.join(",")}`;
      const res = await axiosAPI.get(q);
      setRawData(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  /* ─ Export ─ */
  const onExport = (type) => {
    if (!filteredData.length) {
      setError("No data to export");
      return;
    }
    const cols = [
      "S.No",
      "Product",
      "SKU",
      "Type",
      "Stock",
      "Unit",
      "Unit Price",
      "Total Value",
      "In",
      "Out",
    ];
    const rows = filteredData.map((item, i) => {
      const inT = (item.recentMovements || [])
        .filter(
          (m) =>
            m.transactionType === "inward" || m.transactionType === "stockin",
        )
        .reduce((s, m) => s + m.quantity, 0);
      const outT = (item.recentMovements || [])
        .filter(
          (m) =>
            m.transactionType === "outward" || m.transactionType === "stockout",
        )
        .reduce((s, m) => s + m.quantity, 0);
      return [
        i + 1,
        item.product?.name || "N/A",
        item.product?.SKU || "N/A",
        item.product?.productType || "N/A",
        item.currentStock,
        item.product?.unit || "bag",
        `₹${item.product?.basePrice || 0}`,
        `₹${(item.currentStock * parseFloat(item.product?.basePrice || 0)).toLocaleString()}`,
        `+${inT}`,
        `-${outT}`,
      ];
    });
    if (type === "XLS") handleExportExcel(cols, rows, "Current Stock Report");
    else handleExportPDF(cols, rows, "Current Stock Report");
  };

  /* ─ Helpers ─ */
  const getStockCls = (item) => {
    if (item.currentStock === 0) return "out";
    if (item.isLowStock || item.currentStock < 5) return "low";
    return "ok";
  };

  const toggleExpand = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isAdmin =
    user?.roles?.includes("Admin") || user?.roles?.includes("Super Admin");

  const kpis = [
    {
      cls: "navy",
      Icon: Boxes,
      label: "Total Products",
      value: filteredData.length,
    },
    { cls: "green", Icon: CheckCircle2, label: "In Stock", value: inStock },
    { cls: "amber", Icon: AlertTriangle, label: "Low Stock", value: lowStock },
    { cls: "red", Icon: XCircle, label: "Out of Stock", value: outOfStock },
    {
      cls: "blue",
      Icon: DollarSign,
      label: "Total Value",
      value: `₹${(totalValue / 100000).toFixed(2)}L`,
    },
    { cls: "purple", Icon: Package, label: "Packed", value: packedCnt },
    { cls: "cyan", Icon: ShoppingBag, label: "Loose", value: looseCnt },
  ];

  /* ═══════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════ */
  return (
    <>
      <style>{css}</style>
      <div className="cs-page">
        {/* Custom Loading Animation */}
        {loading && <InventoryLoader message="Fetching inventory data" />}

        {/* Error Modal */}
        {error && <ErrorModal message={error} onClose={() => setError(null)} />}

        {/* Breadcrumb */}
        <div className="cs-breadcrumb">
          <span
            className="cs-breadcrumb-link"
            onClick={() => navigate("/inventory")}
          >
            <LayoutGrid size={13} /> Inventory
          </span>
          <ChevronRight size={12} className="sep" />
          <span className="active">Current Stock</span>
        </div>

        {/* Page Header */}
        <div className="cs-page-header">
          <div className="cs-page-title">
            <h1>Current Stock</h1>
            <p>
              {isAdmin
                ? "Company-wide inventory — all stores & products"
                : "Inventory based on your access level"}
            </p>
          </div>
          <div className="cs-header-right">
            <button
              className="cs-export-btn xls"
              onClick={() => onExport("XLS")}
              disabled={!filteredData.length}
            >
              <img src={xls} alt="XLS" /> <FileDown size={13} /> Export XLS
            </button>
            <button
              className="cs-export-btn pdf"
              onClick={() => onExport("PDF")}
              disabled={!filteredData.length}
            >
              <img src={pdf} alt="PDF" /> <FileDown size={13} /> Export PDF
            </button>
          </div>
        </div>

        {/* Division warning */}
        {!loading && !selectedDivision?.id && !showAllDivisions && (
          <div className="cs-alert info">
            <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Select a division from the top navigation to load inventory data.
            </span>
          </div>
        )}

        {/* KPI Strip */}
        {rawData.length > 0 && (
          <div className="cs-kpi-strip">
            {kpis.map((k) => (
              <div key={k.label} className={`cs-kpi-card ${k.cls}`}>
                <div className="cs-kpi-top">
                  <div className="cs-kpi-icon-wrap">
                    <k.Icon size={17} />
                  </div>
                </div>
                <div className="cs-kpi-num">{k.value}</div>
                <div className="cs-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        {(rawData.length > 0 || warehouses.length > 0) && (
          <div className="cs-toolbar">
            <div className="cs-toolbar-field">
              <label>Filter by Store</label>
              <StoreDropdown
                stores={warehouses}
                selectedIds={selectedStoreIds}
                onToggle={(id) =>
                  setSelectedStoreIds((p) =>
                    p.includes(id) ? p.filter((i) => i !== id) : [...p, id],
                  )
                }
                onSelectAll={() =>
                  setSelectedStoreIds(warehouses.map((w) => w.id))
                }
                onDeselectAll={() => setSelectedStoreIds([])}
              />
            </div>
            <div className="cs-toolbar-field">
              <label>Rows per page</label>
              <select
                className="cs-entity-select"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
              >
                {[10, 20, 30, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v} rows
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
              <button
                className="cs-btn cs-btn-primary"
                onClick={fetchCurrentStock}
              >
                <RefreshCw size={14} className={loading ? "cs-spinning" : ""} />{" "}
                Refresh
              </button>
              <button
                className="cs-btn cs-btn-ghost"
                onClick={() => navigate("/inventory")}
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </div>
        )}

        {/* Store tags */}
        {selectedStoreIds.length > 0 && (
          <div className="cs-store-tags">
            {selectedStoreIds.map((id) => {
              const s = warehouses.find((w) => w.id === id);
              if (!s) return null;
              return (
                <span key={id} className="cs-store-tag">
                  <Store size={11} />
                  {s.name || s.storeName}
                  <button
                    onClick={() =>
                      setSelectedStoreIds((p) => p.filter((i) => i !== id))
                    }
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
            <span
              className="cs-tag-clear"
              onClick={() => setSelectedStoreIds([])}
            >
              <X size={11} /> Clear All
            </span>
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          rawData.length === 0 &&
          (selectedDivision?.id || showAllDivisions) && (
            <div className="cs-table-wrap" style={{ marginTop: 20 }}>
              <div className="cs-empty">
                <div className="cs-empty-icon-wrap">
                  <Warehouse size={28} />
                </div>
                <h3>No Inventory Data</h3>
                <p>
                  No products found for the current selection.
                  <br />
                  Try refreshing or changing the filters.
                </p>
              </div>
            </div>
          )}

        {/* ── Main Table ── */}
        {rawData.length > 0 && (
          <div className="cs-table-wrap">
            {/* Table header bar */}
            <div className="cs-table-header">
              <div className="cs-table-title">
                <BarChart3 size={15} color="#003176" />
                Stock Inventory
                <span className="cs-count-badge">
                  {filteredData.length} products
                </span>
                {anySearch && (
                  <span className="cs-filter-badge">
                    <Filter size={10} /> Filtered
                  </span>
                )}
                {expandedRows.size > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 9px",
                      background: "rgba(34,166,52,0.1)",
                      color: "#22a634",
                      borderRadius: 99,
                    }}
                  >
                    {expandedRows.size} expanded
                  </span>
                )}
              </div>
              <div className="cs-legend">
                {[
                  { color: "#22a634", label: "Inward" },
                  { color: "#0891b2", label: "Stock In" },
                  { color: "#ef4444", label: "Outward" },
                  { color: "#f59e0b", label: "Transfer Out" },
                ].map((l) => (
                  <span key={l.label} className="cs-legend-item">
                    <span
                      className="cs-legend-dot"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Filter summary row */}
            {anySearch && (
              <div
                style={{
                  padding: "6px 14px",
                  fontSize: 11.5,
                  color: "#7a88a8",
                  background: "#f0f5ff",
                  borderBottom: "1px solid #edf0f7",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Filter size={12} color="#003176" />
                Showing{" "}
                <strong style={{ color: "#003176" }}>
                  {filteredData.length}
                </strong>{" "}
                of {rawData.length} products
                {nameSearch && (
                  <span>
                    · Name: <em>"{nameSearch}"</em>
                  </span>
                )}
                {skuSearch && (
                  <span>
                    · SKU: <em>"{skuSearch}"</em>
                  </span>
                )}
                <button
                  onClick={() => {
                    setNameSearch("");
                    setSkuSearch("");
                    setShowName(false);
                    setShowSku(false);
                  }}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "1px solid #d0d8ee",
                    borderRadius: 6,
                    padding: "2px 10px",
                    fontSize: 11,
                    color: "#4a5878",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 600,
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            <div style={{ overflowX: "auto" }}>
              <table className="cs-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th style={{ width: 44 }}>
                      <div className="cs-th-inner">#</div>
                    </th>
                    <SearchableTH
                      label="Product Name"
                      icon={Package}
                      searchTerm={nameSearch}
                      setSearchTerm={setNameSearch}
                      show={showName}
                      setShow={setShowName}
                    />
                    <SearchableTH
                      label="SKU"
                      icon={Tag}
                      searchTerm={skuSearch}
                      setSearchTerm={setSkuSearch}
                      show={showSku}
                      setShow={setShowSku}
                    />
                    <th>
                      <div className="cs-th-inner">
                        <Layers size={12} /> Type
                      </div>
                    </th>
                    <th>
                      <div className="cs-th-inner">
                        <ShoppingBag size={12} /> Stock
                      </div>
                    </th>
                    <th>
                      <div className="cs-th-inner">
                        <DollarSign size={12} /> Unit Price
                      </div>
                    </th>
                    <th>
                      <div className="cs-th-inner">
                        <BarChart3 size={12} /> Total Value
                      </div>
                    </th>
                    <th>
                      <div className="cs-th-inner">
                        <Activity size={12} /> Movements
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="cs-empty" style={{ padding: 32 }}>
                          <div className="cs-empty-icon-wrap">
                            <Search size={24} />
                          </div>
                          <h3>No products match</h3>
                          <p>Try different search keywords or clear filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.slice(0, limit).map((item, idx) => {
                      const stockCls = getStockCls(item);
                      const totalVal =
                        item.currentStock *
                        parseFloat(item.product?.basePrice || 0);
                      const movements = item.recentMovements || [];
                      const isExpanded = expandedRows.has(
                        item.productId || idx,
                      );
                      const inTotal = movements
                        .filter(
                          (m) =>
                            m.transactionType === "inward" ||
                            m.transactionType === "stockin",
                        )
                        .reduce((s, m) => s + m.quantity, 0);
                      const outTotal = movements
                        .filter(
                          (m) =>
                            m.transactionType === "outward" ||
                            m.transactionType === "stockout",
                        )
                        .reduce((s, m) => s + m.quantity, 0);

                      const StockIcon =
                        stockCls === "ok"
                          ? CheckCircle2
                          : stockCls === "low"
                            ? AlertTriangle
                            : XCircle;

                      return (
                        <React.Fragment key={item.productId || idx}>
                          {/* Main data row */}
                          <tr
                            className={`main-row${isExpanded ? " expanded" : ""}`}
                            style={{ animationDelay: `${idx * 0.025}s` }}
                          >
                            {/* Expand toggle */}
                            <td className="cs-expand-cell">
                              <button
                                className={`cs-expand-btn${isExpanded ? " open" : ""}`}
                                onClick={() =>
                                  toggleExpand(item.productId || idx)
                                }
                                title={
                                  isExpanded
                                    ? "Collapse movements"
                                    : "View movements"
                                }
                              >
                                <ChevronRight size={13} className="chev" />
                              </button>
                            </td>

                            <td className="sno">{idx + 1}</td>

                            {/* Product */}
                            <td>
                              <div className="cs-product-name">
                                {item.product?.name || "N/A"}
                              </div>
                              <div style={{ marginTop: 2 }}>
                                <span className="cs-product-sku">
                                  {item.product?.SKU || "—"}
                                </span>
                              </div>
                            </td>

                            {/* SKU standalone col */}
                            <td>
                              <span className="cs-unit-pill">
                                {item.product?.SKU || "N/A"}
                              </span>
                            </td>

                            {/* Type */}
                            <td>
                              <span
                                className={`cs-type-badge ${item.product?.productType || "packed"}`}
                              >
                                {item.product?.productType === "packed" ? (
                                  <>
                                    <Package size={11} /> Packed
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag size={11} /> Loose
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Stock */}
                            <td>
                              <div>
                                <span className={`cs-stock-badge ${stockCls}`}>
                                  <StockIcon size={13} />
                                  {item.currentStock}
                                  <span className="cs-unit-pill">
                                    {item.product?.unit || "bag"}
                                  </span>
                                </span>
                                {stockCls === "low" && (
                                  <span className="cs-low-tag">
                                    ⚠ Low Stock
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Unit price */}
                            <td>
                              <span className="cs-value-mono">
                                ₹
                                {parseFloat(
                                  item.product?.basePrice || 0,
                                ).toLocaleString()}
                              </span>
                            </td>

                            {/* Total value */}
                            <td>
                              <span
                                className="cs-value-mono"
                                style={{ fontWeight: 700 }}
                              >
                                ₹{totalVal.toLocaleString()}
                              </span>
                            </td>

                            {/* Movements preview + View button */}
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 5,
                                }}
                              >
                                {movements.length > 0 ? (
                                  <>
                                    <div className="cs-movement-preview">
                                      {inTotal > 0 && (
                                        <span className="cs-movement-chip inward">
                                          <ArrowDownCircle size={10} /> +
                                          {inTotal}
                                        </span>
                                      )}
                                      {outTotal > 0 && (
                                        <span className="cs-movement-chip outward">
                                          <ArrowUpCircle size={10} /> −
                                          {outTotal}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      className="cs-view-movements-btn"
                                      onClick={() =>
                                        toggleExpand(item.productId || idx)
                                      }
                                    >
                                      <Eye size={12} />
                                      {isExpanded
                                        ? "Hide Details"
                                        : `View ${movements.length} Movements`}
                                      <ChevronDown
                                        size={11}
                                        style={{
                                          transform: isExpanded
                                            ? "rotate(180deg)"
                                            : "none",
                                          transition: "transform 0.2s",
                                        }}
                                      />
                                    </button>
                                  </>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: 12,
                                      color: "#c0c8dc",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <Activity size={12} /> No movements
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded movement detail row */}
                          {isExpanded && (
                            <tr className="cs-expand-row">
                              <td colSpan={9}>
                                <div className="cs-expand-panel">
                                  <MovementTimeline movements={movements} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="cs-table-footer">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <BarChart3 size={13} color="#003176" />
                Showing{" "}
                <strong style={{ color: "#0d1a36" }}>
                  {Math.min(limit, filteredData.length)}
                </strong>{" "}
                of{" "}
                <strong style={{ color: "#0d1a36" }}>
                  {filteredData.length}
                </strong>{" "}
                products
                {filteredData.length < rawData.length && (
                  <span style={{ color: "#a0aabf" }}>
                    ({rawData.length} total before filter)
                  </span>
                )}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {expandedRows.size > 0 && (
                  <button
                    onClick={() => setExpandedRows(new Set())}
                    style={{
                      background: "none",
                      border: "1.5px solid #d0d8ee",
                      borderRadius: 8,
                      padding: "5px 12px",
                      fontSize: 12,
                      color: "#7a88a8",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <ChevronDown size={12} /> Collapse All
                  </button>
                )}
                {filteredData.length > limit && (
                  <button
                    className="cs-show-more-btn"
                    onClick={() => setLimit((l) => l + 20)}
                  >
                    <ChevronDown size={13} /> Load More
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CurrentStock;
