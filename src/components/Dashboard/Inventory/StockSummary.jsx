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
  const [warehouseId, setWarehouseId] = useState();
  const [stockData, setStockData] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    axiosAPI
      .get("/warehouse")
      .then((res) => setWarehouses(res.data.warehouses || []))
      .catch(() => {
        setError("Failed to load warehouse list");
        setIsModalOpen(true);
      });
  }, []);

  const fetchStock = async () => {
    if (!from || !to) {
      setError("Please select both From and To dates.");
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const query = `/warehouse/stock-summary?fromDate=${from}&toDate=${to}${warehouseId ? `&warehouseId=${warehouseId}` : ""}`;
      const res = await axiosAPI.get(query);
      console.log(res);
      setStockData(res.data.data || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch stock data.");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
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
          <div className={`col-md-3 ${styles.dateForms}`}>
            <label className="form-label">Warehouse</label>
            <select
              className="form-select"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <option value="">-- All Warehouses --</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className={`col-md-3 d-flex align-items-end`}>
           <button onClick={fetchStock} className="submitbtn">Submit</button>
           <button className="cancelbtn">Cancel</button>
          </div>
        </div>

        {/* Stock Display */}
        {Object.keys(stockData?.hierarchy || {}).length > 0 ? (
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
