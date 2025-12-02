import React, { useMemo, useState, useEffect } from "react";
import ApiService from "../../../services/apiService";

const styles = {
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '5px',
    border: '1px solid #d9d9d9',
    boxShadow: '1px 1px 3px #333',
    gap: '12px',
    flexWrap: 'wrap'
  },
  stepIndicatorMobile: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '12px',
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '5px',
    border: '1px solid #d9d9d9',
    boxShadow: '1px 1px 3px #333',
    gap: '8px',
    flexWrap: 'wrap'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  stepItemActive: {
    backgroundColor: 'var(--primary-color)',
    color: 'white'
  },
  stepItemCompleted: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  stepItemPending: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    border: '1px solid #dee2e6'
  },
  stepNumber: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px',
    width: '100%'
  },
  productGridMobile: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    width: '100%'
  },
  productCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
    transition: 'all 0.2s ease'
  },
  productTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '12px'
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '13px',
    color: '#475569'
  },
  productActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px'
  },
  productLoadingSpinner: {
    border: '2px solid #e2e8f0',
    borderTop: '2px solid var(--primary-color)',
    borderRadius: '50%',
    width: '14px',
    height: '14px',
    animation: 'spin 1s linear infinite'
  }
};

function StepIndicator({ step, steps, isMobile }) {
  const meta = steps.map((title, idx) => ({
    number: idx + 1,
    title,
    description:
      title === 'Products' ? 'Add products to cart' :
      title === 'Overview' ? 'Review order details' :
      'Payment information'
  }));

  return (
    <div style={isMobile ? { ...styles.stepIndicator, ...styles.stepIndicatorMobile } : styles.stepIndicator}>
      {meta.map((item, index) => {
        let stepStyle = { ...styles.stepItem };
        if (index < step) stepStyle = { ...stepStyle, ...styles.stepItemCompleted };
        else if (index === step) stepStyle = { ...stepStyle, ...styles.stepItemActive };
        else stepStyle = { ...stepStyle, ...styles.stepItemPending };

        return (
          <div key={item.title} style={stepStyle}>
            <div style={styles.stepNumber}>{index < step ? '✓' : index + 1}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '12px' }}>{item.title}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{item.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StoreCreateSale() {
  const [step, setStep] = useState(0);

  // Step 1: mobile number
  const [mobile, setMobile] = useState("");
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [checking, setChecking] = useState(false);

  // Steps: Products, Overview, Payment
  const steps = useMemo(() => ['Products', 'Overview', 'Payment'], []);

  // Step 2: customer form (only if not exists)
  const [customerForm, setCustomerForm] = useState({
    name: "",
    mobile: "",
    email: "",
    area: "",
    city: "",
    pincode: "",
  });
  const [readonlyExisting, setReadonlyExisting] = useState(true);
  const [customerChecked, setCustomerChecked] = useState(false);

  // Step 2: products & cart
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [selectedProductForQty, setSelectedProductForQty] = useState(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [inputQuantity, setInputQuantity] = useState('');
  const [loadingProductIds, setLoadingProductIds] = useState(new Set());

  // Step 2: Payment
  const [mobileNumber, setMobileNumber] = useState("");
  const [generatedOrderId] = useState(() => `STORE-${Date.now().toString().slice(-6)}`);
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [payments, setPayments] = useState([{
    transactionDate: getTodayDate(),
    paymentMethod: "cash", // "cash" or "bank"
    paymentMode: "", // "UPI", "Card", or "Bank Transfer" (only when paymentMethod is "bank")
    amount: "",
    reference: "",
    remark: "",
    utrNumber: "", // UTR number for bank payments
    proofFile: null,
    proofPreviewUrl: null,
  }]);
  const [activePaymentTab, setActivePaymentTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const sanitizeMobile = (value = "") => String(value || "").replace(/[^0-9]/g, "").slice(-10);

  const handleCheckMobile = async (mobileNumber = mobile) => {
    const cleanedMobile = sanitizeMobile(mobileNumber);
    console.log('handleCheckMobile called with mobileNumber:', mobileNumber, 'cleaned:', cleanedMobile, 'length:', cleanedMobile.length);
    if (cleanedMobile.length !== 10) {
      console.log('Mobile length is not 10, returning');
      return;
    }
    try {
      console.log('Setting checking to true');
      setChecking(true);
      setCustomerChecked(false);
      console.log('Checking customer for mobile:', mobileNumber);
      const matchCustomersByMobile = (list = []) => {
        const matched = list.filter((c) => sanitizeMobile(c.mobile) === cleanedMobile);
        console.log(`Matched ${matched.length} customers out of`, list.length);
        return matched;
      };
      
      // Make actual API call
      const resp = await ApiService.get(`/customers?mobile=${cleanedMobile}`);
      let customers = [];
      if (resp && typeof resp.json === 'function') {
        const data = await resp.json();
        console.log('API response:', data);
        const apiCustomers = Array.isArray(data?.customers) ? data.customers : [];
        customers = matchCustomersByMobile(apiCustomers);
      }
      
      // Fallback: fetch all and match by mobile
      if (!customers.length) {
        console.log('Falling back to /customers list fetch');
        const allResp = await ApiService.get(`/customers`);
        if (allResp && typeof allResp.json === 'function') {
          const allData = await allResp.json();
          const all = Array.isArray(allData?.customers) ? allData.customers : [];
          customers = matchCustomersByMobile(all);
        }
      }
      
      if (customers.length > 0) {
        const customer = customers[0];
        console.log('Customer found:', customer);
        setExistingCustomer(customer);
        setCustomerForm({
          name: customer.name || "",
          mobile: customer.mobile || cleanedMobile,
          email: customer.email || "",
          area: customer.area || "",
          city: customer.city || "",
          pincode: customer.pincode || "",
        });
        setReadonlyExisting(true);
      } else {
        console.log('No customer found');
        setExistingCustomer(null);
        setCustomerForm((f) => ({ ...f, mobile: cleanedMobile }));
      }
      setCustomerChecked(true);
    } catch (error) {
      console.error('Error checking customer:', error);
      setExistingCustomer(null);
      setCustomerForm((f) => ({ ...f, mobile: cleanedMobile }));
      setCustomerChecked(true);
    } finally {
      setChecking(false);
    }
  };

  const mockProducts = useMemo(() => ([
    { id: 'prod-1', name: 'Layer Feed 50kg', sku: 'LF-50', quantity: 120, unit: 'kg', basePrice: 1450, productType: 'bulk' },
    { id: 'prod-2', name: 'Broiler Starter', sku: 'BS-25', quantity: 60, unit: 'kg', basePrice: 980, productType: 'bulk' },
    { id: 'prod-3', name: 'Finisher Crumble', sku: 'FC-30', quantity: 35, unit: 'kg', basePrice: 1125, productType: 'bulk' },
    { id: 'prod-4', name: 'Packed Mineral Mix', sku: 'PMM-5', quantity: 200, unit: 'packet', basePrice: 350, productType: 'packed' }
  ]), []);

  useEffect(() => {
    setProductsLoading(true);
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setProductsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [mockProducts]);

  const cartItemsList = useMemo(() => Object.values(cartItems), [cartItems]);
  const cartItemsCount = cartItemsList.length;
  const totalCartValue = cartItemsList.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  const reviewData = useMemo(() => {
    if (!cartItemsCount) return null;

    const customerInfo = existingCustomer
      ? {
          name: existingCustomer.name || customerForm.name,
          mobile: existingCustomer.mobile || customerForm.mobile,
          email: existingCustomer.email || customerForm.email,
          address:
            existingCustomer.address ||
            [existingCustomer.area, existingCustomer.city, existingCustomer.pincode].filter(Boolean).join(", "),
        }
      : {
          name: customerForm.name,
          mobile: customerForm.mobile,
          email: customerForm.email,
          address: [customerForm.area, customerForm.city, customerForm.pincode].filter(Boolean).join(", "),
        };

    const items = cartItemsList.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      total: item.totalPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    return {
      orderId: generatedOrderId,
      customer: customerInfo,
      items,
      totals: { subtotal, tax, total },
      upiId: "kernnfeeds@upi",
      bankDetails: {
        accountNumber: "1234567890",
        ifsc: "KERNN0001",
        bankName: "Kernn Bank",
      },
    };
  }, [cartItemsCount, cartItemsList, customerForm, existingCustomer, generatedOrderId]);

  const canGoNext = () => {
    if (step === 0) return cartItemsCount > 0; // Products step - need at least one item
    if (step === 1) return reviewData !== null; // Overview step
    if (step === 2) return true; // Payment step
    return false;
  };

  const setProductLoadingState = (productId, enable) => {
    setLoadingProductIds((prev) => {
      const next = new Set(prev);
      if (enable) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const showQuantityModalForProduct = (product) => {
    setSelectedProductForQty(product);
    setInputQuantity('');
    setShowQuantityModal(true);
  };

  const handleQuantityConfirm = () => {
    if (!selectedProductForQty) return;
    const quantity = parseInt(inputQuantity, 10);
    if (!quantity || quantity <= 0) return;

    const productId = selectedProductForQty.id;
    setProductLoadingState(productId, true);

    setCartItems((prev) => {
      const existing = prev[productId] || {};
      const newQuantity = (existing.quantity || 0) + quantity;
      const unitPrice = selectedProductForQty.basePrice || selectedProductForQty.price || 0;
      const totalPrice = unitPrice * newQuantity;

      return {
        ...prev,
        [productId]: {
          ...selectedProductForQty,
          quantity: newQuantity,
          unit: selectedProductForQty.productType === "packed" ? "packs" : (selectedProductForQty.unit || "units"),
          price: unitPrice,
          totalPrice
        }
      };
    });

    setShowQuantityModal(false);
    setSelectedProductForQty(null);
    setInputQuantity('');
    setProductLoadingState(productId, false);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const addPayment = () => {
    setPayments((prev) => [
      ...prev,
      {
        transactionDate: getTodayDate(),
        paymentMethod: "cash",
        paymentMode: "",
        amount: "",
        reference: "",
        remark: "",
        utrNumber: "",
        proofFile: null,
        proofPreviewUrl: null,
      },
    ]);
  };

  const removePayment = (idx) => {
    setPayments((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePaymentField = (idx, field, value) => {
    setPayments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handlePaymentProof = (idx, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPayments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], proofFile: file, proofPreviewUrl: previewUrl };
      return next;
    });
  };

  const handleSubmitPayment = () => {
    setSuccessMessage("Sale submitted successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const renderQuantityModal = () => {
    if (!showQuantityModal || !selectedProductForQty) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowQuantityModal(false);
            setSelectedProductForQty(null);
            setInputQuantity('');
          }
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '24px',
            width: isMobile ? '95vw' : '400px',
            maxWidth: '95vw',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
            Add to Cart
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <strong>Product:</strong>
            <div>{selectedProductForQty.name}</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <strong>Available:</strong>
            <div>{selectedProductForQty.quantity} {selectedProductForQty.productType === "packed" ? "packs" : selectedProductForQty.unit}</div>
          </div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Quantity</label>
          <input
            type="number"
            min="1"
            value={inputQuantity}
            onChange={(e) => setInputQuantity(e.target.value)}
            placeholder="Enter quantity"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #dbeafe'
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <button className="btn btn-light" onClick={() => { setShowQuantityModal(false); setSelectedProductForQty(null); }}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!inputQuantity || parseInt(inputQuantity, 10) <= 0}
              onClick={handleQuantityConfirm}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ padding: isMobile ? 8 : 12, maxWidth: '100%', overflowX: 'hidden' }}>
      <h4 style={{ marginBottom: isMobile ? 12 : 8, fontSize: isMobile ? '18px' : '20px' }}>Create Sale</h4>
      <StepIndicator step={step} steps={steps} isMobile={isMobile} />

      {steps[step] === 'Products' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: 4 }}>Add Products</div>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Select products and build the cart just like the sales order experience.</p>

          {cartItemsCount > 0 && (
            <div style={{ border: '1px solid #bfdbfe', borderRadius: 10, padding: 12, backgroundColor: '#eff6ff', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Cart Summary</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} selected</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>₹{totalCartValue.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>Total Value</div>
                </div>
              </div>
            </div>
          )}

          {productsLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#475569' }}>Loading products...</div>
          ) : (
            <div style={isMobile ? { ...styles.productGrid, ...styles.productGridMobile } : styles.productGrid}>
              {products.map((product) => {
                const inCart = cartItems[product.id]?.quantity || 0;
                const isLoading = loadingProductIds.has(product.id);

                return (
                  <div
                    key={product.id}
                    style={{
                      ...styles.productCard,
                      borderColor: inCart ? '#22c55e' : '#e2e8f0',
                      backgroundColor: inCart ? 'rgba(34, 197, 94, 0.08)' : '#fff'
                    }}
                  >
                    <div style={styles.productTitle}>{product.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div style={styles.productInfo}>
                        <span style={{ fontWeight: 600 }}>SKU</span>
                        <span>{product.sku || 'N/A'}</span>
                      </div>
                      <div style={styles.productInfo}>
                        <span style={{ fontWeight: 600 }}>Stock</span>
                        <span style={{ color: product.quantity > 10 ? '#16a34a' : product.quantity > 0 ? '#f97316' : '#dc2626' }}>
                          {product.quantity > 0 ? product.quantity : 'Out of Stock'}
                        </span>
                      </div>
                      <div style={styles.productInfo}>
                        <span style={{ fontWeight: 600 }}>Unit</span>
                        <span>{product.productType === "packed" ? "packs" : (product.unit === "packet" ? "packs" : product.unit || 'unit')}</span>
                      </div>
                      <div style={styles.productInfo}>
                        <span style={{ fontWeight: 600 }}>Price</span>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>₹{(product.basePrice || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div style={{ ...styles.productActions, flexDirection: isMobile ? 'column' : 'row' }}>
                      <button
                        className={`btn ${inCart ? 'btn-success' : 'btn-primary'}`}
                        style={{ 
                          flex: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: 8,
                          minHeight: isMobile ? '44px' : 'auto',
                          fontSize: isMobile ? '14px' : '16px'
                        }}
                        disabled={isLoading}
                        onClick={() => showQuantityModalForProduct(product)}
                      >
                        {isLoading && <div style={styles.productLoadingSpinner}></div>}
                        {isLoading ? 'Adding...' : (inCart ? 'Add More' : 'Add to Cart')}
                      </button>
                      {inCart > 0 && (
                        <button
                          className="btn btn-outline-danger"
                          style={{ 
                            minWidth: isMobile ? '100%' : 90,
                            minHeight: isMobile ? '44px' : 'auto',
                            fontSize: isMobile ? '14px' : '16px'
                          }}
                          onClick={() => removeFromCart(product.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {inCart > 0 && (
                      <div style={{ marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: '#dcfce7', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: 12, color: '#166534', marginBottom: 6, fontWeight: 600 }}>In Cart</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span>Quantity</span>
                          <strong>{cartItems[product.id].quantity} {cartItems[product.id].unit}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span>Line Total</span>
                          <strong>₹{(cartItems[product.id].totalPrice || 0).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
            <button className="btn btn-secondary" onClick={next} disabled={cartItemsCount === 0} style={{ minHeight: isMobile ? '44px' : 'auto', width: isMobile ? '100%' : 'auto' }}>Continue to Overview</button>
          </div>
        </div>
      )}

      {steps[step] === 'Overview' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Review Order</div>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Confirm customer & cart details before payment</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#0f172a', fontWeight: 700 }}>Order ID</div>
              <div style={{ fontSize: 14, color: '#475569' }}>{reviewData?.orderId || "N/A"}</div>
            </div>
          </div>

          {!reviewData ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
              Add at least one product to review the order.
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, backgroundColor: '#f8fafc' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Customer</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    <div><strong>Name:</strong> {reviewData.customer.name || "-"}</div>
                    <div><strong>Phone:</strong> {reviewData.customer.mobile || "-"}</div>
                    {reviewData.customer.address && <div><strong>Address:</strong> {reviewData.customer.address}</div>}
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, backgroundColor: '#f8fafc' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Totals</div>
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    <div><strong>Items:</strong> {reviewData.items.length}</div>
                    <div><strong>Subtotal:</strong> ₹{reviewData.totals.subtotal.toLocaleString('en-IN')}</div>
                    <div><strong>Total:</strong> ₹{reviewData.totals.total.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: 12, fontWeight: 600, color: '#1e293b' }}>Products</div>
                {reviewData.items.map((item) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', padding: '12px 16px', borderTop: '1px solid #e2e8f0', fontSize: isMobile ? 12 : 13, color: '#475569', gap: isMobile ? '8px' : '0' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.sku || 'SKU NA'}</div>
                    </div>
                    <div>Qty: {item.quantity} {item.unit}</div>
                    <div>Price: ₹{(item.price || 0).toLocaleString('en-IN')}</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>₹{(item.total || 0).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, backgroundColor: '#f8fafc', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span>Subtotal</span>
                  <strong>₹{reviewData.totals.subtotal.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span>Estimated Tax (5%)</span>
                  <strong>₹{reviewData.totals.tax.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                  <span style={{ fontWeight: 600 }}>Grand Total</span>
                  <strong style={{ fontSize: 18, color: '#0f172a' }}>₹{reviewData.totals.total.toLocaleString('en-IN')}</strong>
          </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
                <button className="btn btn-light" onClick={prev} style={{ minHeight: isMobile ? '44px' : 'auto', width: isMobile ? '100%' : 'auto' }}>Back to Products</button>
                <button className="btn btn-secondary" onClick={next} disabled={!reviewData} style={{ minHeight: isMobile ? '44px' : 'auto', width: isMobile ? '100%' : 'auto' }}>Continue to Payment</button>
              </div>
            </>
          )}
        </div>
      )}

      {steps[step] === 'Payment' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Payment Details</div>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Complete payment information to finalize the order</p>

          {!reviewData ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
              Complete the overview step to proceed with payment.
            </div>
          ) : (
            <>
              {/* Mobile Number (Optional) */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, backgroundColor: '#f8fafc', marginBottom: 16 }}>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Mobile Number</div>
                <p style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>Optional - Enter mobile number for payment notifications</p>
                <input
                  type="tel"
                  placeholder="Enter mobile number (optional)"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    padding: '10px 12px', 
                    borderRadius: 8, 
                    border: '1px solid #e5e7eb',
                    fontSize: '14px' 
                  }}
                />
              </div>

              {/* Order Summary */}
              <div style={{ border: '1px solid #c7d2fe', borderRadius: 12, padding: 16, backgroundColor: '#eef2ff', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#312e81' }}>Order Total</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1e1b4b' }}>₹{reviewData.totals.total.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 12, color: '#4338ca' }}>Order ID: {reviewData.orderId}</div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, backgroundColor: '#f8fafc', marginBottom: 16 }}>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Payment Info</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>Payment Records</div>
                  <button className="btn btn-success" type="button" onClick={addPayment}>Add Payment</button>
                </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {payments.map((payment, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>Payment #{idx + 1}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>Enter transaction details</div>
                      </div>
                      {payments.length > 1 && (
                        <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => removePayment(idx)}>
                          Remove
                        </button>
                      )}
                    </div>
                    {/* Payment Method Buttons - First */}
                    <div style={{ marginBottom: '16px', gridColumn: '1 / -1' }}>
                      <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Payment Method</label>
                        <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <button
                          type="button"
                          onClick={() => updatePaymentField(idx, "paymentMethod", "cash")}
                          style={{
                            padding: isMobile ? '12px 20px' : '10px 24px',
                            borderRadius: '8px',
                            border: '2px solid',
                            borderColor: (payment.paymentMethod || "cash") === "cash" ? 'var(--primary-color)' : '#e2e8f0',
                            backgroundColor: (payment.paymentMethod || "cash") === "cash" ? 'var(--primary-color)' : '#fff',
                            color: (payment.paymentMethod || "cash") === "cash" ? '#fff' : '#4a5568',
                            fontWeight: '600',
                            fontSize: isMobile ? '14px' : '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: isMobile ? '44px' : 'auto',
                            flex: isMobile ? '1' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if ((payment.paymentMethod || "cash") !== "cash") {
                              e.target.style.borderColor = 'var(--primary-color)';
                              e.target.style.backgroundColor = '#f0f4ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if ((payment.paymentMethod || "cash") !== "cash") {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.backgroundColor = '#fff';
                            }
                          }}
                        >
                          Cash
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePaymentField(idx, "paymentMethod", "bank")}
                          style={{
                            padding: isMobile ? '12px 20px' : '10px 24px',
                            borderRadius: '8px',
                            border: '2px solid',
                            borderColor: payment.paymentMethod === "bank" ? 'var(--primary-color)' : '#e2e8f0',
                            backgroundColor: payment.paymentMethod === "bank" ? 'var(--primary-color)' : '#fff',
                            color: payment.paymentMethod === "bank" ? '#fff' : '#4a5568',
                            fontWeight: '600',
                            fontSize: isMobile ? '14px' : '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: isMobile ? '44px' : 'auto',
                            flex: isMobile ? '1' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (payment.paymentMethod !== "bank") {
                              e.target.style.borderColor = 'var(--primary-color)';
                              e.target.style.backgroundColor = '#f0f4ff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (payment.paymentMethod !== "bank") {
                              e.target.style.borderColor = '#e2e8f0';
                              e.target.style.backgroundColor = '#fff';
                            }
                          }}
                        >
                          Bank
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                      <div>
                        <label className="form-label">Transaction Date</label>
                        <input type="date" className="form-control"
                          value={payment.transactionDate || getTodayDate()}
                          onChange={(e) => updatePaymentField(idx, "transactionDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label">Amount (₹)</label>
                        <input type="number" className="form-control" min="0" value={payment.amount}
                          onChange={(e) => updatePaymentField(idx, "amount", e.target.value)}
                        />
                      </div>
                      {payment.paymentMethod === "bank" && (
                        <div>
                          <label className="form-label">UTR Number (Optional)</label>
                          <input type="text" className="form-control" placeholder="Enter UTR number"
                            value={payment.utrNumber || ''}
                            onChange={(e) => updatePaymentField(idx, "utrNumber", e.target.value)}
                          />
                        </div>
                      )}
                      <div>
                        <label className="form-label">Remark</label>
                        <input type="text" className="form-control" value={payment.remark}
                          onChange={(e) => updatePaymentField(idx, "remark", e.target.value)}
                        />
                      </div>
                      {payment.paymentMethod === "cash" && (
                        <div>
                          <label className="form-label">Proof (Optional)</label>
                          <input type="file" className="form-control" accept="image/*,application/pdf"
                            onChange={(e) => handlePaymentProof(idx, e.target.files?.[0])}
                          />
                          {payment.proofPreviewUrl && (
                            <a href={payment.proofPreviewUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, marginTop: 4, display: 'inline-block' }}>
                              View proof
                            </a>
                          )}
                        </div>
                      )}
                      {payment.paymentMethod === "bank" && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              // Generate QR code functionality
                              setSuccessMessage("QR code generation feature coming soon");
                              setTimeout(() => setSuccessMessage(""), 3000);
                            }}
                            style={{
                              padding: '10px 20px',
                              borderRadius: '8px',
                              border: '2px solid var(--primary-color)',
                              backgroundColor: '#fff',
                              color: 'var(--primary-color)',
                              fontWeight: '600',
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'var(--primary-color)';
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#fff';
                              e.target.style.color = 'var(--primary-color)';
                            }}
                          >
                            Generate QR
                          </button>
                        </div>
                      )}
          </div>
        </div>
                ))}
              </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
                <button className="btn btn-light" onClick={prev} style={{ minHeight: isMobile ? '44px' : 'auto', width: isMobile ? '100%' : 'auto' }}>Back to Overview</button>
                <button className="btn btn-primary" type="button" onClick={handleSubmitPayment} style={{ minHeight: isMobile ? '44px' : 'auto', width: isMobile ? '100%' : 'auto' }}>Submit Payment</button>
              </div>
              {successMessage && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', textAlign: 'center', fontWeight: 600 }}>
                  {successMessage}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {renderQuantityModal()}
    </div>
  );
}


