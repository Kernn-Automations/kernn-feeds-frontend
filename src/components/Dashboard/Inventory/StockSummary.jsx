import React, { useEffect, useState } from "react";
import styles from "./Inventory.module.css";
import { useAuth } from "@/Auth";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

function StockSummary({navigate}) {
  const { axiosAPI } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [stockData, setStockData] = useState([]);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  // ✅ fetch stores for filter
  useEffect(() => {
    async function fetchStores() {
      try {
        console.log("StockSummary - Fetching available stores...");
        // Use the same API as StoreSelector to get the correct list of stores for the user
        const res = await axiosAPI.get("/auth/available-stores");
        const data = res.data;
        
        // Handle transparency of response structure
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

        // Filter by Own Stores (User Requirement: "that too own stores")
        stores = stores.filter(s => s.storeType?.toLowerCase() === 'own');

        setWarehouses(stores);
        
        // If only one store is available, auto-select it
        if (stores.length === 1 && selectedStoreIds.length === 0) {
             setSelectedStoreIds([stores[0].id]);
        }
      } catch (error) {
        console.error("Failed to load store list", error);
        // Fallback to previous logic if API fails (e.g. for admins who might not use this endpoint same way)
         try {
            // ✅ Get division ID from localStorage for division filtering
            const currentDivisionId = localStorage.getItem('currentDivisionId');
            
            // ✅ Add division parameters to endpoint
            let endpoint = "/stores?limit=1000"; // Fetch all stores
            if (currentDivisionId && currentDivisionId !== '1') {
              endpoint += `&divisionId=${currentDivisionId}`;
            } else if (currentDivisionId === '1') {
              endpoint += `&showAllDivisions=true`;
            }
            
            console.log('StockSummary - Fallback fetching stores with endpoint:', endpoint);
            
            const res = await axiosAPI.get(endpoint);
            // Handle different response structures: data.stores, data.data, or direct array
            const stores = res.data.stores || res.data.data || (Array.isArray(res.data) ? res.data : []);
            setWarehouses(stores);
          } catch (fallbackError) {
             console.error("Fallback failed", fallbackError);
             setError("Failed to load store list");
             setIsModalOpen(true);
          }
      }
    }
    
    fetchStores();
  }, []);

  const fetchStock = async () => {
    if (!from || !to) {
      setError("Please select both From and To dates.");
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Use selected stores if any, otherwise use all warehouses
      const idsToUse = selectedStoreIds.length > 0 ? selectedStoreIds : warehouses.map((w) => w.id);
      const storeIdsParam = idsToUse.join(",");

      const query = `/store-stock-summary/company/summary?storeIds=${storeIdsParam}&fromDate=${from}&toDate=${to}`;

      console.log("StockSummary - Fetching stock with query:", query);

      const res = await axiosAPI.get(query);
      console.log("StockSummary - Full API response:", res);
      console.log("StockSummary - Response data:", res.data);
      setStockData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch stock data.");
      setIsModalOpen(true);
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
    if (e.target.checked) {
         setSelectedStoreIds(warehouses.map(w => w.id));
    } else {
         setSelectedStoreIds([]);
    }
  };

  const toggle = (state, setState, key) => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderTable = (products) => (
    <table className="table table-bordered borderedtable table-sm mt-2">
      <thead className="table-light">
        <tr>
          <th>Product</th>
          <th>Opening</th>
          <th>Inward</th>
          <th>Outward</th>
          <th>Closing</th>
          <th>Type</th>
          <th>Package Info</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(products).map(([productId, data]) => (
          <tr key={productId}>
            <td>{data.productName}</td>
            <td>{data.opening?.toFixed(2)}</td>
            <td>{data.inward?.toFixed(2)}</td>
            <td>{data.outward?.toFixed(2)}</td>
            <td>{data.closing?.toFixed(2)}</td>
            <td>{data.productType}</td>
            <td>
              {data.productType === "packed"
                ? `${data.packageWeight} ${data.packageWeightUnit}`
                : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // New function to render array data from the API
  const renderArrayData = (dataArray) => (
    <table className="table table-bordered borderedtable table-sm mt-2">
      <thead className="table-light">
        <tr>
          <th>Product</th>
          <th>Opening</th>
          <th>Inward</th>
          <th>Outward</th>
          <th>Stock In</th>
          <th>Stock Out</th>
          <th>Closing</th>
          <th>Opening Alt</th>
          <th>Inward Alt</th>
          <th>Outward Alt</th>
          <th>Stock In Alt</th>
          <th>Stock Out Alt</th>
          <th>Closing Alt</th>
        </tr>
      </thead>
      <tbody>
        {dataArray.map((item, index) => (
          <tr key={index}>
            <td>{item.productName || '-'}</td>
            <td>{item.openingStock?.toFixed(2)}</td>
            <td>{item.inwardStock?.toFixed(2)}</td>
            <td>{item.outwardStock?.toFixed(2)}</td>
            <td>{item.stockIn?.toFixed(2)}</td>
            <td>{item.stockOut?.toFixed(2)}</td>
            <td>{item.closingStock?.toFixed(2)}</td>
            <td>{item.openingStockPrice?.toFixed(2)}</td>
            <td>{item.inwardStockPrice?.toFixed(2)}</td>
            <td>{item.outwardStockPrice?.toFixed(2)}</td>
            <td>{item.stockInPrice?.toFixed(2)}</td>
            <td>{item.stockOutPrice?.toFixed(2)}</td>
            <td>{item.closingStockPrice?.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i> Stock Summary
      </p>

      <div className="container py-3">
        <h4 className=""> Stock Summary</h4>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className={`col-md-3 ${styles.dateForms}`}>
            <label className="form-label">From</label>
            <input
              className="form-control"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className={`col-md-3 ${styles.dateForms}`}>
            <label className="form-label">To</label>
            <input
              className="form-control"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          
          <div className={`col-md-3 ${styles.dateForms} position-relative`}>
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
                     <div className="card shadow position-absolute w-100 p-2" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                           <div className="form-check mb-0">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="selectAllStores"
                                    checked={warehouses.length > 0 && selectedStoreIds.length === warehouses.length}
                                    onChange={handleSelectAll}
                                />
                                <label className="form-check-label fw-bold" htmlFor="selectAllStores">Select All</label>
                           </div>
                           <button className="btn btn-sm btn-light text-primary" onClick={() => setIsStoreDropdownOpen(false)}>Done</button>
                        </div>
                        {warehouses.map(w => (
                            <div key={w.id} className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox"
                                    id={`store-${w.id}`}
                                    checked={selectedStoreIds.includes(w.id)}
                                    onChange={() => toggleStoreSelection(w.id)}
                                />
                                <label className="form-check-label" htmlFor={`store-${w.id}`}>{w.name}</label>
                            </div>
                        ))}
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

          <div className={`col-md-3 d-flex align-items-end`}>
           <button onClick={fetchStock} className="submitbtn">Submit</button>
           <button className="cancelbtn">Cancel</button>
          </div>
        </div>

        {/* Stock Display */}
        {Array.isArray(stockData) && stockData.length > 0 ? (
          <div className="mb-3">
            <h5 className="mb-3">Stock Summary Data</h5>
            {renderArrayData(stockData)}
          </div>
        ) : stockData && typeof stockData === 'object' && Object.keys(stockData?.hierarchy || {}).length > 0 ? (
          Object.entries(stockData.hierarchy).map(([year, yearObj]) => (
            <div key={year} className="mb-3 border rounded p-2 bg-light">
              <h5
                className="cursor-pointer mb-2"
                onClick={() => toggle(expandedYears, setExpandedYears, year)}
              >
                {expandedYears[year] ? <FaChevronDown /> : <FaChevronRight />}{" "}
                Year: {year}
              </h5>
              {expandedYears[year] && (
                <>
                  <div className="ms-3">
                    <p className="fw-semibold text-primary"> Year Total</p>
                    {renderTable(stockData.yearlyTotals[year])}
                  </div>
                  {Object.entries(yearObj).map(([month, monthObj]) => (
                    <div key={month} className="ms-4 mt-3">
                      <h6
                        className="cursor-pointer"
                        onClick={() =>
                          toggle(
                            expandedMonths,
                            setExpandedMonths,
                            `${year}-${month}`
                          )
                        }
                      >
                        {expandedMonths[`${year}-${month}`] ? (
                          <FaChevronDown />
                        ) : (
                          <FaChevronRight />
                        )}{" "}
                        Month: {month}
                      </h6>
                      {expandedMonths[`${year}-${month}`] && (
                        <>
                          <div className="ms-3">
                            <p className="fw-semibold text-success">
                              Month Total
                            </p>
                            {renderTable(
                              stockData.monthlyTotals[year]?.[month]
                            )}
                          </div>
                          {Object.entries(monthObj).map(([day, productMap]) => (
                            <div key={day} className="ms-4 mt-2">
                              <p className="fw-semibold text-secondary">{`${year}-${month}-${day}`}</p>
                              {renderTable(productMap)}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted">
            No stock data found for selected filters.
          </p>
        )}

        {loading && <Loading />}
        {isModalOpen && (
          <ErrorModal
            isOpen={isModalOpen}
            message={error}
            onClose={closeModal}
          />
        )}
      </div>
    </>
  );
}

export default StockSummary;
