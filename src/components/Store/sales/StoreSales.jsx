import React, { useState, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";
import { isStoreEmployee, isStoreManager, isAdmin } from "../../../utils/roleUtils";
import storeService from "../../../services/storeService";
import StoreSalesOrders from "./StoreSalesOrders";
const StoreCreateSale = lazy(() => import("./StoreCreateSale"));

export default function StoreSales() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const [payload, setPayload] = useState({ storeId: "", customerId: "", items: [], payments: [], notes: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isEmployee = isStoreEmployee(user);
  const isManager = isStoreManager(user);
  const isAdminUser = isAdmin(user);
  const canUseCreateFlow = isEmployee || isManager || isAdminUser;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOpenCreate = async () => {
    if (canUseCreateFlow) {
      setSearchParams({ mode: "create" });
      return;
    }
    setLoading(true);
    try {
      const resp = await storeService.createSale(payload);
      setResult(resp);
    } catch (e) {
      alert(e?.message || "Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrders = () => {
    setSearchParams({ mode: "orders" });
  };

  const handleBackToOverview = () => {
    setSearchParams({});
  };

  if (mode === "orders") {
    return <StoreSalesOrders onBack={handleBackToOverview} />;
  }

  if (canUseCreateFlow && mode === "create") {
    return (
      <Suspense fallback={<div>Loading Create Sale...</div>}>
        <StoreCreateSale />
      </Suspense>
    );
  }

  return (
    <div style={{ padding: isMobile ? '12px 8px' : undefined }}>
      {/* Buttons: show only Create Sale for store employees; show all for others */}
      {canUseCreateFlow ? (
        <div className="row m-0 p-2" style={{ marginBottom: '24px' }}>
          <div
            className="col"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              ...(isMobile && {
                flexDirection: 'row',
                gap: '6px',
                paddingLeft: '8px',
                paddingRight: '8px',
                marginLeft: '0',
                width: '100%'
              }),
              ...(!isMobile && {
                gap: '10px'
              })
            }}
          >
            <button 
              className="homebtn" 
              onClick={handleOpenOrders}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1',
                ...(isMobile ? {
                  padding: '6px 8px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  flex: '0 0 calc(33.333% - 4px)',
                  maxWidth: 'calc(33.333% - 4px)',
                  width: 'calc(33.333% - 4px)',
                  minHeight: '32px',
                  boxSizing: 'border-box',
                  whiteSpace: 'normal',
                  margin: 0
                } : {
                  padding: '12px 24px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap'
                })
              }}
            >
              Sales Orders
            </button>
            <button 
              className="homebtn" 
              disabled={loading} 
              onClick={handleOpenCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1',
                ...(isMobile ? {
                  padding: '6px 8px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  flex: '0 0 calc(33.333% - 4px)',
                  maxWidth: 'calc(33.333% - 4px)',
                  width: 'calc(33.333% - 4px)',
                  minHeight: '32px',
                  boxSizing: 'border-box',
                  whiteSpace: 'normal',
                  margin: 0
                } : {
                  padding: '12px 24px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap'
                })
              }}
            >
              Create Sale
            </button>
          </div>
        </div>
      ) : (
        <div className="row m-0 p-2" style={{ marginBottom: '24px' }}>
          <div
            className="col"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              ...(isMobile && {
                flexDirection: 'row',
                gap: '6px',
                paddingLeft: '8px',
                paddingRight: '8px',
                marginLeft: '0',
                width: '100%'
              }),
              ...(!isMobile && {
                gap: '10px'
              })
            }}
          >
            <button 
              className="homebtn" 
              onClick={handleOpenOrders}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1',
                ...(isMobile ? {
                  padding: '6px 8px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  flex: '0 0 calc(33.333% - 4px)',
                  maxWidth: 'calc(33.333% - 4px)',
                  width: 'calc(33.333% - 4px)',
                  minHeight: '32px',
                  boxSizing: 'border-box',
                  whiteSpace: 'normal',
                  margin: 0
                } : {
                  padding: '12px 24px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap'
                })
              }}
            >
              Sales Orders
            </button>
            <button 
              className="homebtn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1',
                ...(isMobile ? {
                  padding: '6px 8px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  flex: '0 0 calc(33.333% - 4px)',
                  maxWidth: 'calc(33.333% - 4px)',
                  width: 'calc(33.333% - 4px)',
                  minHeight: '32px',
                  boxSizing: 'border-box',
                  whiteSpace: 'normal',
                  margin: 0
                } : {
                  padding: '12px 24px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap'
                })
              }}
            >
              Returned Orders
            </button>
            <button 
              className="homebtn" 
              disabled={loading} 
              onClick={handleOpenCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1',
                ...(isMobile ? {
                  padding: '6px 8px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  flex: '0 0 calc(33.333% - 4px)',
                  maxWidth: 'calc(33.333% - 4px)',
                  width: 'calc(33.333% - 4px)',
                  minHeight: '32px',
                  boxSizing: 'border-box',
                  whiteSpace: 'normal',
                  margin: 0
                } : {
                  padding: '12px 24px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap'
                })
              }}
            >
              Create Sale
            </button>
          </div>
        </div>
      )}

      {/* Mini Dashboards */}
      <Flex wrap="wrap" justify="space-between" px={2}>
        <ReusableCard title="Today Orders" value={"12"} />
        <ReusableCard title="Today Sales" value={"₹45,680"} color="green.500" />
        <ReusableCard title="Returns Today" value={"2"} color="red.500" />
        <ReusableCard title="This Month" value={"₹3,21,400"} color="blue.500" />
      </Flex>

      {result && <pre style={{ marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}


