import React, { useEffect, useState } from "react";
import { useAuth } from "@/Auth";
import { useDivision } from "@/components/context/DivisionContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import ErrorModal from "@/components/ErrorModal";
import inventoryAni from "../../../images/animations/fetchingAnimation.gif";
import styles from "./Inventory.module.css";
import { handleExportExcel, handleExportPDF } from "@/utils/PDFndXLSGenerator";
import xls from "../../../images/xls-logo.jpg";
import pdf from "../../../images/pdf.jpg.jpg";

function CurrentStock({ navigate }) {
  const { axiosAPI } = useAuth();
  const { selectedDivision, showAllDivisions } = useDivision();
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filteredStock, setFilteredStock] = useState([]);
  const [limit, setLimit] = useState(10);

  // Add search state variables for searchable fields
  const [productNameSearchTerm, setProductNameSearchTerm] = useState("");
  const [showProductNameSearch, setShowProductNameSearch] = useState(false);
  const [productCodeSearchTerm, setProductCodeSearchTerm] = useState("");
  const [showProductCodeSearch, setShowProductCodeSearch] = useState(false);


  // Add debugging logs
  useEffect(() => {
    console.log('CurrentStock - Component mounted');
    console.log('CurrentStock - Initial state:', {
      selectedDivision,
      showAllDivisions,
      user: !!user
    });
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    console.log('CurrentStock - User data loaded:', userData);
    
    // Initial fetch is handled by the useEffect dependent on selectedWarehouse
  }, []);

  // Fetch available stores based on division
  useEffect(() => {
    async function fetchStores() {
      try {
        console.log("CurrentStock - Fetching available stores...");
        const res = await axiosAPI.get("/auth/available-stores");
        const data = res.data;
        
        let stores = [];
        if (data.success && Array.isArray(data.data)) {
            stores = data.data;
        } else if (Array.isArray(data.stores)) {
            stores = data.stores;
        } else if (Array.isArray(data)) {
            stores = data;
        }

        // Filter by Division
        const currentDivisionId = localStorage.getItem('currentDivisionId');
        if (currentDivisionId && currentDivisionId !== '1' && currentDivisionId !== 'all') {
             stores = stores.filter(s => s.division?.id?.toString() === currentDivisionId.toString());
        }

        // Filter by Own Stores (matching StockSummary logic)
        stores = stores.filter(s => s.storeType?.toLowerCase() === 'own');

        setWarehouses(stores);
        
        // If only one store is available, auto-select it
        if (stores.length === 1 && selectedStoreIds.length === 0) {
             setSelectedStoreIds([stores[0].id]);
        }
      } catch (error) {
        console.error("Failed to load store list", error);
        // Fallback logic
         try {
            const currentDivisionId = localStorage.getItem('currentDivisionId');
            let endpoint = "/stores?limit=1000"; 
            if (currentDivisionId && currentDivisionId !== '1') {
              endpoint += `&divisionId=${currentDivisionId}`;
            } else if (currentDivisionId === '1') {
              endpoint += `&showAllDivisions=true`;
            }
            
            const res = await axiosAPI.get(endpoint);
            const stores = res.data.stores || res.data.data || (Array.isArray(res.data) ? res.data : []);
            setWarehouses(stores);
          } catch (fallbackError) {
             console.error("Fallback failed", fallbackError);
             setError("Failed to load store list");
          }
      }
    }
    
    fetchStores();
  }, []);

  useEffect(() => {
    // We only fetch on mount (handled above) and division change (handled below).
    // Warehouse selection is handled via client-side filtering of the full dataset.
  }, []);

  // Monitor division changes and refetch data when division changes
  useEffect(() => {
    console.log('CurrentStock - Division changed:', {
      selectedDivision,
      divisionId: selectedDivision?.id,
      showAllDivisions
    });
    
    const divisionId = selectedDivision?.id;
    if (divisionId) {
      console.log('CurrentStock - Fetching stock for division:', divisionId);
      fetchCurrentStock();
    } else if (showAllDivisions) {
      console.log('CurrentStock - Showing all divisions, fetching stock');
      fetchCurrentStock();
    } else {
      console.log('CurrentStock - No division ID available, clearing stock');
      setCurrentStock([]);
      setWarehouses([]);
    }
  }, [selectedDivision?.id, showAllDivisions]);

  // Add a fallback effect to fetch data if no division is selected after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!selectedDivision?.id && !showAllDivisions && currentStock.length === 0) {
        console.log('CurrentStock - No division selected after delay, trying to fetch data anyway');
        fetchCurrentStock();
      }
    }, 3000); // Wait 3 seconds before trying to fetch without division

    return () => clearTimeout(timer);
  }, [selectedDivision?.id, showAllDivisions, currentStock.length]);

  // Filter stock based on warehouse selection and search terms
  useEffect(() => {
    let filtered = currentStock;
    
    // Filter by Product Name search
    if (productNameSearchTerm) {
      filtered = filtered.filter(item => 
        item.productName.toLowerCase().includes(productNameSearchTerm.toLowerCase())
      );
    }
    
    // Filter by Product Code search
    if (productCodeSearchTerm) {
      filtered = filtered.filter(item => 
        item.productCode.toLowerCase().includes(productCodeSearchTerm.toLowerCase())
      );
    }
    

    
    setFilteredStock(filtered);
    console.log('CurrentStock - Stock filtered:', {
      originalCount: currentStock.length,
      filteredCount: filtered.length,
      productNameSearchTerm,
      productCodeSearchTerm
    });
  }, [currentStock, productNameSearchTerm, productCodeSearchTerm]);

  // Add ESC key functionality to exit search mode
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showProductNameSearch) {
          setShowProductNameSearch(false);
          setProductNameSearchTerm("");
        }
        if (showProductCodeSearch) {
          setShowProductCodeSearch(false);
          setProductCodeSearchTerm("");
        }
      }
    };

    if (showProductNameSearch || showProductCodeSearch) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showProductNameSearch, showProductCodeSearch]);

  // Add click outside functionality to exit search mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any of the search headers
      const productNameHeader = document.querySelector('[data-productname-header]');
      const productCodeHeader = document.querySelector('[data-productcode-header]');
      
      if (showProductNameSearch && productNameHeader && !productNameHeader.contains(event.target)) {
        setShowProductNameSearch(false);
        setProductNameSearchTerm("");
      }
      
      if (showProductCodeSearch && productCodeHeader && !productCodeHeader.contains(event.target)) {
        setShowProductCodeSearch(false);
        setProductCodeSearchTerm("");
      }
    };

    if (showProductNameSearch || showProductCodeSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProductNameSearch, showProductCodeSearch]);

  /* 
   * Fetch Current Stock
   * Uses /stores/admin/inventory endpoint as requested
   * Dynamically extracts warehouse list from the response
   */
  const fetchCurrentStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryBase = `/stores/admin/inventory`;
      let query = queryBase;

      if (selectedStoreIds.length > 0) {
        query += `?storeIds=${selectedStoreIds.join(",")}`;
      }
      
      console.log('CurrentStock - Fetching stock with query:', query);

      const res = await axiosAPI.get(query);
      console.log('CurrentStock - API Response:', res.data);

      const inventoryData = res.data.data || []; 

      if (Array.isArray(inventoryData)) {
          const transformedStock = inventoryData.map((item, index) => ({
            id: item.id || index,
            // Capture store ID for filtering
            storeId: item.storeId || item.warehouseId || item.id, 
            productName: item.productName || item.product?.name || "N/A",
            productCode: item.productCode || item.product?.SKU || "N/A",
            warehouseName: item.warehouseName || item.storeName || "N/A", 
            currentStock: parseFloat(item.stock || item.currentStock || item.quantity) || 0,
            unit: item.product?.unit || item.unit || "units",
            unitPrice: parseFloat(item.product?.basePrice || item.basePrice || item.price || item.unitPrice) || 0,
            stockValue: parseFloat(item.stockValue || (item.stock * item.price)) || 0,
            isLowStock: item.isLowStock || false,
            stockStatus: item.stockStatus || "normal",
            lastUpdated: item.lastUpdated || new Date().toISOString(),
            productType: item.productType || "packed" 
          }));
          
          setCurrentStock(transformedStock);
          setFilteredStock(transformedStock);
          
      } else {
          setCurrentStock([]);
          setFilteredStock([]);
      }

    } catch (err) {
      console.error("CurrentStock - Error fetching stock:", err);
      setError(err.response?.data?.message || "Failed to load current stock");
    } finally {
      setLoading(false);
    }
  };



  const toggleStoreSelection = (id) => {
    setSelectedStoreIds(prev =>
        prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
      // Logic handled directly in onClick for "Select All" / "Deselect All" text
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
        <i className="bi bi-chevron-right"></i> Current Stock
      </p>

      {/* Loading Animation */}
      {loading && <LoadingAnimation gif={inventoryAni} msg="Loading current stock..." />}

      {/* Show loading when waiting for division */}
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

          {/* Show empty state when no data */}
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
          {(currentStock.length > 0 || warehouses.length > 0) && (
            <div className="row m-0 p-3">
              <div className="col-md-3 position-relative">
                <label className="form-label">Stores</label>
                <div className="dropdown">
                     <button 
                        className="form-select text-start" 
                        type="button"
                        onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                     >
                        {selectedStoreIds.length === 0 ? "All Stores" : `${selectedStoreIds.length} Selected`}
                     </button>
                     {isStoreDropdownOpen && (
                         <div className="card shadow position-absolute w-100 p-0" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                            <div className="d-flex justify-content-between align-items-center border-bottom p-2 bg-light sticky-top">
                               <div 
                                    className="cursor-pointer fw-bold text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        if (warehouses.length > 0 && selectedStoreIds.length === warehouses.length) {
                                            setSelectedStoreIds([]);
                                        } else {
                                            setSelectedStoreIds(warehouses.map(w => w.id));
                                        }
                                    }}
                               >
                                    {warehouses.length > 0 && selectedStoreIds.length === warehouses.length ? "Deselect All" : "Select All"}
                               </div>
                               <button className="btn btn-sm btn-light text-primary" onClick={() => setIsStoreDropdownOpen(false)}>Done</button>
                            </div>
                            <ul className="list-group list-group-flush">
                            {warehouses.map(w => {
                                const isSelected = selectedStoreIds.includes(w.id);
                                return (
                                <li 
                                    key={w.id} 
                                    className={`list-group-item cursor-pointer ${isSelected ? 'bg-primary text-white' : ''}`}
                                    onClick={() => toggleStoreSelection(w.id)}
                                >
                                    {w.name}
                                </li>
                                );
                            })}
                            </ul>
                         </div>
                     )}
                </div>
                {isStoreDropdownOpen && (
                     <div 
                        className="position-fixed top-0 start-0 w-100 h-100" 
                        style={{ zIndex: 999 }} 
                        onClick={() => setIsStoreDropdownOpen(false)}
                     ></div>
                )}
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

          {/* Selected Stores Tags */}
          {selectedStoreIds.length > 0 && (
              <div className="row m-0 px-3 pb-3">
                  <div className="col">
                      <div className="d-flex flex-wrap gap-2">
                          {selectedStoreIds.map(id => {
                              const store = warehouses.find(w => w.id === id);
                              if (!store) return null;
                              return (
                                  <span key={id} className="badge bg-secondary d-flex align-items-center p-2">
                                      {store.name}
                                      <span 
                                          className="ms-2 cursor-pointer text-white" 
                                          style={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                                          onClick={() => toggleStoreSelection(id)}
                                      >
                                          &times;
                                      </span>
                                  </span>
                              );
                          })}
                          {selectedStoreIds.length > 0 && (
                              <span 
                                  className="badge bg-danger d-flex align-items-center p-2 cursor-pointer"
                                  onClick={() => setSelectedStoreIds([])}
                              >
                                  Clear All
                              </span>
                          )}
                      </div>
                  </div>
              </div>
          )}

          
          {/* Stock Table - Only show when there's data */}
          {currentStock.length > 0 && (
            <div className="row m-0 p-3 justify-content-around">

              <div className="col-lg-7">
                <button className={styles.xls} onClick={() => onExport("XLS")}>
                  <p>Export to </p>
                  <img src={xls} alt="" />
                </button>
                <button className={styles.xls} onClick={() => onExport("PDF")}>
                  <p>Export to </p>
                  <img src={pdf} alt="" />
                </button>
              </div>
              <div className={`col-lg-2 ${styles.entity}`}>
                <label htmlFor="">Entity :</label>
                <select
                  name=""
                  id=""
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={40}>40</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="col-lg-10">
                <table className="table table-hover table-bordered borderedtable">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th 
                        onClick={() => setShowProductNameSearch(!showProductNameSearch)}
                        style={{ cursor: 'pointer', position: 'relative' }}
                        data-productname-header
                      >
                        {showProductNameSearch ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Search by product name..."
                              value={productNameSearchTerm}
                              onChange={(e) => setProductNameSearchTerm(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '2px 6px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                minWidth: '120px',
                                height: '28px',
                                color: '#000',
                                backgroundColor: '#fff'
                              }}
                              autoFocus
                            />
                            {productNameSearchTerm && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductNameSearchTerm("");
                                }}
                                style={{
                                  padding: '4px 8px',
                                  border: '1px solid #dc3545',
                                  borderRadius: '4px',
                                  background: '#dc3545',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  minWidth: '24px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            Product Name
                          </>
                        )}
                      </th>
                      <th 
                        onClick={() => setShowProductCodeSearch(!showProductCodeSearch)}
                        style={{ cursor: 'pointer', position: 'relative' }}
                        data-productcode-header
                      >
                        {showProductCodeSearch ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="Search by product code..."
                              value={productCodeSearchTerm}
                              onChange={(e) => setProductCodeSearchTerm(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '2px 6px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                minWidth: '120px',
                                height: '28px',
                                color: '#000',
                                backgroundColor: '#fff'
                              }}
                              autoFocus
                            />
                            {productCodeSearchTerm && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductCodeSearchTerm("");
                                }}
                                style={{
                                  padding: '4px 8px',
                                  border: '1px solid #dc3545',
                                  borderRadius: '4px',
                                  background: '#dc3545',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  minWidth: '24px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            Product Code
                          </>
                        )}
                      </th>

                      <th>Current Stock</th>
                      <th>Unit</th>
                      <th>Unit Price</th>
                      <th>Total Value</th>
                      <th>Last Updated</th>
                    </tr>
                    {(showProductNameSearch && productNameSearchTerm) || (showProductCodeSearch && productCodeSearchTerm) ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '8px', fontSize: '12px', color: '#666', backgroundColor: '#f8f9fa' }}>
                          {filteredStock ? `${filteredStock.length} item(s) found` : 'Searching...'}
                        </td>
                      </tr>
                    ) : null}
                  </thead>
                  <tbody>
                    {filteredStock.length === 0 ? (
                      <tr>
                        <td colSpan={8}>NO DATA FOUND</td>
                      </tr>
                    ) : (
                      filteredStock.slice(0, limit).map((item, index) => (
                        <tr key={item.id || index} className="animated-row">
                          <td>{index + 1}</td>
                          <td>{item.productName}</td>
                          <td>{item.productCode}</td>

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
                              ? new Date(item.lastUpdated).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                }).split('/').join('-')
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
