import React, { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import styles from "../Dashboard/Dashboard.module.css";
import StoreDashHeader from "./StoreDashHeader";
import StoreNavContainer from "./StoreNavContainer";
import FootLink from "../Dashboard/FootLink";
import { useAuth } from "../../Auth";
import storeService from "../../services/storeService";
import { connectStoreNotificationSocket } from "../../services/storeNotificationSocket";
import { isStoreManager, isAdmin, isDivisionHead,  isZBM,
  isRBM,
  isAreaBusinessManager,
} from "../../utils/roleUtils";

const StoreHome = lazy(() => import("./StoreHome"));
const StoreSales = lazy(() => import("./sales/StoreSales"));
const StoreSalesReports = lazy(() => import("./sales/StoreSalesReports"));
const StoreCashDeposit = lazy(() => import("./sales/StoreCashDeposit"));
const StoreBankReceipts = lazy(() => import("./sales/StoreBankReceipts"));
const StoreCashBook = lazy(() => import("./sales/StoreCashBook"));
const StoreBankBook = lazy(() => import("./sales/StoreBankBook"));
const StoreDamaged = lazy(() => import("./damaged/StoreDamaged"));
const StoreInventory = lazy(() => import("./inventory/StoreInventory"));
const StoreCurrentStock = lazy(() => import("./inventory/StoreCurrentStock"));
const StoreStockSummary = lazy(() => import("./inventory/StoreStockSummary"));
const StoreDamagedStock = lazy(() => import("./inventory/StoreDamagedStock"));
const StoreStockTransfer = lazy(() => import("./inventory/StoreStockTransfer"));
const StoreManageStock = lazy(() => import("./inventory/StoreManageStock"));
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
  const [checkingStore, setCheckingStore] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const notificationSocketRef = useRef(null);
  const notificationPollerRef = useRef(null);

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

  // Check if store is selected, and if user has multiple stores, redirect to selector
  useEffect(() => {
    const checkStoreSelection = () => {
      try {
        const selectedStore = localStorage.getItem("selectedStore");
        const currentStoreId = localStorage.getItem("currentStoreId");

        // If store is already selected, proceed
        if (selectedStore && currentStoreId) {
          console.log("StoreDashboard - Store already selected:", JSON.parse(selectedStore));
          setCheckingStore(false);
          return;
        }

        // Get user to check role and requiresStoreSelection
        let storedUser = {};
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            storedUser = JSON.parse(userData);
            if (storedUser.user && !storedUser.roles) {
              storedUser = storedUser.user;
            }
          }
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }

        // Get authMeData from localStorage
        let authMeData = null;
        try {
          const stored = localStorage.getItem("authMeData");
          if (stored) {
            authMeData = JSON.parse(stored);
          }
        } catch (e) {
          console.error("Error parsing authMeData:", e);
        }

        // Check requiresStoreSelection flag from /auth/me response
        const requiresStoreSelection = storedUser?.requiresStoreSelection === true || 
                                       storedUser?.storeSelectionRequired === true ||
                                       (authMeData?.requiresStoreSelection === true) ||
                                       (authMeData?.storeSelectionRequired === true);

        const isStoreManagerUser = isStoreManager(storedUser) || storedUser?.isStoreManager === true || authMeData?.isStoreManager === true;
        const isAdminUser = isAdmin(storedUser);
        const isDivisionHeadUser = isDivisionHead(storedUser);
        const isZBMUser = isZBM(storedUser);
        const isRBMUser = isRBM(storedUser);
        const isABMUser = isAreaBusinessManager(storedUser);

        // Check if store selection is required
        if (requiresStoreSelection && (isStoreManagerUser || isAdminUser || isDivisionHeadUser || isZBMUser || isRBMUser || isABMUser)) {
          console.log("StoreDashboard - Store selection required, redirecting to selector");
          navigate("/store-selector", { replace: true });
          return;
        }

        // If no store selection required, proceed normally
        setCheckingStore(false);
      } catch (error) {
        console.error("StoreDashboard - Error checking store selection:", error);
        setCheckingStore(false);
      }
    };

    checkStoreSelection();
  }, [navigate]);

  useEffect(() => {
    const selectedStoreId = Number(localStorage.getItem("currentStoreId") || 0);
    if (!selectedStoreId) return undefined;

    let mounted = true;

    const loadNotifications = async () => {
      try {
        const response = await storeService.getStoreNotifications({
          storeId: selectedStoreId,
          limit: 12,
        });
        if (mounted && response?.success) {
          setNotifications((current) => {
            const incoming = Array.isArray(response.data) ? response.data : [];
            if (!current.length) return incoming;

            const merged = [...incoming];
            current.forEach((item) => {
              if (!merged.some((existing) => existing.id === item.id)) {
                merged.push(item);
              }
            });

            return merged
              .sort(
                (a, b) =>
                  new Date(b.createdAt || b.updatedAt || 0).getTime() -
                  new Date(a.createdAt || a.updatedAt || 0).getTime(),
              )
              .slice(0, 20);
          });
        }
      } catch (error) {
        console.warn(
          "StoreDashboard - Failed to load notifications:",
          error.message,
        );
      }
    };

    loadNotifications();

    notificationPollerRef.current = window.setInterval(() => {
      loadNotifications();
    }, 30000);

    notificationSocketRef.current?.disconnect();
    notificationSocketRef.current = connectStoreNotificationSocket({
      storeIds: [selectedStoreId],
      onNotification: (notification) => {
        if (!mounted) return;
        setNotifications((current) => {
          const deduped = current.filter((item) => item.id !== notification.id);
          return [notification, ...deduped].slice(0, 20);
        });
      },
    });

    return () => {
      mounted = false;
      if (notificationPollerRef.current) {
        window.clearInterval(notificationPollerRef.current);
        notificationPollerRef.current = null;
      }
      notificationSocketRef.current?.disconnect();
      notificationSocketRef.current = null;
    };
  }, [checkingStore]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification?.id || notification.isRead) return;
      const storeId = Number(localStorage.getItem("currentStoreId") || 0) || null;
      await storeService.markStoreNotificationRead(notification.id, storeId);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );
    } catch (error) {
      console.warn(
        "StoreDashboard - Failed to mark notification as read:",
        error.message,
      );
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const storeId = Number(localStorage.getItem("currentStoreId") || 0) || null;
      await storeService.markAllStoreNotificationsRead(storeId);
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        })),
      );
    } catch (error) {
      console.warn(
        "StoreDashboard - Failed to mark all notifications as read:",
        error.message,
      );
    }
  };

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

  // Show loading while checking store selection
  if (checkingStore) {
    return (
      <div className="container-fluid py-0 my-0" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
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
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
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
          <Route path="sales-reports" element={<Suspense fallback={<div>Loading...</div>}><StoreSalesReports onBack={() => navigate("/store/sales")} /></Suspense>} />
          <Route path="cash-book" element={<Suspense fallback={<div>Loading...</div>}><StoreCashBook /></Suspense>} />
          <Route path="bank-book" element={<Suspense fallback={<div>Loading...</div>}><StoreBankBook /></Suspense>} />
          <Route path="cashdeposit" element={<Suspense fallback={<div>Loading...</div>}><StoreCashDeposit /></Suspense>} />
          <Route path="bank-receipts" element={<Suspense fallback={<div>Loading...</div>}><StoreBankReceipts /></Suspense>} />
          <Route path="damaged" element={<Suspense fallback={<div>Loading...</div>}><StoreDamaged /></Suspense>} />
          <Route path="inventory" element={<Suspense fallback={<div>Loading...</div>}><StoreInventory /></Suspense>} />
          <Route path="inventory/manage-stock" element={<Suspense fallback={<div>Loading...</div>}><StoreManageStock /></Suspense>} />
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


