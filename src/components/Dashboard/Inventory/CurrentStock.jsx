import React, { useEffect, useState } from "react";
import { useAuth } from "@/Auth";
import { useDivision } from "@/components/context/DivisionContext"; // ✅ Add division context
import LoadingAnimation from "@/components/LoadingAnimation";
import ErrorModal from "@/components/ErrorModal";
import inventoryAni from "../../../images/animations/fetchingAnimation.gif";
import styles from "./Inventory.module.css";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import xls from "../../../images/xls-logo.jpg";
import pdf from "../../../images/pdf.jpg.jpg";

function CurrentStock({ navigate }) {
  const { axiosAPI } = useAuth();
  const { selectedDivision, showAllDivisions } = useDivision(); // ✅ Add division context
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filteredStock, setFilteredStock] = useState([]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    
    // Fetch warehouses and current stock
    fetchWarehouses();
    // Also fetch current stock immediately
    fetchCurrentStock();
  }, []);

  useEffect(() => {
    // Refetch stock when warehouse selection changes
    if (warehouses.length > 0) {
      fetchCurrentStock();
    }
  }, [selectedWarehouse]);

  // ✅ Monitor division changes and refetch data when division changes
  useEffect(() => {
    const divisionId = selectedDivision?.id;
    if (divisionId) {
      fetchCurrentStock();
    }
  }, [selectedDivision?.id]);

  // Filter stock based on warehouse selection
  useEffect(() => {
    let filtered = currentStock;
    
    // Filter by warehouse
    if (selectedWarehouse !== "all") {
      const selectedWarehouseName = warehouses.find(w => w.id == selectedWarehouse)?.name;
      if (selectedWarehouseName) {
        filtered = filtered.filter(item => 
          item.warehouseName === selectedWarehouseName
        );
      }
    }
    
    setFilteredStock(filtered);
  }, [currentStock, selectedWarehouse, warehouses]);

  const fetchWarehouses = async () => {
    try {
      // Get warehouses from the inventory response instead of separate API call
      // This ensures we have the exact warehouses that have stock data
      const userData = JSON.parse(localStorage.getItem("user"));
      const roles = userData?.roles || [];
      
      // We'll get warehouses from the inventory response
      // For now, set an empty array and populate it after fetching inventory
      setWarehouses([]);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError("Failed to load warehouses");
    }
  };

  const fetchCurrentStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Get division ID from division context for proper filtering
      const divisionId = selectedDivision?.id;
      
      // ✅ Wait for division to be available
      if (!divisionId) {
        setLoading(false);
        setCurrentStock([]);
        setWarehouses([]);
        return;
      }
      
      const userData = JSON.parse(localStorage.getItem("user"));
      const roles = userData?.roles || [];
      
      // Use the correct inventory endpoint
      let endpoint = "/inventory/current-stock";
      const params = {};
      
      // ✅ Use proper division filtering logic
      if (showAllDivisions) {
        params.showAllDivisions = 'true';
      } else if (divisionId && divisionId !== 'all') {
        params.divisionId = divisionId;
      }
      
      const isAdmin = roles.includes("Admin") || roles.includes("Super Admin");
      
      if (!isAdmin) {
        // Non-admin users get stock based on their role access
        // They can only see warehouses they have access to
        if (selectedWarehouse !== "all") {
          params.warehouseId = selectedWarehouse;
        }
      } else {
        // Admin users can see all warehouses
        if (selectedWarehouse !== "all") {
          params.warehouseId = selectedWarehouse;
        }
      }
      
      let res;
      try {
        // Try the main endpoint first
        res = await axiosAPI.get(endpoint, { params });
      } catch (mainError) {
        // Try fallback endpoints
        const fallbackEndpoints = [
          "/inventory/stock",
          "/stock/current",
          "/products/stock"
        ];
        
        for (const fallbackEndpoint of fallbackEndpoints) {
          try {
            res = await axiosAPI.get(fallbackEndpoint, { params });
            break; // Success, exit loop
          } catch (fallbackError) {
            continue; // Try next endpoint
          }
        }
        
        // If all fallbacks failed, throw the original error
        if (!res) {
          throw mainError;
        }
      }
      
      // Transform the data to show current stock using the correct backend structure
      if (res.data && res.data.inventory) {
        const inventoryData = res.data.inventory;
        let transformedStock = [];
        
        if (Array.isArray(inventoryData) && inventoryData.length > 0) {
          // Transform the inventory data to match the table structure
          transformedStock = inventoryData.map((item, index) => {
            const transformed = {
              id: item.id || index,
              productName: item.product?.name || "N/A",
              productCode: item.product?.SKU || "N/A", // ✅ Use SKU from product
              warehouseName: item.warehouse?.name || "N/A",
              currentStock: parseFloat(item.stockQuantity) || 0,
              unit: item.product?.unit || "kg",
              unitPrice: parseFloat(item.product?.basePrice) || 0, // ✅ Use basePrice from product
              stockValue: parseFloat(item.stockValue) || 0, // ✅ Use stockValue from inventory
              isLowStock: item.isLowStock || false,
              stockStatus: item.stockStatus || "normal",
              lastUpdated: item.lastUpdated || new Date().toISOString(),
              productType: item.product?.productType || "unknown"
            };
            
            return transformed;
          });
          
          // Extract unique warehouses from the inventory data
          const uniqueWarehouses = [];
          const warehouseMap = new Map();
          
          inventoryData.forEach(item => {
            if (item.warehouse && item.warehouse.id && !warehouseMap.has(item.warehouse.id)) {
              warehouseMap.set(item.warehouse.id, item.warehouse);
              uniqueWarehouses.push({
                id: item.warehouse.id,
                name: item.warehouse.name
              });
            }
          });
          
          // Update warehouses state with the actual warehouses from inventory
          setWarehouses(uniqueWarehouses);
        } else {
          // ✅ No data found for this division
          setCurrentStock([]);
          setWarehouses([]);
          setError(`No inventory data found for the selected division`);
        }
        
        setCurrentStock(transformedStock);
      } else {
        setError("No inventory data in response");
        setCurrentStock([]);
        setWarehouses([]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load current stock");
      setCurrentStock([]);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseChange = (e) => {
    setSelectedWarehouse(e.target.value);
  };

  const closeErrorModal = () => {
    setError(null);
  };

  const onExport = (type) => {
    if (filteredStock.length === 0) {
      setError("No data to export");
      return;
    }

    const columnsXLS = [
      "S.No",
      "Product Name",
      "Product Code",
      "Warehouse",
      "Current Stock",
      "Unit",
      "Unit Price",
      "Total Value",
      "Last Updated"
    ];

    const rows = filteredStock.map((item, index) => [
      index + 1,
      item.productName,
      item.productCode,
      item.warehouseName,
      item.currentStock,
      item.unit,
      `₹${item.unitPrice}`,
      `₹${item.stockValue.toLocaleString()}`,
      item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A'
    ]);

    if (type === "XLS") {
      handleExportExcel(columnsXLS, rows, "Current Stock Report");
    } else if (type === "PDF") {
      handleExportPDF(columnsXLS, rows, "Current Stock Report");
    }
  };

  const isAdmin = user?.roles?.includes("Admin") || user?.roles?.includes("Super Admin");

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i> Current Stock
      </p>

      {/* Loading Animation */}
      {loading && <LoadingAnimation gif={inventoryAni} msg="Loading current stock..." />}

      {/* ✅ Show loading when waiting for division */}
      {!loading && !selectedDivision?.id && (
        <div className="container-fluid">
          <div className="row m-0 p-3">
            <div className="col text-center">
              <div className="alert alert-info">
                <strong>Please select a division to view current stock</strong>
                <br />
                <small>Waiting for division selection...</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && <ErrorModal message={error} onClose={closeErrorModal} />}

      {!loading && selectedDivision?.id && (
        <div className="container-fluid">
          {/* Header */}
          <div className="row m-0 p-3">
            <div className="col">
              <h4 className="mb-3">Current Stock</h4>
              <p className="text-muted">
                {isAdmin 
                  ? "Showing all stock across the company" 
                  : "Showing stock based on your role access"
                }
              </p>
            </div>
          </div>

          {/* ✅ Show empty state when no data */}
          {currentStock.length === 0 && !error && (
            <div className="row m-0 p-3">
              <div className="col text-center">
                <div className="alert alert-warning">
                  <strong>No inventory data found</strong>
                  <br />
                  <small>There are no products in stock for the selected division.</small>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards - Only show when there's data */}
          {currentStock.length > 0 && (
            <>
              {/* First Row - 5 main cards */}
              <div className="row m-0 p-3 justify-content-center">
                <div className="col-md-2">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Products</h5>
                      <h3>{filteredStock.length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">In Stock</h5>
                      <h3>
                        {filteredStock.filter(item => item.currentStock > 0).length}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h5 className="card-title">Low Stock</h5>
                      <h3>
                        {filteredStock.filter(item => item.isLowStock).length}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="card bg-danger text-white">
                    <div className="card-body">
                      <h5 className="card-title">Out of Stock</h5>
                      <h3>
                        {filteredStock.filter(item => item.currentStock === 0).length}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Value</h5>
                      <h3>
                        ₹{(filteredStock.reduce((total, item) => total + item.stockValue, 0) / 100000).toFixed(2)}L
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row - 2 centered small horizontal cards */}
              <div className="row m-0 p-3 justify-content-center">
                <div className="col-md-3">
                  <div className="card bg-secondary text-white">
                    <div className="card-body text-center">
                      <h6 className="card-title mb-1">Packed Products</h6>
                      <h4 className="mb-0">
                        {filteredStock.filter(item => item.productType === "packed").length}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-dark text-white">
                    <div className="card-body text-center">
                      <h6 className="card-title mb-1">Loose Products</h6>
                      <h4 className="mb-0">
                        {filteredStock.filter(item => item.productType === "loose").length}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Search and Filter Section - Only show when there's data */}
          {currentStock.length > 0 && (
            <div className="row m-0 p-3">
              <div className="col-md-3">
                <label htmlFor="warehouseSelect" className="form-label">
                  Warehouse
                </label>
                <select
                  id="warehouseSelect"
                  className="form-select"
                  value={selectedWarehouse}
                  onChange={handleWarehouseChange}
                >
                  <option value="all">-- All Warehouses --</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name || warehouse.warehouseName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button 
                  className="submitbtn me-2"
                  onClick={fetchCurrentStock}
                >
                  Submit
                </button>
                <button 
                  className="cancelbtn"
                  onClick={() => navigate('/inventory')}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Stock Table - Only show when there's data */}
          {currentStock.length > 0 && (
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
              <div className="col-lg-10">
                <table className="table table-hover table-bordered borderedtable">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Product Name</th>
                      <th>Product Code</th>
                      <th>Warehouse</th>
                      <th>Current Stock</th>
                      <th>Unit</th>
                      <th>Unit Price</th>
                      <th>Total Value</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.length === 0 ? (
                      <tr>
                        <td colSpan={9}>NO DATA FOUND</td>
                      </tr>
                    ) : (
                      filteredStock.map((item, index) => (
                        <tr key={item.id || index} className="animated-row">
                          <td>{index + 1}</td>
                          <td>{item.productName}</td>
                          <td>{item.productCode}</td>
                          <td>{item.warehouseName}</td>
                          <td>
                            <span className={`badge ${
                              item.isLowStock 
                                ? 'bg-warning' 
                                : item.currentStock > 0 
                                  ? 'bg-success' 
                                  : 'bg-danger'
                            }`}>
                              {item.currentStock}
                            </span>
                            {item.isLowStock && (
                              <small className="text-warning d-block">Low Stock</small>
                            )}
                          </td>
                          <td>{item.unit}</td>
                          <td>₹{item.unitPrice}</td>
                          <td>₹{item.stockValue.toLocaleString()}</td>
                          <td>
                            {item.lastUpdated 
                              ? new Date(item.lastUpdated).toLocaleDateString()
                              : 'N/A'
                            }
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
    
  );
}

export default CurrentStock;
