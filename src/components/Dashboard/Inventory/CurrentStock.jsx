import React, { useEffect, useState } from "react";
import { useAuth } from "@/Auth";
import LoadingAnimation from "@/components/LoadingAnimation";
import ErrorModal from "@/components/ErrorModal";
import inventoryAni from "../../../images/animations/fetchingAnimation.gif";
import styles from "./Inventory.module.css";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import xls from "../../../images/xls-logo.jpg";
import pdf from "../../../images/pdf.jpg.jpg";

function CurrentStock({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    
    // Fetch warehouses and current stock
    fetchWarehouses();
  }, []);

  useEffect(() => {
    // Refetch stock when warehouse selection changes
    if (warehouses.length > 0) {
      fetchCurrentStock();
    }
  }, [selectedWarehouse, warehouses]);

  const fetchWarehouses = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const roles = userData?.roles || [];
      
      // Determine endpoint based on user role
      let endpoint = "/warehouses";
      const managerRoles = [
        "Area Business Manager",
        "Regional Business Manager",
        "Zonal Business Manager"
      ];
      
      const isAdmin = roles.includes("Admin") || roles.includes("Super Admin");
      const isManager = managerRoles.some(role => roles.includes(role));
      
      if (isManager && !isAdmin) {
        endpoint = "/warehouses/manager";
      }
      
      const res = await axiosAPI.get(endpoint);
      setWarehouses(res.data.warehouses || []);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError("Failed to load warehouses");
    }
  };

  const fetchCurrentStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = JSON.parse(localStorage.getItem("user"));
      const roles = userData?.roles || [];
      
      // Use the existing warehouse stock summary endpoint
      // For current stock, we'll use today's date as both from and to
      const today = new Date().toISOString().split('T')[0];
      
      let endpoint = "/warehouse/stock-summary";
      const params = {
        fromDate: today,
        toDate: today
      };
      
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
      
      const res = await axiosAPI.get(endpoint, { params });
      
      // Transform the data to show current stock
      if (res.data.data) {
        const stockData = res.data.data;
        let transformedStock = [];
        
        if (Array.isArray(stockData)) {
          // New format: flat array
          transformedStock = stockData.map(item => ({
            id: item.productId,
            productName: item.product?.name || item.productName || "N/A",
            productCode: item.product?.code || item.productCode || "N/A",
            warehouseName: item.warehouse?.name || item.warehouseName || "N/A",
            currentStock: item.closingStock || 0,
            unit: item.unit || "kg",
            unitPrice: item.product?.price || 0,
            lastUpdated: item.date || today
          }));
        } else {
          // Old format: nested structure - extract current stock from today's data
          const todayData = stockData[today.split('-')[0]]?.[today.split('-')[1]]?.[today.split('-')[2]];
          if (todayData) {
            transformedStock = Object.entries(todayData).map(([productId, product]) => ({
              id: productId,
              productName: product.productName || "N/A",
              productCode: product.productCode || "N/A",
              warehouseName: "Current Warehouse", // This would need to be enhanced
              currentStock: product.closing || 0,
              unit: product.primaryUnit || "kg",
              unitPrice: product.unitPrice || 0,
              lastUpdated: today
            }));
          }
        }
        
        setCurrentStock(transformedStock);
      } else {
        setCurrentStock([]);
      }
    } catch (err) {
      console.error("Error fetching current stock:", err);
      setError(err?.response?.data?.message || "Failed to load current stock");
      setCurrentStock([]);
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
    if (currentStock.length === 0) {
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

    const rows = currentStock.map((item, index) => [
      index + 1,
      item.productName,
      item.productCode,
      item.warehouseName,
      item.currentStock,
      item.unit,
      `₹${item.unitPrice}`,
      `₹${(item.currentStock * item.unitPrice).toLocaleString()}`,
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

      {/* Error Modal */}
      {error && <ErrorModal message={error} onClose={closeErrorModal} />}

      {!loading && (
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

          {/* Summary Cards */}
          {currentStock.length > 0 && (
            <div className="row m-0 p-3">
              <div className="col-md-2">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <h5 className="card-title">Total Products</h5>
                    <h3>{currentStock.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <h5 className="card-title">In Stock</h5>
                    <h3>
                      {currentStock.filter(item => item.currentStock > 0).length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-warning text-white">
                  <div className="card-body">
                    <h5 className="card-title">Low Stock</h5>
                    <h3>
                      {currentStock.filter(item => item.currentStock <= 10 && item.currentStock > 0).length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-danger text-white">
                  <div className="card-body">
                    <h5 className="card-title">Out of Stock</h5>
                    <h3>
                      {currentStock.filter(item => item.currentStock === 0).length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <h5 className="card-title">Total Value</h5>
                    <h3>
                      ₹{(currentStock.reduce((total, item) => total + (item.currentStock * item.unitPrice), 0) / 100000).toFixed(2)}L
                    </h3>
                    
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-secondary text-white">
                  <div className="card-body">
                    <h5 className="card-title">Packed Products</h5>
                    <h3>
                      {currentStock.filter(item => {
                        // Check if product name contains keywords that indicate packed products
                        const productName = (item.productName || '').toLowerCase();
                        const unit = (item.unit || '').toLowerCase();
                        
                        // Check product name for packed keywords
                        const hasPackedName = productName.includes('pack') || 
                               productName.includes('bag') || 
                               productName.includes('box') || 
                               productName.includes('container') ||
                               productName.includes('sachet') ||
                               productName.includes('bottle') ||
                               productName.includes('can') ||
                               productName.includes('jar');
                        
                        // Check unit for packed units
                        const hasPackedUnit = unit.includes('packet') || 
                               unit.includes('packets') || 
                               unit.includes('bag') || 
                               unit.includes('bags') || 
                               unit.includes('box') || 
                               unit.includes('boxes') || 
                               unit.includes('bottle') || 
                               unit.includes('bottles') || 
                               unit.includes('can') || 
                               unit.includes('cans') || 
                               unit.includes('jar') || 
                               unit.includes('jars') || 
                               unit.includes('sachet') || 
                               unit.includes('sachets') ||
                               unit.includes('container') || 
                               unit.includes('containers');
                        
                        return hasPackedName || hasPackedUnit;
                      }).length}
                    </h3>
                    <small>Packed Items</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="card bg-dark text-white">
                  <div className="card-body">
                    <h5 className="card-title">Loose Products</h5>
                    <h3>
                      {currentStock.filter(item => {
                        // Check if product name contains keywords that indicate loose products
                        const productName = (item.productName || '').toLowerCase();
                        const unit = (item.unit || '').toLowerCase();
                        
                        // Check product name for packed keywords
                        const hasPackedName = productName.includes('pack') || 
                               productName.includes('bag') || 
                               productName.includes('box') || 
                               productName.includes('container') ||
                               productName.includes('sachet') ||
                               productName.includes('bottle') ||
                               productName.includes('can') ||
                               productName.includes('jar');
                        
                        // Check unit for packed units
                        const hasPackedUnit = unit.includes('packet') || 
                               unit.includes('packets') || 
                               unit.includes('bag') || 
                               unit.includes('bags') || 
                               unit.includes('box') || 
                               unit.includes('boxes') || 
                               unit.includes('bottle') || 
                               unit.includes('bottles') || 
                               unit.includes('can') || 
                               unit.includes('cans') || 
                               unit.includes('jar') || 
                               unit.includes('jars') || 
                               unit.includes('sachet') || 
                               unit.includes('sachets') ||
                               unit.includes('container') || 
                               unit.includes('containers');
                        
                        // Loose products are those that are NOT packed
                        return !hasPackedName && !hasPackedUnit;
                      }).length}
                    </h3>
                    <small>Loose Items</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warehouse Filter */}
          <div className="row m-0 p-3">
            <div className={`col-md-3 ${styles.dateForms}`}>
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
            <div className="col-md-9 d-flex align-items-end">
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

          

          
        </div>
      )}
      {/* Stock Table */}
          {currentStock && (
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
                    {currentStock.length === 0 ? (
                      <tr>
                        <td colSpan={9}>NO DATA FOUND</td>
                      </tr>
                    ) : (
                      currentStock.map((item, index) => (
                        <tr key={item.id || index} className="animated-row">
                          <td>{index + 1}</td>
                          <td>{item.productName}</td>
                          <td>{item.productCode}</td>
                          <td>{item.warehouseName}</td>
                          <td>
                            <span className={`badge ${
                              item.currentStock > 0 ? 'bg-success' : 'bg-danger'
                            }`}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td>{item.unit}</td>
                          <td>₹{item.unitPrice}</td>
                          <td>₹{(item.currentStock * item.unitPrice).toLocaleString()}</td>
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
    </>
    
  );
}

export default CurrentStock;
