import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/Auth";
import styles from "../../Dashboard/Customers/Customer.module.css";
import tableStyles from "../../Dashboard/Purchases/Purchases.module.css";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import storeService from "../../../services/storeService";

function CreateIndent({ navigate }) {
  const { axiosAPI } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    storeId: "",
    notes: "",
    priority: "normal",
    expectedDate: ""
  });
  
  const [items, setItems] = useState([
    { productId: "", quantity: "", unit: "" }
  ]);

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await storeService.getStores();
      setStores(res.stores || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching stores");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const currentDivisionId = localStorage.getItem('currentDivisionId');
      let endpoint = "/products/list";
      if (currentDivisionId && currentDivisionId !== '1') {
        endpoint += `?divisionId=${currentDivisionId}`;
      }
      const response = await axiosAPI.get(endpoint);
      
      let productsData = [];
      if (response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      }
      
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Error fetching products");
      setIsModalOpen(true);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-populate unit when product is selected
    if (field === "productId" && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        // Check for unit in different possible fields
        const unit = selectedProduct.unit || 
                     selectedProduct.units || 
                     selectedProduct.packageWeightUnit || 
                     selectedProduct.measurementUnit || 
                     "";
        newItems[index].unit = unit;
      }
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: "", unit: "" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!form.storeId) {
        throw new Error("Please select a store");
      }
      
      if (items.length === 0 || items.some(item => !item.productId || !item.quantity)) {
        throw new Error("Please add at least one product with quantity");
      }

      // Prepare items array
      const indentItems = items
        .filter(item => item.productId && item.quantity)
        .map(item => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity),
          unit: item.unit || "units"
        }));

      const payload = {
        storeId: form.storeId,
        items: indentItems,
        notes: form.notes || "",
        priority: form.priority,
        expectedDate: form.expectedDate || null
      };

      const res = await storeService.createIndent(payload);
      alert(res.message || "Indent created successfully");
      navigate("/store/indents");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Indent creation failed");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/store/indents")}>Indents</span>{" "}
        <i className="bi bi-chevron-right"></i> Create Indent
      </p>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Indent Details</h5>
        
        {/* Store Selection */}
        <div className={`col-3 ${styles.longform}`}>
          <label>Store :</label>
          <select
            value={form.storeId}
            onChange={(e) => handleChange("storeId", e.target.value)}
            required
          >
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name || store.storeName || `Store ${store.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className={`col-3 ${styles.longform}`}>
          <label>Priority :</label>
          <select
            value={form.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Expected Date */}
        <div className={`col-3 ${styles.longform}`}>
          <label>Expected Date :</label>
          <input
            type="date"
            value={form.expectedDate}
            onChange={(e) => handleChange("expectedDate", e.target.value)}
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="row m-0 p-3">
        <h5 className={styles.head}>Items</h5>
        <div className="col-12">
          <div className="row m-0 p-3">
            <div className="col-12">
              <table className={`table table-bordered borderedtable`}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4}>NO ITEMS ADDED</td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr
                        key={index}
                        className="animated-row"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => {
                              // Get unit from product
                              const productUnit = product.unit || 
                                                 product.units || 
                                                 product.packageWeightUnit || 
                                                 product.measurementUnit || 
                                                 "units";
                              return (
                                <option key={product.id} value={product.id}>
                                  {product.name} {product.sku ? `(${product.sku})` : ''} - {productUnit}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            placeholder="Quantity"
                            min="1"
                            step="0.01"
                            style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.unit}
                            readOnly
                            placeholder="Unit will auto-fill"
                            style={{ 
                              width: '100%', 
                              padding: '4px', 
                              border: '1px solid #ddd', 
                              borderRadius: '4px',
                              backgroundColor: '#f8f9fa',
                              cursor: 'not-allowed'
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="row m-0 p-0 pt-3">
                <div className="col-12" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={addItem}
                  >
                    Add Item
                  </button>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if (items.length > 1) {
                          const newItems = items.slice(0, -1);
                          setItems(newItems);
                        }
                      }}
                    >
                      Remove Last Item
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="row m-0 p-3">
        <h5 className={styles.headmdl}>Notes</h5>
        <div className={`col-6 ${styles.textform}`}>
          <label>Additional Notes :</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Enter any additional notes or instructions..."
            rows="4"
          />
        </div>
      </div>

      {/* Actions */}
      {!loading && (
        <div className="row m-0 p-3 justify-content-center">
          <div className="col-3">
            <button className="submitbtn" onClick={handleCreate}>
              Create Indent
            </button>
            <button
              className="cancelbtn"
              onClick={() => navigate("/store/indents")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <Loading />}
      {isModalOpen && (
        <ErrorModal
          isOpen={isModalOpen}
          message={error}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default CreateIndent;

