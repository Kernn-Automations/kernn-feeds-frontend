import React, { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import styles from "../Dashboard/Dashboard.module.css";
import StoreDashHeader from "./StoreDashHeader";
import StoreNavContainer from "./StoreNavContainer";
import FootLink from "../Dashboard/FootLink";

const StoreHome = lazy(() => import("./StoreHome"));
const StoreSales = lazy(() => import("./sales/StoreSales"));
const StoreDamaged = lazy(() => import("./damaged/StoreDamaged"));
const StoreInventory = lazy(() => import("./inventory/StoreInventory"));
const StoreCurrentStock = lazy(() => import("./inventory/StoreCurrentStock"));
const StoreStockSummary = lazy(() => import("./inventory/StoreStockSummary"));
const StoreDamagedStock = lazy(() => import("./inventory/StoreDamagedStock"));
const StoreStockTransfer = lazy(() => import("./inventory/StoreStockTransfer"));
const IndentRoutes = lazy(() => import("./indents/IndentRoutes"));
const CustomerRoutes = lazy(() => import("./customers/CustomerRoutes"));
const EmployeeRoutes = lazy(() => import("./employees/EmployeeRoutes"));
const ProductRoutes = lazy(() => import("./products/ProductRoutes"));
const StoreDiscounts = lazy(() => import("./discounts/StoreDiscounts"));
const StoreExpenditures = lazy(() => import("./expenditures/StoreExpenditures"));
const StoreAssets = lazy(() => import("./assets/StoreAssets"));
const StoreAssetTransfer = lazy(() => import("./assets/StoreAssetTransfer"));

export default function StoreDashboard() {
  const [hover, setHover] = useState(false);
  const [style, setStyle] = useState("navcont");
  const [tab, setTab] = useState("home");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onmouseover = () => {
    if (!isMobile) {
      setHover(true);
      setStyle("navover");
    }
  };
  const onmouseleave = () => {
    if (!isMobile) {
      setHover(false);
      setStyle("navcont");
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setStyle("navover");
    } else {
      setStyle("navcont");
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setStyle("navcont");
  };

  let storedUser = {};
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      storedUser = JSON.parse(userData);
      // Handle nested user structure (user.user)
      if (storedUser.user && !storedUser.roles) {
        storedUser = storedUser.user;
      }
    }
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
  }

  return (
    <div className="container-fluid py-0 my-0">
      {/* Mobile Hamburger Menu Button */}
      {isMobile && (
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && (
        <div
          className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={closeMobileMenu}
        />
      )}

      <div className="row py-0 my-0 pr-0">
        <div
          className={`col ${styles[style]} ${mobileMenuOpen ? styles.mobileOpen : ''}`}
          onMouseOver={onmouseover}
          onMouseLeave={onmouseleave}
        >
          <StoreNavContainer hover={hover} setTab={setTab} tab={tab} user={storedUser} closeMobileMenu={closeMobileMenu} />
        </div>

        <div className="col p-0">
          <div className={`row p-0 ${styles.headline}`}>
            <StoreDashHeader
              notifications={null}
              user={storedUser}
              setTab={setTab}
              admin={false}
              orgadmin={false}
            />
          </div>

          <div className={`col ${styles.tabs}`} onClick={isMobile && mobileMenuOpen ? closeMobileMenu : undefined}>
            <Routes>
          <Route index element={<Suspense fallback={<div>Loading...</div>}><StoreHome /></Suspense>} />
          <Route path="sales" element={<Suspense fallback={<div>Loading...</div>}><StoreSales /></Suspense>} />
          <Route path="damaged" element={<Suspense fallback={<div>Loading...</div>}><StoreDamaged /></Suspense>} />
          <Route path="inventory" element={<Suspense fallback={<div>Loading...</div>}><StoreInventory /></Suspense>} />
          <Route path="current-stock" element={<Suspense fallback={<div>Loading...</div>}><StoreCurrentStock /></Suspense>} />
          <Route path="stock-summary" element={<Suspense fallback={<div>Loading...</div>}><StoreStockSummary /></Suspense>} />
          <Route path="damaged-stock" element={<Suspense fallback={<div>Loading...</div>}><StoreDamagedStock /></Suspense>} />
          <Route path="stock-transfer" element={<Suspense fallback={<div>Loading...</div>}><StoreStockTransfer /></Suspense>} />
          <Route path="indents/*" element={<Suspense fallback={<div>Loading...</div>}><IndentRoutes /></Suspense>} />
          <Route path="customers/*" element={<Suspense fallback={<div>Loading...</div>}><CustomerRoutes /></Suspense>} />
          <Route path="employees/*" element={<Suspense fallback={<div>Loading...</div>}><EmployeeRoutes /></Suspense>} />
          <Route path="products/*" element={<Suspense fallback={<div>Loading...</div>}><ProductRoutes /></Suspense>} />
          <Route path="discounts" element={<Suspense fallback={<div>Loading...</div>}><StoreDiscounts /></Suspense>} />
          <Route path="assets" element={<Suspense fallback={<div>Loading...</div>}><StoreAssets /></Suspense>} />
          <Route path="assets/transfer" element={<Suspense fallback={<div>Loading...</div>}><StoreAssetTransfer /></Suspense>} />
          <Route path="expenditures" element={<Suspense fallback={<div>Loading...</div>}><StoreExpenditures /></Suspense>} />
          <Route path="*" element={<Navigate to="/store" replace />} />
            </Routes>
          </div>
        </div>
      </div>
      <FootLink />
    </div>
  );
}


