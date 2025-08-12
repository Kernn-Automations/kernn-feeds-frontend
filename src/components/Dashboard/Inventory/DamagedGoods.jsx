import React, { useEffect, useState } from "react";
import styles from "./Inventory.module.css";
import { useAuth } from "@/Auth";
import shadows from "@mui/material/styles/shadows";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";

function DamagedGoods({ navigate }) {
  const [warehouses, setWarehouses] = useState();
  const [products, setProducts] = useState();
  const [orders, setOrders] = useState([]); // Initialize as empty array

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [warehouse, setWarehouse] = useState("");
  const [product, setProduct] = useState("");
  const [order, setOrder] = useState("");
  const [trigger, setTrigger] = useState();
  const [filterError, setFilterError] = useState("");

  const [goods, setGoods] = useState();

  // Pagination state
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // View modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const openViewModal = (item) => {
    console.log('Opening view modal for item:', item);
    console.log('Image fields:', {
      proofFilePath: item.proofFilePath,
      proofFileSignedUrl: item.proofFileSignedUrl,
      imageFile: item.imageFile,
      image: item.image
    });
    console.log('Full item object:', JSON.stringify(item, null, 2));
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedItem(null);
  };

  // Reset page number when limit changes
  useEffect(() => {
    setPageNo(1);
  }, [limit]);

  // Global refresh function for damaged goods
  const refreshDamagedGoods = async () => {
    try {
      setLoading(true);
      const res = await axiosAPI.get(`/damaged-goods?page=${pageNo}&limit=${limit}`);
      console.log('🔄 Refreshing damaged goods...');
      console.log('Damaged goods API response:', res.data);
      console.log('Damaged goods items:', Array.isArray(res.data.damagedGoods) ? res.data.damagedGoods : res.data);
      setGoods(Array.isArray(res.data.damagedGoods) ? res.data.damagedGoods : res.data);
      setTotalPages(res.data.totalPages || 1);
      console.log('✅ Damaged goods refreshed successfully');
    } catch (e) {
      console.error('❌ Error refreshing damaged goods:', e);
      setError(e.response?.data?.message);
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Set global function for other components to use
  React.useEffect(() => {
    window.refreshDamagedGoods = refreshDamagedGoods;
    return () => {
      delete window.refreshDamagedGoods;
    };
  }, [pageNo, limit, trigger]);

  // On initial mount, fetch ALL damaged goods (no filters)
  useEffect(() => {
    async function fetchAllDamagedGoods() {
      try {
        setLoading(true);
        const res = await axiosAPI.get(`/damaged-goods?page=${pageNo}&limit=${limit}`);
        console.log('🔄 Fetching damaged goods...');
        console.log('Damaged goods API response:', res.data);
        console.log('Damaged goods items:', Array.isArray(res.data.damagedGoods) ? res.data.damagedGoods : res.data);
        setGoods(Array.isArray(res.data.damagedGoods) ? res.data.damagedGoods : res.data);
        setTotalPages(res.data.totalPages || 1);
      } catch (e) {
        console.error('❌ Error fetching damaged goods:', e);
        setError(e.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAllDamagedGoods();
  }, [pageNo, limit, trigger]); // Added trigger to dependencies

  // Fetch orders when warehouse or product changes
  useEffect(() => {
    if (!warehouse || !product) {
      setOrders([]);
      return;
    }
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await axiosAPI.get(`/purchases?warehouseId=${warehouse}&productId=${product}`);
        setOrders(Array.isArray(res.data.purchaseOrders) ? res.data.purchaseOrders : []);
        console.log(res)
      } catch (e) {
        setError(e.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [warehouse, product]);

  // Fetch dropdown data for filters on mount
  useEffect(() => {
    async function fetchDropdowns() {
      try {
        setLoading(true);
        const [w, p, o] = await Promise.all([
          axiosAPI.get("/warehouses"),
          axiosAPI.get("/products/list"),
          axiosAPI.get("/purchases?limit=100")
        ]);
        setWarehouses(w.data.warehouses);
        setProducts(p.data.products);
        setOrders(Array.isArray(o.data.purchaseOrders) ? o.data.purchaseOrders : []);
      } catch (e) {
        setError(e.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchDropdowns();
  }, []);



  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i> Damaged Goods
      </p>

      <div className="row m-0 p-3">
        
        <div className={`col-3 formcontent`}>
          <label htmlFor="">WareHouse :</label>
          <select
            name=""
            id=""
            value={warehouse || ""}
            onChange={(e) => setWarehouse(e.target.value === "null" ? "" : e.target.value)}
          >
            <option value="null">--select--</option>
            {warehouses &&
              warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Product :</label>
          <select
            name=""
            id=""
            value={product || ""}
            onChange={(e) => setProduct(e.target.value === "null" ? "" : e.target.value)}
          >
            <option value="null">--select--</option>
            {products &&
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
          </select>
        </div>

        <div className={`col-3 formcontent`}>
          <label htmlFor="">Order :</label>
          <select
            name=""
            id=""
            value={order || ""}
            onChange={(e) => setOrder(e.target.value === "null" ? "" : e.target.value)}
          >
            <option value="null">--select--</option>
            {orders &&
              orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.ordernumber}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Submit/Cancel Buttons */}
      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className="col-3">
          <button
            className="submitbtn"
            onClick={async () => {
              // At least one filter must be selected
              if (!warehouse && !product && !order) {
                setFilterError("Select at least one filter (Warehouse, Product, or Order)");
                return;
              }
              setFilterError("");
              setLoading(true);
              try {
                let query = "/damaged-goods";
                if (warehouse && !product && !order) {
                  // Use the correct endpoint for warehouse filtering only
                  query = `/damaged-goods/warehouse/${warehouse}`;
                } else {
                  let params = [];
                  if (warehouse) params.push(`warehouseId=${warehouse}`);
                  if (product) params.push(`productId=${product}`);
                  if (order) params.push(`orderId=${order}`);
                  if (params.length > 0) {
                    query += `?${params.join("&")}`;
                  }
                }
                const res = await axiosAPI.get(query);
                setGoods(Array.isArray(res.data.damagedGoods) ? res.data.damagedGoods : res.data);
              } catch (e) {
                setError(e.response?.data?.message || "Failed to fetch damaged goods");
                setIsModalOpen(true);
              } finally {
                setLoading(false);
              }
            }}
          >
            Submit
          </button>
          <button
            className="cancelbtn"
            onClick={() => navigate("/inventory")}
          >
            Cancel
          </button>
        </div>
      </div>
      {filterError && (
        <div className="row m-0 p-0 justify-content-center">
          <div className="col-6 text-danger text-center">{filterError}</div>
        </div>
      )}

      {/* Damaged Goods Table */}
      <div className="row m-0 p-3 justify-content-center">
        <div className="col-lg-10">
          {/* Entity Limit */}
          <div className="row m-0 p-0 mb-3 justify-content-end">
            <div className="col-lg-2">
              <label htmlFor="">Entity :</label>
              <select
                name=""
                id=""
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

                    <table className="table table-bordered borderedtable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Damage Quantity</th>
                <th>Warehouse</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {goods && goods.length > 0 ? (
                goods
                  .filter(item => {
                    // Enable filters: warehouse, product, order
                    let pass = true;
                    if (warehouse) {
                      // Try both warehouseId and item.warehouse?.id
                      const itemWarehouseId = item.warehouseId || (item.warehouse && item.warehouse.id);
                      if (String(itemWarehouseId) !== String(warehouse)) pass = false;
                    }
                    if (product) {
                      // Try both productId and item.product?.id
                      const itemProductId = item.productId || (item.product && item.product.id);
                      if (String(itemProductId) !== String(product)) pass = false;
                    }
                    if (order) {
                      if (String(item.purchaseOrderId) !== String(order)) pass = false;
                    }
                    return pass;
                  })
                  .map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.date ? item.date.slice(0, 10) : (item.createdAt ? item.createdAt.slice(0, 10) :"-") }</td>
                      <td>{item.productName || item.product?.name || ""}</td>
                      <td>{item.damagedQuantity || item.damageQuantity || item.quantity || ""}</td>
                      <td>{item.warehouseName || item.warehouse?.name || ""}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openViewModal(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">No Damaged Goods Found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
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

      {/* View Modal */}
      {isViewModalOpen && selectedItem && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Damaged Goods Details</h5>
                <button type="button" className="btn-close" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Date:</strong> {selectedItem.date ? selectedItem.date.slice(0, 10) : (selectedItem.createdAt ? selectedItem.createdAt.slice(0, 10) : "-")}</p>
                    <p><strong>Product ID:</strong> {selectedItem.productId || selectedItem.product?.id || "-"}</p>
                    <p><strong>Product Name:</strong> {selectedItem.productName || selectedItem.product?.name || "-"}</p>
                    <p><strong>Damaged Quantity:</strong> {selectedItem.damagedQuantity || selectedItem.damageQuantity || selectedItem.quantity || "-"}</p>
                    <p><strong>Reason:</strong> {selectedItem.reason || selectedItem.damageReason || "-"}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Reported By:</strong> {selectedItem.reportedByName || selectedItem.user?.name || "-"}</p>
                    <p><strong>Warehouse:</strong> {selectedItem.warehouseName || selectedItem.warehouse?.name || "-"}</p>
                    <p><strong>Warehouse ID:</strong> {selectedItem.warehouseId || selectedItem.warehouse?.id || "-"}</p>
                  </div>
                </div>
                
                {/* Damage Proof Images Section */}
                <div className="mt-3">
                  <h6>Damage Proof Images:</h6>
                  {(() => {
                    // Check multiple possible image field names
                    const possibleImageFields = [
                      'proofFileSignedUrl',
                      'proofFilePath', 
                      'signedImageUrls',
                      'imageFile',
                      'image',
                      'proofImage',
                      'imageUrl',
                      'fileUrl',
                      'photo',
                      'photoUrl'
                    ];
                    
                    let imageUrl = null;
                    let fieldName = null;
                    
                    // Find the first field that has a valid image URL
                    for (const field of possibleImageFields) {
                      const value = selectedItem[field];
                      if (value && 
                          value !== null && 
                          value !== 'null' && 
                          value !== undefined &&
                          value.trim() !== '' &&
                          (typeof value === 'string' || value.url)) {
                        imageUrl = typeof value === 'string' ? value : value.url;
                        fieldName = field;
                        break;
                      }
                    }
                    
                    console.log('🔍 Debug - Image field check:');
                    console.log('  - Found image URL:', imageUrl);
                    console.log('  - Field name:', fieldName);
                    console.log('  - All possible fields:', possibleImageFields.map(field => ({
                      field,
                      value: selectedItem[field],
                      type: typeof selectedItem[field]
                    })));
                    
                    if (imageUrl) {
                      return (
                        <div className="row">
                          <div className="col-md-4 mb-2">
                            <img 
                              src={imageUrl} 
                              alt="Damage Proof" 
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => window.open(imageUrl, '_blank')}
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrl);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <p className="text-muted small mt-1" style={{ display: 'none' }}>
                              Image failed to load: {imageUrl}
                            </p>
                            <p className="text-muted small mt-1">Damage Proof Image (from {fieldName})</p>
                          </div>
                        </div>
                      );
                    } else {
                      return <p className="text-muted">No damage proof images available for this report.</p>;
                    }
                  })()}
                </div>

                {/* Debug Information */}
                <div className="mt-3">
                  <p className="text-muted small">Debug Info:</p>
                  <p className="text-muted small">proofFileSignedUrl: {selectedItem.proofFileSignedUrl || 'null'}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for modal */}
      {isViewModalOpen && (
        <div className="modal-backdrop fade show"></div>
      )}
      
    </>
  );
}

export default DamagedGoods;
