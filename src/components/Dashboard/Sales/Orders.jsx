import React, { useEffect, useState } from "react";
import styles from "./Sales.module.css";
import OrdersViewModal from "./OrdersViewModal";
import xls from "./../../../images/xls-png.png";
import pdf from "./../../../images/pdf-png.png";

import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import orderAni from "../../../images/animations/confirmed.gif";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";
import CustomSearchDropdown from "@/utils/CustomSearchDropDown";
import FiltersForSales from "./FiltersForSales";

function Orders({
  navigate,
  warehouses,
  customers,
  setOrderId,
  from,
  setFrom,
  to,
  setTo,
}) {
  const [searchParams] = useSearchParams();
  const [onsubmit, setonsubmit] = useState(false);

  const [warehouse, setWarehouse] = useState();
  const [customer, setCustomer] = useState();
  const [trigger, setTrigger] = useState(false);
  const [status, setStatus] = useState(searchParams.get('status') || '');

  // Filters to divisions
  const [divisionId, setDivisionId] = useState();
  const [zoneId, setZoneId] = useState();
  const [subZoneId, setSubZoneId] = useState();
  const [teamsId, setTeamsId] = useState();
  const [employeeId, setEmployeeId] = useState();

  // Serial number base will be computed per page for continuous numbering

  // backend -----------------
  const [orders, setOrders] = useState([]); // Initialize as empty array

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [pageTotalsByPage, setPageTotalsByPage] = useState({});

  // Add search state variables for searchable fields
  const [dateSearchTerm, setDateSearchTerm] = useState("");
  const [showDateSearch, setShowDateSearch] = useState(false);
  const [orderIdSearchTerm, setOrderIdSearchTerm] = useState("");
  const [showOrderIdSearch, setShowOrderIdSearch] = useState(false);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [showWarehouseSearch, setShowWarehouseSearch] = useState(false);
  const [customerIdSearchTerm, setCustomerIdSearchTerm] = useState("");
  const [showCustomerIdSearch, setShowCustomerIdSearch] = useState(false);
  const [customerNameSearchTerm, setCustomerNameSearchTerm] = useState("");
  const [showCustomerNameSearch, setShowCustomerNameSearch] = useState(false);
  const [paymentModeSearchTerm, setPaymentModeSearchTerm] = useState("");
  const [showPaymentModeSearch, setShowPaymentModeSearch] = useState(false);

  // Handle URL parameter changes for status filter
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatus(statusParam);
      setTrigger(prev => !prev); // Trigger data refetch
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetch() {
      try {
        setOrders(null);
        setLoading(true);

        // ✅ Get division ID from localStorage for division filtering
        const currentDivisionId = localStorage.getItem("currentDivisionId");
        const currentDivisionName = localStorage.getItem("currentDivisionName");

        // ✅ Handle "All Warehouses" option - don't send warehouseId parameter
        let warehouseParam = "";
        if (warehouse && warehouse !== "all") {
          warehouseParam = `&warehouseId=${warehouse}`;
        }

        // ✅ Add division parameters to prevent wrong division data
        let divisionParam = "";
        if (currentDivisionId && currentDivisionId !== "1") {
          divisionParam = `&divisionId=${currentDivisionId}`;
        } else if (currentDivisionId === "1") {
          divisionParam = `&showAllDivisions=true`;
        }

        console.log(
          "Orders - Fetching orders with warehouse filter:",
          warehouse
        );
        console.log("Orders - Warehouse parameter:", warehouseParam);
        console.log("Orders - Division ID:", currentDivisionId);
        console.log("Orders - Division Name:", currentDivisionName);
        console.log("Orders - Division parameters added:", divisionParam);

        const query = `/sales-orders?fromDate=${from}&toDate=${to}${warehouseParam}${divisionParam}${
          customer ? `&customerId=${customer}` : ""
        }${status ? `&status=${status}` : ""}&page=${pageNo}&limit=${limit}${divisionId ? `&divisionId=${divisionId}` : ""}${zoneId ? `&zoneId=${zoneId}` : ""}${subZoneId ? `&subZoneId=${subZoneId}` : ""}${teamsId ? `&teamId=${teamsId}` : ""}${employeeId ? `&employeeId=${employeeId}` : ""}`;

        console.log("Orders - Final query:", query);

        const res = await axiosAPI.get(query);
        console.log(res, limit);
        const ordersData = res.data.salesOrders || res.data.orders || res.data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setTotalPages(res.data.totalPages);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [trigger, pageNo, limit, status]);

  // Add ESC key functionality to exit search mode
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (showDateSearch) {
          setShowDateSearch(false);
          setDateSearchTerm("");
        }
        if (showOrderIdSearch) {
          setShowOrderIdSearch(false);
          setOrderIdSearchTerm("");
        }
        if (showWarehouseSearch) {
          setShowWarehouseSearch(false);
          setWarehouseSearchTerm("");
        }
        if (showCustomerIdSearch) {
          setShowCustomerIdSearch(false);
          setCustomerIdSearchTerm("");
        }
        if (showCustomerNameSearch) {
          setShowCustomerNameSearch(false);
          setCustomerNameSearchTerm("");
        }
        if (showPaymentModeSearch) {
          setShowPaymentModeSearch(false);
          setPaymentModeSearchTerm("");
        }
      }
    };

    if (
      showDateSearch ||
      showOrderIdSearch ||
      showWarehouseSearch ||
      showCustomerIdSearch ||
      showCustomerNameSearch ||
      showPaymentModeSearch
    ) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [
    showDateSearch,
    showOrderIdSearch,
    showWarehouseSearch,
    showCustomerIdSearch,
    showCustomerNameSearch,
    showPaymentModeSearch,
  ]);

  // Add click outside functionality to exit search mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any of the search headers
      const dateHeader = document.querySelector("[data-date-header]");
      const orderIdHeader = document.querySelector("[data-orderid-header]");
      const warehouseHeader = document.querySelector("[data-warehouse-header]");
      const customerIdHeader = document.querySelector(
        "[data-customerid-header]"
      );
      const customerNameHeader = document.querySelector(
        "[data-customername-header]"
      );
      const paymentModeHeader = document.querySelector(
        "[data-paymentmode-header]"
      );

      if (showDateSearch && dateHeader && !dateHeader.contains(event.target)) {
        setShowDateSearch(false);
        setDateSearchTerm("");
      }

      if (
        showOrderIdSearch &&
        orderIdHeader &&
        !orderIdHeader.contains(event.target)
      ) {
        setShowOrderIdSearch(false);
        setOrderIdSearchTerm("");
      }

      if (
        showWarehouseSearch &&
        warehouseHeader &&
        !warehouseHeader.contains(event.target)
      ) {
        setShowWarehouseSearch(false);
        setWarehouseSearchTerm("");
      }

      if (
        showCustomerIdSearch &&
        customerIdHeader &&
        !customerIdHeader.contains(event.target)
      ) {
        setShowCustomerIdSearch(false);
        setCustomerIdSearchTerm("");
      }

      if (
        showCustomerNameSearch &&
        customerNameHeader &&
        !customerNameHeader.contains(event.target)
      ) {
        setShowCustomerNameSearch(false);
        setCustomerNameSearchTerm("");
      }

      if (
        showPaymentModeSearch &&
        paymentModeHeader &&
        !paymentModeHeader.contains(event.target)
      ) {
        setShowPaymentModeSearch(false);
        setPaymentModeSearchTerm("");
      }
    };

    if (
      showDateSearch ||
      showOrderIdSearch ||
      showWarehouseSearch ||
      showCustomerIdSearch ||
      showCustomerNameSearch ||
      showPaymentModeSearch
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showDateSearch,
    showOrderIdSearch,
    showWarehouseSearch,
    showCustomerIdSearch,
    showCustomerNameSearch,
    showPaymentModeSearch,
  ]);

  const onSubmit = () => {
    // console.log(from, to, warehouse, customer);
    setTrigger(trigger ? false : true);
  };

  // GrandTotal
  const GrandTotal = () => {
    let total = 0;
    for (const order of orders) {
      if (order.paymentRequest?.status === "Approved")
        total += order?.totalAmount;
    }

    return total;
  };

  // Quantity
  const Qty = (items) => {
    if (!Array.isArray(items)) return 0; // Safeguard for undefined or non-array
    let kgs = 0;
    for (const item of items) {
      if (item?.product?.productType === "packed") {
        if (item?.unit === "kg") {
          kgs += item.quantity * item?.product?.packageWeight;
        } else if (item?.unit === "tons") {
          kgs += (item.quantity * item?.product?.packageWeight) / 1000;
        }
      } else if (item?.product?.productType === "loose") {
        if (item?.unit === "kg") {
          kgs += item.quantity;
        } else if (item?.unit === "tons") {
          kgs += item.quantity / 1000;
        }
      }
    }
    return kgs / 1000;
  };

  // Apply table header search filters to a given orders array
  const applyFilters = (ordersList = []) => {
    let filtered = ordersList;

    if (
      dateSearchTerm ||
      orderIdSearchTerm ||
      warehouseSearchTerm ||
      customerIdSearchTerm ||
      customerNameSearchTerm ||
      paymentModeSearchTerm
    ) {
      filtered = ordersList.filter((order) => {
        let pass = true;

        if (dateSearchTerm) {
          const orderDate = order.createdAt ? order.createdAt.slice(0, 10) : "";
          if (!orderDate.includes(dateSearchTerm)) pass = false;
        }

        if (orderIdSearchTerm) {
          const orderId = order.orderNumber || "";
          if (!orderId.toLowerCase().includes(orderIdSearchTerm.toLowerCase()))
            pass = false;
        }

        if (warehouseSearchTerm) {
          const warehouseName = order.warehouse?.name || "";
          if (!warehouseName.toLowerCase().includes(warehouseSearchTerm.toLowerCase()))
            pass = false;
        }

        if (customerIdSearchTerm) {
          const customerId = order.customer?.customer_id || "";
          if (!customerId.toLowerCase().includes(customerIdSearchTerm.toLowerCase()))
            pass = false;
        }

        if (customerNameSearchTerm) {
          const customerName = order.customer?.name || "";
          if (!customerName.toLowerCase().includes(customerNameSearchTerm.toLowerCase()))
            pass = false;
        }

        if (paymentModeSearchTerm) {
          const paymentMode = "UPI";
          if (!paymentMode.toLowerCase().includes(paymentModeSearchTerm.toLowerCase()))
            pass = false;
        }

        return pass;
      });
    }

    return filtered;
  };

  // Page Totals (Value, Bags, Tons) based on currently loaded page
  const getPageTotals = (source = orders) => {
    let totalValue = 0;
    let totalBags = 0;
    let totalTons = 0;

    if (!Array.isArray(source)) return { totalValue, totalBags, totalTons };

    for (const order of source) {
      // Value (sum of all orders in the current page)
      if (typeof order?.totalAmount === "number") {
        totalValue += order.totalAmount;
      }

      // Tons
      totalTons += Qty(order?.items) || 0;

      // Bags (only for packed products)
      if (Array.isArray(order?.items)) {
        for (const item of order.items) {
          const productType = item?.product?.productType;
          const unit = item?.unit;
          const packageWeight = item?.product?.packageWeight || 0; // in kg

          if (productType === "packed") {
            if (unit === "kg") {
              // Treat quantity as number of bags when unit is 'kg'
              totalBags += Number(item?.quantity) || 0;
            } else if (unit === "tons") {
              // Convert tons to bags using package weight (kg per bag)
              if (packageWeight > 0) {
                const bags = ((Number(item?.quantity) || 0) * 1000) / packageWeight;
                totalBags += bags;
              }
            }
          }
        }
      }
    }

    return { totalValue, totalBags, totalTons };
  };

  // Reset accumulated page totals when filters or page size change
  useEffect(() => {
    setPageTotalsByPage({});
  }, [
    from,
    to,
    warehouse,
    customer,
    status,
    divisionId,
    zoneId,
    subZoneId,
    teamsId,
    employeeId,
    limit,
    dateSearchTerm,
    orderIdSearchTerm,
    warehouseSearchTerm,
    customerIdSearchTerm,
    customerNameSearchTerm,
    paymentModeSearchTerm,
  ]);

  // Cache current page totals (after applying header filters)
  useEffect(() => {
    const filteredOrders = applyFilters(orders || []);
    const totals = getPageTotals(filteredOrders);
    setPageTotalsByPage((prev) => ({ ...prev, [pageNo]: totals }));
  }, [orders, pageNo, dateSearchTerm, orderIdSearchTerm, warehouseSearchTerm, customerIdSearchTerm, customerNameSearchTerm, paymentModeSearchTerm]);

  // pdf code -----------------------------------

  const [tableData, setTableData] = useState([]);
  const [xltable, setXltable] = useState([]);

  const onExport = (type) => {
    const arr = [];
    let x = 1;
    const columns = [
      "S.No",
      "Date",
      "Order ID",
      "Warehouse Name",
      "Customer ID",
      "Customer Name",
      "Firm Name",
      "Qty",
      "TNX Amount",
      "Payment Mode",
      "Status",
    ];

    // const xlarr = [];
    // columns = [
    //   "S.No",
    //   "Date",
    //   "Order ID"
    // ]
    if (orders && orders.length > 0) {
      orders.map((order) =>
        arr.push({
          "S.No": x++,
          Date: order.createdAt.slice(0, 10),
          "Order ID": order.orderNumber,
          "Warehouse Name": order.warehouse?.name,
          "Customer ID": order.customer?.customer_id,
          "Customer Name": order.customer?.name,
          "Firm Name":
            order.customer?.firmName || order.customer?.firm_name || "N/A",
          Qty: `${Qty(order.items)} Tons`,
          "TNX Amount": order.totalAmount,
          "Payment Mode": "UPI",
          Status: order.orderStatus,
        })
      );
      setTableData(arr);

      const total = GrandTotal();

      if (type === "PDF") handleExportPDF(columns, tableData, "Orders", total);
      else if (type === "XLS") handleExportExcel(columns, tableData, "Orders");
    } else {
      setError("Table is Empty");
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/sales")}>Sales</span>{" "}
        <i class="bi bi-chevron-right"></i> Orders
      </p>

      <div className="row m-0 p-3">
        {/* <div className={`col-3 formcontent`}>
          <button
            className="homebtn"
            onClick={() => navigate("/warehouses/order-transfer")}
          >
            Order Transfer
          </button>
        </div> */}
        <div className={`col-3 formcontent`}>
          <label htmlFor="">From :</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">To :</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <CustomSearchDropdown
          label="Warehouse"
          onSelect={setWarehouse}
          options={warehouses?.map((w) => ({ value: w.id, label: w.name }))}
        />

        {/* <div className={`col-3 formcontent`}>
          <label htmlFor="">Product :</label>
          <select name="" id="">
            <option value="">--select--</option>
            {products && products.map((product) => <option value={product.id}>{product.name}</option>)}
          </select>
        </div> */}
        <CustomSearchDropdown
          label="Customers"
          onSelect={setCustomer}
          options={customers?.map((c) => ({ value: c.id, label: c.name }))}
        />

        <div className={`col-3 formcontent`}>
          <label htmlFor="">Status :</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="pendingPaymentApprovals">Payment Pending</option>
          </select>
        </div>
        {/* Filters for divisions */}
        <FiltersForSales
          divisionId={divisionId}
          employeeId={employeeId}
          setDivisionId={setDivisionId}
          setEmployeeId={setEmployeeId}
          setSubZoneId={setSubZoneId}
          setTeamsId={setTeamsId}
          setZoneId={setZoneId}
          subZoneId={subZoneId}
          teamsId={teamsId}
          zoneId={zoneId}
        />
      </div>

      <div className="row m-0 p-3 justify-content-center">
        {/* Submit/Cancel buttons centered */}
        <div className="col-12 d-flex justify-content-center">
          <div className="d-flex gap-3">
            <button className="submitbtn" onClick={onSubmit}>
              Submit
            </button>
            <button className="cancelbtn" onClick={() => navigate("/sales")}>
              Cancel
            </button>
          </div>
        </div>

        {/* Status Legend - Single row with 6 icons */}
        <div className="col-12 d-flex justify-content-center mt-3">
          <div className="d-flex gap-4">
            <div className="d-flex align-items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#F3C623"
              >
                <path d="m619.05-287.55 53.21-52.73-153.98-154.68v-192.67h-72.56v221.97l173.33 178.11ZM480.02-73.3q-83.95 0-158.12-32.01-74.18-32-129.38-87.2-55.2-55.19-87.21-129.36Q73.3-396.04 73.3-479.98q0-83.95 32.04-158.14 32.04-74.19 87.19-129.35 55.16-55.15 129.33-87.27 74.18-32.12 158.14-32.12 83.96 0 158.14 32.12 74.17 32.12 129.33 87.27 55.15 55.16 87.27 129.33 32.12 74.18 32.12 158.14 0 83.96-32.12 158.14-32.12 74.17-87.27 129.33-55.16 55.15-129.33 87.19Q563.97-73.3 480.02-73.3Z" />
              </svg>
              <span>Awaiting Payment</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#0065F8"
              >
                <path d="M189.06-73.3q-31.5 0-53.63-22.13-22.13-22.13-22.13-53.63v-470.98q-17.57-8.91-28.78-26.25-11.22-17.34-11.22-39.29v-125.36q0-31.56 22.13-53.74 22.13-22.18 53.63-22.18h661.88q31.56 0 53.74 22.18 22.18 22.18 22.18 53.74v125.36q0 21.95-11.3 39.27-11.29 17.33-28.7 26.27v470.98q0 31.5-22.18 53.63Q802.5-73.3 770.94-73.3H189.06Zm-40-612.28h662.12v-125.36H149.06v125.36Zm207.51 277.03h247.1v-71.93h-247.1v71.93Z" />
              </svg>
              <span>Confirmed</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#F3C623"
              >
                <path d="M231.01-154.53q-49.89 0-85.36-34.37-35.46-34.37-36.1-84.3H33.86v-457.18q0-31 22.38-53.38 22.38-22.38 53.38-22.38h572.66v161.56h108.09l135.77 181.02v190.36h-77.27q-.8 49.93-36.18 84.3-35.39 34.37-85.28 34.37t-85.35-34.37q-35.47-34.37-36.1-84.3H352.22q-.79 49.58-36.06 84.12-35.26 34.55-85.15 34.55Zm-.08-69.85q21.66 0 36.83-15.17 15.17-15.17 15.17-36.83 0-21.67-15.17-36.84-15.17-15.16-36.83-15.16-21.67 0-36.84 15.16-15.16 15.17-15.16 36.84 0 21.66 15.16 36.83 15.17 15.17 36.84 15.17Zm496.4 0q21.67 0 36.84-15.17 15.16-15.17 15.16-36.83 0-21.67-15.16-36.84-15.17-15.16-36.84-15.16-21.66 0-36.83 15.16-15.17 15.17-15.17 36.84 0 21.66 15.17 36.83 15.17 15.17 36.83 15.17ZM682.28-430h174.21l-104-138.67h-70.21V-430Z" />
              </svg>
              <span>Dispatched</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#5CB338"
              >
                <path d="m342.62-51.47-77.51-132.04-151.86-32.06 16.48-150.28L31.23-480l98.5-113.49-16.48-150.44 151.86-31.89 77.51-132.71L480-846.75l137.54-61.78 78.02 132.71 151.19 31.89-16.48 150.44L928.77-480l-98.5 114.15 16.48 150.28-151.19 32.06-78.02 132.04L480-113.25 342.62-51.47Zm94.71-290.38 228.82-227.48-51.06-48.74-177.76 176.58-91.76-94.23-51.72 51.05 143.48 142.82Z" />
              </svg>
              <span>Delivered</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#EA3323"
              >
                <path d="M586.96-484.33 666.63-564l-58.87-60.39-80.43 80.43 59.63 59.63Zm256.37 256.37L742.89-328.39l-5.76-68.81 72.8-82.8-72.8-84.8 9.52-111.05-108.56-23.52-57.29-95.04L480-750.65l-102.8-43.76-36.29 63.04-66.89-66.89 66.63-112.02L480-850.85l139.35-59.43 77.67 131.35 147.83 32.71-14.48 151.59L930.52-480 830.37-365.37l12.96 137.41ZM379.2-165.59 480-209.35l102.8 43.76 34.9-58.98-145.13-145.36L438-335.37 293.37-480l58.87-58.87L438-454.63l-25.3 25.06-194.87-194.86 5.04 59.63-72.8 84.8 72.8 82.8-9.52 113.05 108.56 23.52 57.29 95.04ZM340.65-49.72l-77.67-131.35-147.83-32.71 14.48-151.59L29.48-480l100.15-114.63-12.24-130.24-68.32-68.33 58.63-58.39L853.98-105.3l-58.63 58.39-111.76-111.76-64.24 108.95L480-109.15 340.65-49.72Zm186.68-494.24ZM383.76-458.5Z" />
              </svg>
              <span>Cancelled</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#EA7300"
              >
                <path d="M314.39-149.06h331.22v-122.27q0-69.05-48.28-117-48.29-47.95-117.33-47.95-69.04 0-117.33 47.95-48.28 47.95-48.28 117v122.27ZM153.3-73.3v-75.76h85.34v-122.22q0-66.92 35.01-123.18 35.01-56.26 94.34-85.54-59.33-29.94-94.34-86.2-35.01-56.26-35.01-123.19v-121.55H153.3v-75.92h653.56v75.92h-85.34v121.55q0 66.93-34.97 123.19-34.97 56.26-94.38 86.2 59.41 29.28 94.38 85.54 34.97 56.26 34.97 123.18v122.22h85.34v75.76H153.3Z" />
              </svg>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>

      {orders && (
        <div className="row m-0 p-3 justify-content-around">
          <div className="col-lg-5">
            <button className={styles.xls} onClick={() => onExport("XLS")}>
              <p>Export to </p>
              <img src={xls} alt="" />
            </button>
            <button className={styles.xls} onClick={() => onExport("PDF")}>
              <p>Export to </p>
              <img src={pdf} alt="" />
            </button>
          </div>
          <div className={`col-lg-3 ${styles.entity}`}>
            <label htmlFor="">Entity :</label>
            <select
              name=""
              id=""
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="col-lg-10">
            <table className={`table table-hover table-bordered borderedtable`}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th
                    data-date-header
                    onClick={() => setShowDateSearch(!showDateSearch)}
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    {showDateSearch ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Search Date..."
                          value={dateSearchTerm}
                          onChange={(e) => setDateSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "2px 5px",
                            fontSize: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "3px",
                            width: "120px",
                            color: "#000",
                            backgroundColor: "#fff",
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDateSearchTerm("");
                            setShowDateSearch(false);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      "Date"
                    )}
                  </th>
                  <th
                    data-orderid-header
                    onClick={() => setShowOrderIdSearch(!showOrderIdSearch)}
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    {showOrderIdSearch ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Search Order ID..."
                          value={orderIdSearchTerm}
                          onChange={(e) => setOrderIdSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "2px 5px",
                            fontSize: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "3px",
                            width: "120px",
                            color: "#000",
                            backgroundColor: "#fff",
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderIdSearchTerm("");
                            setShowOrderIdSearch(false);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      "Order ID"
                    )}
                  </th>

                  <th
                    data-warehouse-header
                    onClick={() => setShowWarehouseSearch(!showWarehouseSearch)}
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    {showWarehouseSearch ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Search Warehouse..."
                          value={warehouseSearchTerm}
                          onChange={(e) =>
                            setWarehouseSearchTerm(e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "2px 5px",
                            fontSize: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "3px",
                            width: "120px",
                            color: "#000",
                            backgroundColor: "#fff",
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWarehouseSearchTerm("");
                            setShowWarehouseSearch(false);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      "Warehouse Name"
                    )}
                  </th>

                  <th>Division</th>
                  <th>Zone</th>
                  <th>Sub Zone</th>
                  <th>Team</th>
                  <th>Employees</th>

                  <th
                    data-customername-header
                    onClick={() =>
                      setShowCustomerNameSearch(!showCustomerNameSearch)
                    }
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    {showCustomerNameSearch ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Search Customer Name..."
                          value={customerNameSearchTerm}
                          onChange={(e) =>
                            setCustomerNameSearchTerm(e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "2px 5px",
                            fontSize: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "3px",
                            width: "120px",
                            color: "#000",
                            backgroundColor: "#fff",
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerNameSearchTerm("");
                            setShowCustomerNameSearch(false);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      "Customer Name"
                    )}
                  </th>

                  <th>Qunatity</th>
                  <th>TNX Amount</th>

                  <th>Status</th>
                </tr>
                {/* Search results counter row */}
                {(dateSearchTerm ||
                  orderIdSearchTerm ||
                  warehouseSearchTerm ||
                  customerIdSearchTerm ||
                  customerNameSearchTerm ||
                  paymentModeSearchTerm) && (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        textAlign: "center",
                        fontStyle: "italic",
                        color: "#666",
                        padding: "8px",
                      }}
                    >
                      {(() => {
                        const filteredOrders = applyFilters(orders || []);
                        return `Showing ${filteredOrders.length} result(s)`;
                      })()}
                    </td>
                  </tr>
                )}
              </thead>
              <tbody>
                {(() => {
                  const filteredOrders = applyFilters(orders || []);

                  if (filteredOrders.length === 0) {
                    return (
                      <tr>
                        <td colSpan={10}>NO DATA FOUND</td>
                      </tr>
                    );
                  }

                  const pageSize = Number(limit) || 10;
                  const startSerial = (pageNo - 1) * pageSize + 1;
                  return filteredOrders.map((order, i) => (
                    <tr
                      key={order.id}
                      className="animated-row"
                      style={{ animationDelay: `${(i + 1) * 0.1}s` }}
                    >
                      <td>{startSerial + i}</td>
                      <td>
                        {order.createdAt ? order.createdAt.slice(0, 10) : ""}
                      </td>
                      <td>{order.orderNumber}</td>
                      <td>{order.warehouse?.name}</td>
                      <td>{order.hierarchy?.division}</td>
                      <td>{order.hierarchy?.zone}</td>
                      <td>{order.hierarchy?.subZone}</td>
                      <td>{order.hierarchy?.team}</td>
                      <td>{order.hierarchy?.employee}</td>

                      <td>{order.customer?.name}</td>

                      <td>{Qty(order.items)} Tons</td>
                      <td>{order.totalAmount}</td>

                      <td
                        className={styles.imageCol}
                        onClick={() => {
                          setOrderId(order.id);
                          navigate("/sales/tracking");
                        }}
                      >
                        {order.orderStatus === "awaitingPaymentConfirmation" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#F3C623"
                            >
                              <path d="m619.05-287.55 53.21-52.73-153.98-154.68v-192.67h-72.56v221.97l173.33 178.11ZM480.02-73.3q-83.95 0-158.12-32.01-74.18-32-129.38-87.2-55.2-55.19-87.21-129.36Q73.3-396.04 73.3-479.98q0-83.95 32.04-158.14 32.04-74.19 87.19-129.35 55.16-55.15 129.33-87.27 74.18-32.12 158.14-32.12 83.96 0 158.14 32.12 74.17 32.12 129.33 87.27 55.15 55.16 87.27 129.33 32.12 74.18 32.12 158.14 0 83.96-32.12 158.14-32.12 74.17-87.27 129.33-55.16 55.15-129.33 87.19Q563.97-73.3 480.02-73.3Z" />
                            </svg>
                          </p>
                        ) : order.orderStatus === "Confirmed" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#0065F8"
                            >
                              <path d="M189.06-73.3q-31.5 0-53.63-22.13-22.13-22.13-22.13-53.63v-470.98q-17.57-8.91-28.78-26.25-11.22-17.34-11.22-39.29v-125.36q0-31.56 22.13-53.74 22.13-22.18 53.63-22.18h661.88q31.56 0 53.74 22.18 22.18 22.18 22.18 53.74v125.36q0 21.95-11.3 39.27-11.29 17.33-28.7 26.27v470.98q0 31.5-22.18 53.63Q802.5-73.3 770.94-73.3H189.06Zm-40-612.28h662.12v-125.36H149.06v125.36Zm207.51 277.03h247.1v-71.93h-247.1v71.93Z" />
                            </svg>
                          </p>
                        ) : order.orderStatus === "Dispatched" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#F3C623"
                            >
                              <path d="M231.01-154.53q-49.89 0-85.36-34.37-35.46-34.37-36.1-84.3H33.86v-457.18q0-31 22.38-53.38 22.38-22.38 53.38-22.38h572.66v161.56h108.09l135.77 181.02v190.36h-77.27q-.8 49.93-36.18 84.3-35.39 34.37-85.28 34.37t-85.35-34.37q-35.47-34.37-36.1-84.3H352.22q-.79 49.58-36.06 84.12-35.26 34.55-85.15 34.55Zm-.08-69.85q21.66 0 36.83-15.17 15.17-15.17 15.17-36.83 0-21.67-15.17-36.84-15.17-15.16-36.83-15.16-21.67 0-36.84 15.16-15.16 15.17-15.16 36.84 0 21.66 15.16 36.83 15.17 15.17 36.84 15.17Zm496.4 0q21.67 0 36.84-15.17 15.16-15.17 15.16-36.83 0-21.67-15.16-36.84-15.17-15.16-36.84-15.16-21.66 0-36.83 15.16-15.17 15.17-15.17 36.84 0 21.66 15.17 36.83 15.17 15.17 36.83 15.17ZM682.28-430h174.21l-104-138.67h-70.21V-430Z" />
                            </svg>
                          </p>
                        ) : order.orderStatus === "Delivered" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#5CB338"
                            >
                              <path d="m342.62-51.47-77.51-132.04-151.86-32.06 16.48-150.28L31.23-480l98.5-113.49-16.48-150.44 151.86-31.89 77.51-132.71L480-846.75l137.54-61.78 78.02 132.71 151.19 31.89-16.48 150.44L928.77-480l-98.5 114.15 16.48 150.28-151.19 32.06-78.02 132.04L480-113.25 342.62-51.47Zm94.71-290.38 228.82-227.48-51.06-48.74-177.76 176.58-91.76-94.23-51.72 51.05 143.48 142.82Z" />
                            </svg>
                          </p>
                        ) : order.orderStatus === "Cancelled" ? (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#EA3323"
                            >
                              <path d="M586.96-484.33 666.63-564l-58.87-60.39-80.43 80.43 59.63 59.63Zm256.37 256.37L742.89-328.39l-5.76-68.81 72.8-82.8-72.8-84.8 9.52-111.05-108.56-23.52-57.29-95.04L480-750.65l-102.8-43.76-36.29 63.04-66.89-66.89 66.63-112.02L480-850.85l139.35-59.43 77.67 131.35 147.83 32.71-14.48 151.59L930.52-480 830.37-365.37l12.96 137.41ZM379.2-165.59 480-209.35l102.8 43.76 34.9-58.98-145.13-145.36L438-335.37 293.37-480l58.87-58.87L438-454.63l-25.3 25.06-194.87-194.86 5.04 59.63-72.8 84.8 72.8 82.8-9.52 113.05 108.56 23.52 57.29 95.04ZM340.65-49.72l-77.67-131.35-147.83-32.71 14.48-151.59L29.48-480l100.15-114.63-12.24-130.24-68.32-68.33 58.63-58.39L853.98-105.3l-58.63 58.39-111.76-111.76-64.24 108.95L480-109.15 340.65-49.72Zm186.68-494.24ZM383.76-458.5Z" />
                            </svg>
                          </p>
                        ) : (
                          <p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="40px"
                              viewBox="0 -960 960 960"
                              width="40px"
                              fill="#EA7300"
                            >
                              <path d="M314.39-149.06h331.22v-122.27q0-69.05-48.28-117-48.29-47.95-117.33-47.95-69.04 0-117.33 47.95-48.28 47.95-48.28 117v122.27ZM153.3-73.3v-75.76h85.34v-122.22q0-66.92 35.01-123.18 35.01-56.26 94.34-85.54-59.33-29.94-94.34-86.2-35.01-56.26-35.01-123.19v-121.55H153.3v-75.92h653.56v75.92h-85.34v121.55q0 66.93-34.97 123.19-34.97 56.26-94.38 86.2 59.41 29.28 94.38 85.54 34.97 56.26 34.97 123.18v122.22h85.34v75.76H153.3Z" />
                            </svg>
                          </p>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            {orders.length > 0 && (() => {
              // Sum totals from page 1 to current page
              const cumulative = Array.from({ length: pageNo }, (_, i) => pageTotalsByPage[i + 1])
                .filter(Boolean)
                .reduce(
                  (acc, t) => ({
                    totalValue: acc.totalValue + (t.totalValue || 0),
                    totalBags: acc.totalBags + (t.totalBags || 0),
                    totalTons: acc.totalTons + (t.totalTons || 0),
                  }),
                  { totalValue: 0, totalBags: 0, totalTons: 0 }
                );
              const { totalValue, totalBags, totalTons } = cumulative;
              const formattedValue = (totalValue || 0).toLocaleString();
              const formattedBags = Math.round(totalBags || 0);
              const formattedTons = (totalTons || 0).toFixed(3);
              return (
                <div className="d-flex justify-content-end pe-0 py-2 w-100">
                  <table className="table table-borderless table-sm w-auto mb-0 text-center ms-auto" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th className="px-3 text-center">Total</th>
                        <th className="px-3 text-center">Number of bags</th>
                        <th className="px-3 text-center">Weight in Tons</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-3 text-center align-middle">{formattedValue}</td>
                        <td className="px-3 text-center align-middle">{formattedBags}</td>
                        <td className="px-3 text-center align-middle">{formattedTons}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}

            <div className="row m-0 p-0 pt-3 justify-content-between">
              <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
                {pageNo > 1 && (
                  <button onClick={() => setPageNo(pageNo - 1)}>
                    <span>
                      <FaArrowLeftLong />
                    </span>{" "}
                    Previous
                  </button>
                )}
              </div>
              <div className={`col-2 m-0 p-0 ${styles.buttonbox}`}>
                {pageNo < totalPages && (
                  <button onClick={() => setPageNo(pageNo + 1)}>
                    Next{" "}
                    <span>
                      <FaArrowRightLong />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <LoadingAnimation gif={orderAni} />}
    </>
  );
}

export default Orders;
