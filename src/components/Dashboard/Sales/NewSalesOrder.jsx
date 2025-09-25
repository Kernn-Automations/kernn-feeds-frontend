import React, { useState, useEffect } from "react";
//import axios from "axios";
import ApiService from "../../../services/apiService";
import { useAuth } from "@/Auth";
import MapPicker from "./MapPicker";



// API URLs
const ApiUrls = {
  createCart: "/cart",
  updateCart: "/cart/update",
  removeFromCart: "/cart/remove",
  getCart: "/cart",
  validate_drops: "/drops/validate",
  getProducts: "/warehouse/:id/inventory",
  finalizeOrder: "/sales-orders/",
  get_review_details: "/cart/review",
  submitPayment: "/sales-orders/:id/payment",
  get_customers_sales_executive: "/customers",
  get_customer_details: "/customers",
};

// Utils
const fillUrl = (url, replacements) =>
  Object.entries(replacements || {}).reduce(
    (acc, [key, val]) => acc.replace(`:${key}`, val),
    url
  );

// Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#333'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'flex-start',
    width: '100%'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333'
  },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  validCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: '#10b981'
  },
  invalidCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    borderColor: '#ef4444'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  inputFocus: {
    borderColor: '#2563eb'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    outline: 'none'
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    color: 'white'
  },
  buttonPrimaryHover: {
    backgroundColor: '#1d4ed8'
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  },
  buttonSuccess: {
    backgroundColor: '#10b981',
    color: 'white'
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
    color: 'white'
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed'
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    alignItems: 'center'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '16px 0',
    border: 'none'
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  toast: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '6px',
    color: 'white',
    fontWeight: '500',
    zIndex: 1000,
    minWidth: '250px'
  },
  toastSuccess: {
    backgroundColor: '#10b981'
  },
  toastError: {
    backgroundColor: '#ef4444'
  },
  toastWarning: {
    backgroundColor: '#f59e0b'
  },
  toastInfo: {
    backgroundColor: '#3b82f6'
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  radio: {
    width: '16px',
    height: '16px'
  },
  productCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    width: '100%',
    backgroundColor: '#fff'
  },
  productTitle: {
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '8px'
  },
  productInfo: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px'
  },
  productActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginTop: '12px'
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '16px'
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    borderBottom: '2px solid transparent'
  },
  tabActive: {
    borderBottom: '2px solid #2563eb',
    color: '#2563eb'
  },
  fileInput: {
    display: 'none'
  },
  fileButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  previewImage: {
    width: '90px',
    height: '90px',
    objectFit: 'contain',
    border: '1px solid #e0e0e0',
    borderRadius: '4px'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '8px'
  },
  successText: {
    color: '#10b981',
    fontSize: '14px'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    color: '#6b7280'
  },
  totalsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  }
};

// CSS keyframes for loader
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export default function SalesOrderWizard() {

  const { axiosAPI } = useAuth();

  // Mock API service - replace with your actual implementation


  // Toast state
  const [toast, setToast] = useState(null);

  function showToast({ title, status = "info", duration = 4000 }) {
    setToast({ message: title, severity: status });
    setTimeout(() => setToast(null), duration);
  }

  // Step state
  const [step, setStep] = useState(0);

  // Step 1: Customer select
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Step 2: Products + Cart
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [dropOffLimit, setDropOffLimit] = useState(1);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [selectedProductForQty, setSelectedProductForQty] = useState(null);
  const [inputQuantity, setInputQuantity] = useState(1);


  // Step 3: Logistics
  const [selectedWarehouseType, setSelectedWarehouseType] = useState("");
  const [dropCount, setDropCount] = useState(1);
  const [dropOffs, setDropOffs] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isDropValid, setIsDropValid] = useState([]);
  const [dropValidationErrors, setDropValidationErrors] = useState([]);
  const [dropDistances, setDropDistances] = useState([]);
  const [distanceSummary, setDistanceSummary] = useState(null);
  const [logisticsLoading, setLogisticsLoading] = useState(false);

  // Step 4: Review
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Step 5: Payment
  const [payments, setPayments] = useState([
    {
      transactionDate: "",
      paymentMode: "UPI",
      amount: "",
      reference: "",
      transactionStatus: "Completed",
      remark: "",
      proofFile: null,
      proofPreviewUrl: null,
    },
  ]);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState(0);

  // === Step 1: Customer Load & Select ===
  useEffect(() => {
    async function loadCustomers() {
      try {
        setCustomerLoading(true);
        const res = await axiosAPI.get(ApiUrls.get_customers_sales_executive);
        console.log("Customers:", res);
        setCustomers(res.data.customers || []);
      } catch (e) {
        console.log(e);
        showToast({
          title: "Failed to load customers",
          status: "error",
          duration: 4000,
        });
      } finally {
        setCustomerLoading(false);
      }
    }
    loadCustomers();
  }, []);

  // When selectedCustomer changes, fetch full details and products
  useEffect(() => {
    if (!selectedCustomer) return;
    console.log("Selected customer:", selectedCustomer);
    async function fetchCustomerDetails() {
      try {
        setCustomerLoading(true);
        const res = await axiosAPI.get(
          `${ApiUrls.get_customer_details}/${selectedCustomer}`
        );
        console.log("Customer details:", res);
        // Data is nested under res.data.data.customer and products under res.data.data.productsAndDiscounting.products
        const customerData = res.data?.customer || null;
        const productList = res.data?.productsAndDiscounting?.products || [];
        console.log(customerData, productList);
        setCustomerDetails(customerData);
        setProducts(productList); // Set products here from customer details API response
        setSelectedWarehouseType("");
      } catch (e) {
        showToast({
          title: "Failed to load customer details",
          status: "error",
          duration: 4000,
        });
      } finally {
        setCustomerLoading(false);
      }
    }
    fetchCustomerDetails();
  }, [selectedCustomer]);

  // === Step 2: Load Products based on customer's warehouse, initialize cart ===
  useEffect(() => {
    if (!customerDetails) return;
    async function loadProductsForWarehouse() {
      try {
        setProductsLoading(true);
        const warehouseId = customerDetails.warehouseId;
        const url = ApiUrls.getProducts.replace(':id', warehouseId);
        const res = await axiosAPI.get(url);
        console.log(res);
        setProducts(res.data.products || []);
        setAvailableProducts(res.data.products || []);
      } catch (e) {
        showToast({
          title: "Failed to load products",
          status: "error",
          duration: 4000,
        });
      } finally {
        setProductsLoading(false);
      }
    }
    loadProductsForWarehouse();
  }, [customerDetails]);

  // Add or Update cart item (step 2)
  async function addOrUpdateCart(product, quantity) {
    if (!customerDetails) return;
    const isNewCart = !cartId;
    const apiUrl = isNewCart ? ApiUrls.createCart : ApiUrls.updateCart;
    try {
      console.log(customerDetails)
      setCartLoading(true);
      const payload = {
        cartId: cartId || null,
        customerId: customerDetails.customer_id,
        cartItems: [{ productId: product.id, quantity, unit: product.unit }],
      };
      const res = await axiosAPI.post(apiUrl, payload);
      if (isNewCart) setCartId(res.data.cart.id);
      
      const itemsMap = {};
      res.data.cart.items.forEach((it) => {
        itemsMap[it.productId] = {
          ...it,
          totalPrice: it.price * it.quantity,
        };
      });
      setCartItems(itemsMap);
      setDropOffLimit(res.data.logistics?.maxDropOffs || 1);
      setWarehouseOptions(res.data.logistics?.warehouseOptions || []);
      setCartTotal(res.data.totals?.cartTotalAmount || 0);
    } catch (e) {
      showToast({
        title: "Failed to update cart",
        status: "error",
        duration: 4000,
      });
    } finally {
      setCartLoading(false);
    }
  }

  // Remove item from cart
  async function removeFromCart(productId) {
    if (!cartId) return;
    try {
      setCartLoading(true);
      const res = await axiosAPI.post(ApiUrls.removeFromCart, {
        cartId,
        productId,
      });
      
      const itemsMap = {};
      res.data.cart.items.forEach((it) => {
        itemsMap[it.productId] = {
          ...it,
          totalPrice: it.price * it.quantity,
        };
      });
      setCartItems(itemsMap);
      setCartTotal(res.data.totals?.cartTotalAmount || 0);
    } catch (e) {
      showToast({
        title: "Failed to remove item",
        status: "error",
        duration: 4000,
      });
    } finally {
      setCartLoading(false);
    }
  }

  // Confirm step 2 to go to step 3 (logistics)
  function confirmProductsStep() {
    if (Object.keys(cartItems).length === 0) {
      showToast({
        title: "Add at least one product",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    
    setDropCount(1);
    setDropOffs([
      {
        order: 1,
        receiverName: "",
        receiverMobile: "",
        plot: "",
        street: "",
        area: "",
        city: "",
        pincode: "",
        items: Object.entries(cartItems).map(([pid, item]) => ({
          productId: pid,
          productName: item.name,
          quantity: item.quantity,
          unit: item.unit,
          productType: item.productType,
          packageWeight: item.packageWeight,
          packageWeightUnit: item.packageWeightUnit,
        })),
      },
    ]);
    setIsDropValid([false]);
    setDropValidationErrors([null]);
    setDistanceSummary(null);
    setStep(2);
  }

  // === Step 3: Logistics Step ===
  function updateDropOff(index, newData) {
    setDropOffs((old) =>
      old.map((d, i) => (i === index ? { ...d, ...newData } : d))
    );
  }

  function updateDropItemQuantity(dropIndex, productId, quantity) {
    setDropOffs((old) => {
      const newDrops = [...old];
      const items = newDrops[dropIndex].items || [];
      const foundIndex = items.findIndex((i) => i.productId === productId);
      if (foundIndex !== -1) {
        items[foundIndex].quantity = quantity;
        newDrops[dropIndex].items = items;
      }
      return newDrops;
    });
  }

  async function validateDropOff(index) {
    const drop = dropOffs[index];
    const filteredCoords = dropOffs
      .filter(
        (d) =>
          d.latitude !== undefined &&
          d.longitude !== undefined &&
          d.latitude !== null &&
          d.longitude !== null
      )
      .map(({ order, latitude, longitude }) => ({ order, latitude, longitude }));
    try {
      console.log(customerDetails);
      setLogisticsLoading(true);
      const res = await axiosAPI.post(ApiUrls.validate_drops, {
        customerId: customerDetails.customer_id,
        dropOffs: filteredCoords,
        warehouseType: selectedWarehouseType,
      });
      if (res.data.valid) {
        setIsDropValid((old) => {
          const newArr = [...old];
          newArr[index] = true;
          return newArr;
        });
        setDropValidationErrors((old) => {
          const newArr = [...old];
          newArr[index] = null;
          return newArr;
        });
        console.log(res);
        setDropDistances(res.data.distances || []);
        setDistanceSummary(res.data.distanceSummary);
      } else {
        setIsDropValid((old) => {
          const newArr = [...old];
          newArr[index] = false;
          return newArr;
        });
        setDropValidationErrors((old) => {
          const newArr = [...old];
          newArr[index] = res.data.message ?? "Invalid drop-off";
          return newArr;
        });
        setDropDistances([]);
        setDistanceSummary(null);
      }
    } catch (e) {
      console.log(e);
      showToast({
        title: "Failed to validate drop-off",
        status: "error",
        duration: 4000,
      });
    } finally {
      setLogisticsLoading(false);
    }
  }

  function confirmLogisticsStep() {
    if (!selectedWarehouseType) {
      showToast({
        title: "Select warehouse type",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (!isDropValid.every(Boolean)) {
      showToast({
        title: "Validate all dropoffs",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (
      dropOffs.some(
        (d) =>
          !d.items ||
          d.items.length === 0 ||
          d.items.some((item) => Number(item.quantity) <= 0)
      )
    ) {
      showToast({
        title: "Assign products to dropoffs with quantities",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    setStep(3);
    fetchReviewData();
  }

  async function fetchReviewData() {
    if (!cartId) return;
    try {
      setReviewLoading(true);
      const res = await axiosAPI.get(
        `${ApiUrls.get_review_details}/${cartId}?warehouseType=${selectedWarehouseType}`
      );
      setReviewData(res.data);
    } catch (e) {
      showToast({
        title: "Failed to fetch review data",
        status: "error",
        duration: 4000,
      });
    } finally {
      setReviewLoading(false);
    }
  }

  // === Step 4: Review ===
  async function finalizeOrder() {
    if (!reviewData) return;
    try {
      setReviewLoading(true);
      const payload = {
        customerId: customerDetails.customer_id,
        cartItems: Object.values(cartItems).map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
        })),
        selectedWarehouseType,
        dropOffs,
        paymentMethod: payments.length > 0 ? payments[0].paymentMode : "UPI",
      };
      const res = await axiosAPI.post(ApiUrls.finalizeOrder, payload);
      console.log(res);
      if (res.status === 201) {
        showToast({
          title: "Order finalized. Proceed to payment.",
          status: "success",
          duration: 3000,
        });
        setStep(4);
      } else {
        showToast({
          title: "Failed to finalize order",
          status: "error",
          duration: 4000,
        });
      }
    } catch (e) {
      console.log(e);
      showToast({
        title: "Error finalizing order",
        status: "error",
        duration: 4000,
      });
    } finally {
      setReviewLoading(false);
    }
  }

  // === Step 5: Payment ===
  function addPayment() {
    setPayments((old) => [
      ...old,
      {
        transactionDate: "",
        paymentMode: "UPI",
        amount: "",
        reference: "",
        transactionStatus: "Completed",
        remark: "",
        proofFile: null,
        proofPreviewUrl: null,
      },
    ]);
  }

  function removePayment(index) {
    if (payments.length === 1) return;
    setPayments((old) => old.filter((_, i) => i !== index));
  }

  function updatePaymentField(index, field, value) {
    setPayments((old) => {
      const arr = [...old];
      arr[index] = { ...arr[index], [field]: value };
      return arr;
    });
  }

  function handleFileChange(index, file) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    updatePaymentField(index, "proofFile", file);
    updatePaymentField(index, "proofPreviewUrl", previewUrl);
  }

  function validatePayments() {
    for (let i = 0; i < payments.length; i++) {
      const p = payments[i];
      if (!p.amount || parseFloat(p.amount) <= 0) {
        showToast({ title: `Enter valid amount for payment #${i + 1}`, status: "error", duration: 3000 });
        return false;
      }
      if (!p.transactionDate) {
        showToast({ title: `Select date for payment #${i + 1}`, status: "error", duration: 3000 });
        return false;
      }
      if (!p.reference.trim()) {
        showToast({ title: `Enter reference for payment #${i + 1}`, status: "error", duration: 3000 });
        return false;
      }
      if (!p.proofFile) {
        showToast({ title: `Upload proof for payment #${i + 1}`, status: "error", duration: 3000 });
        return false;
      }
      if ((p.transactionStatus === "Processing" || p.transactionStatus === "Failed") && !p.remark.trim()) {
        showToast({ title: `Add remark for payment #${i + 1}`, status: "error", duration: 3000 });
        return false;
      }
    }
    return true;
  }

  async function submitPayments() {
    if (!validatePayments()) return;
    setPaymentUploading(true);

    const payload = new FormData();
    const paymentsPayload = payments.map((p) => ({
      transactionDate: p.transactionDate,
      paymentMode: p.paymentMode,
      amount: parseFloat(p.amount),
      reference: p.reference.trim(),
      transactionStatus: p.transactionStatus,
      remark: p.remark.trim(),
    }));
    payload.append("payments", JSON.stringify(paymentsPayload));
    payload.append("orderId", reviewData?.orderId || "");
    payload.append("paymentId", reviewData?.paymentId || "");

    payments.forEach((p, idx) => {
      if (p.proofFile) {
        payload.append(`paymentProofs[${idx}]`, p.proofFile);
      }
    });

    try {
      const url = fillUrl(ApiUrls.submitPayment, { id: reviewData?.orderId || "" });
      const res = await axiosAPI.post(url, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        showToast({
          title: "Payment submitted successfully",
          status: "success",
          duration: 3000,
        });
        setStep(0);
      } else {
        showToast({
          title: "Failed to submit payment",
          status: "error",
          duration: 4000,
        });
      }
    } catch (e) {
      showToast({
        title: "Error submitting payment",
        status: "error",
        duration: 4000,
      });
    } finally {
      setPaymentUploading(false);
    }
  }

  // === Render Components ===
  
  const Loader = () => (
    <div style={styles.loader}></div>
  );

  const Button = ({ children, onClick, disabled, variant = 'primary', type = 'button', style = {}, ...props }) => {
    let buttonStyle = { ...styles.button };
    
    if (disabled) {
      buttonStyle = { ...buttonStyle, ...styles.buttonDisabled };
    } else {
      switch (variant) {
        case 'primary':
          buttonStyle = { ...buttonStyle, ...styles.buttonPrimary };
          break;
        case 'secondary':
          buttonStyle = { ...buttonStyle, ...styles.buttonSecondary };
          break;
        case 'success':
          buttonStyle = { ...buttonStyle, ...styles.buttonSuccess };
          break;
        case 'danger':
          buttonStyle = { ...buttonStyle, ...styles.buttonDanger };
          break;
        default:
          buttonStyle = { ...buttonStyle, ...styles.buttonPrimary };
      }
    }

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        style={{ ...buttonStyle, ...style }}
        onMouseEnter={(e) => {
          if (!disabled && variant === 'primary') {
            e.target.style.backgroundColor = styles.buttonPrimaryHover.backgroundColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && variant === 'primary') {
            e.target.style.backgroundColor = styles.buttonPrimary.backgroundColor;
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  };

  const Input = ({ type = 'text', value, onChange, placeholder, disabled, style = {}, ...props }) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...styles.input, ...style }}
      onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
      onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
      {...props}
    />
  );

  const Select = ({ value, onChange, children, disabled, style = {}, ...props }) => (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ ...styles.select, ...style }}
      {...props}
    >
      {children}
    </select>
  );

  const Card = ({ children, variant, style = {} }) => {
    let cardStyle = { ...styles.card };
    if (variant === 'valid') {
      cardStyle = { ...cardStyle, ...styles.validCard };
    } else if (variant === 'invalid') {
      cardStyle = { ...cardStyle, ...styles.invalidCard };
    }
    return <div style={{ ...cardStyle, ...style }}>{children}</div>;
  };

  // Step 1: Customer Selection
  function renderCustomerStep() {
    if (customerLoading) return <Loader />;
    
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Select Customer</h2>
        <Select
          value={selectedCustomer || ""}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          style={{ marginBottom: '16px' }}
        >
          <option value="">Select Customer</option>
            {(Array.isArray(customers) ? customers : []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
          ))}
        </Select>

        {customerDetails && (
          <Card>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>Customer Details</h3>
            <p style={{ margin: '4px 0' }}>Name: {customerDetails.name}</p>
            <p style={{ margin: '4px 0' }}>Phone: {customerDetails.mobile}</p>
            {customerDetails.salesExecutive && (
              <div style={{ marginTop: '16px' }}>
                <hr style={styles.divider} />
                <h4 style={{ margin: '8px 0', fontWeight: 'bold' }}>Associated Employee</h4>
                <p style={{ margin: '4px 0' }}>Name: {customerDetails.salesExecutive.name}</p>
                {/* <p style={{ margin: '4px 0' }}>Employee ID: {customerDetails.employee.employeeId}</p>
                <p style={{ margin: '4px 0' }}>Team Name: {customerDetails.employee.teamName}</p>
                                <p style={{ margin: '4px 0' }}>Team ID: {customerDetails.employee.teamId}</p> */}
              </div>
            )}
          </Card>
        )}

        <Button
          style={{ marginTop: '24px' }}
          variant="primary"
          disabled={!selectedCustomer}
          onClick={() => setStep(1)}
        >
          Confirm Customer
        </Button>
      </div>
    );
  }

  // Step 2: Products + Cart
  function renderProductStep() {
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Add Products</h2>
        {productsLoading ? (
          <Loader />
        ) : (
          <>
            {products.map((product) => {
              const inCart = cartItems[product.id]?.quantity || 0;
              return (
                <Card style={{ marginBottom: '12px' }} key={product.id}>
                  <div style={styles.productTitle}>{product.name}</div>
                  <div style={styles.productInfo}>SKU: {product.sku || "N/A"}</div>
                  <div style={styles.productInfo}>Current Stock: {product.stock || 0}</div>
                  <div style={styles.productInfo}>
                    Quantity Unit: {product.productType === "packed" ? "packs" : product.unit || "unit"}
                  </div>
                  <div style={styles.productActions}>
                    <Button
                      variant="secondary"
                      disabled={cartLoading}
                      onClick={() => addOrUpdateCart(product, inCart + 1)}
                    >
                      Add
                    </Button>
                    {inCart > 0 && (
                      <Button
                        variant="danger"
                        disabled={cartLoading}
                        onClick={() => removeFromCart(product.id)}
                      >
                        Remove
                      </Button>
                    )}
                    <span style={{ marginLeft: '16px' }}>
                      {inCart > 0 ? `In Cart: ${inCart}` : "Not Added"}
                    </span>
                  </div>
                </Card>
              );
            })}
            <Button
              style={{ marginTop: '16px' }}
              variant="primary"
              onClick={confirmProductsStep}
            >
              Confirm Products
            </Button>
          </>
        )}
      </div>
    );
  }

  // Step 3: Logistics
  function renderDropOffCard(index, drop) {
    return (
      <Card
        key={index}
        variant={
          isDropValid[index]
            ? "valid"
            : dropValidationErrors[index]
            ? "invalid"
            : undefined
        }
        style={{ marginBottom: '16px' }}
      >
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          Drop-off #{index + 1}
        </div>
        <div style={styles.flexColumn}>
          <Input
            type="text"
            value={drop.receiverName}
            placeholder="Receiver Name"
            onChange={e => updateDropOff(index, { receiverName: e.target.value })}
          />
          <Input
            type="text"
            value={drop.receiverMobile}
            placeholder="Receiver Mobile"
            onChange={e => updateDropOff(index, { receiverMobile: e.target.value })}
          />
          <Input
            type="text"
            value={drop.plot}
            placeholder="Plot"
            onChange={e => updateDropOff(index, { plot: e.target.value })}
          />
          <Input
            type="text"
            value={drop.street}
            placeholder="Street"
            onChange={e => updateDropOff(index, { street: e.target.value })}
          />
          <Input
            type="text"
            value={drop.area}
            placeholder="Area"
            onChange={e => updateDropOff(index, { area: e.target.value })}
          />
          <Input
            type="text"
            value={drop.city}
            placeholder="City"
            onChange={e => updateDropOff(index, { city: e.target.value })}
          />
          <Input
            type="text"
            value={drop.pincode}
            placeholder="Pincode"
            onChange={e => updateDropOff(index, { pincode: e.target.value })}
          />
          <MapPicker
            lat={drop.latitude}
            lng={drop.longitude}
            onChange={({ lat, lng }) => updateDropOff(index, { latitude: lat, longitude: lng })}
          />
        </div>
        <hr style={styles.divider} />
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          Product Assignment
        </div>
        {(drop.items || []).map(item => (
          <div style={styles.flexRow} key={item.productId}>
            <div style={{ flex: 1 }}>
              {item.productName} ({item.quantity} {item.unit})
            </div>
            <Input
              type="number"
              min={0}
              max={cartItems[item.productId]?.quantity}
              value={item.quantity}
              style={{ width: '100px' }}
              onChange={e => {
                let val = Number(e.target.value);
                if (val > cartItems[item.productId]?.quantity) val = cartItems[item.productId]?.quantity;
                if (val < 0) val = 0;
                updateDropItemQuantity(index, item.productId, val);
              }}
            />
          </div>
        ))}
        <Button
          style={{ marginTop: '8px' }}
          variant="primary"
          disabled={logisticsLoading}
          onClick={() => validateDropOff(index)}
        >
          Validate Dropoff
        </Button>
        {dropValidationErrors[index] && (
          <div style={styles.errorText}>{dropValidationErrors[index]}</div>
        )}
      </Card>
    );
  }

  function renderLogisticsStep() {
    if (!warehouseOptions.length)
      return <div>No warehouse options available</div>;
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Logistics</h2>
        <div>Select Warehouse</div>
        <div style={styles.radioGroup}>
          {warehouseOptions.map(opt => (
            <label key={opt} style={styles.radioItem}>
              <input
                type="radio"
                name="warehouseType"
                style={styles.radio}
                value={opt}
                checked={selectedWarehouseType === opt}
                onChange={e => setSelectedWarehouseType(e.target.value)}
              />
              {opt.toUpperCase()}
            </label>
          ))}
        </div>
        <div>
          Select Number of Drop-offs (Max {dropOffLimit})
        </div>
        <Select
          value={dropCount}
          onChange={e => {
            const val = Number(e.target.value);
            setDropCount(val);
            setDropOffs(oldDrops => {
              if (val > oldDrops.length) {
                // add defaults
                return [
                  ...oldDrops,
                  ...Array(val - oldDrops.length).fill(0).map((_, i) => ({
                    order: oldDrops.length + i + 1,
                    receiverName: "",
                    receiverMobile: "",
                    plot: "",
                    street: "",
                    area: "",
                    city: "",
                    pincode: "",
                    items: [],
                  }))
                ];
              } else {
                return oldDrops.slice(0, val);
              }
            });
            setIsDropValid(Array(val).fill(false));
            setDropValidationErrors(Array(val).fill(null));
          }}
          style={{ width: '120px' }}
        >
          {Array.from({ length: dropOffLimit }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </Select>
        <hr style={styles.divider} />
        {(dropOffs.length > 0
          ? dropOffs.map((drop, idx) => renderDropOffCard(idx, drop))
          : <div>No dropoff configured</div>
        )}
        <Button
          style={{ marginTop: '12px' }}
          variant="primary"
          onClick={confirmLogisticsStep}
        >
          Confirm Logistics
        </Button>
      </div>
    );
  }

  // Step 4: Review
  function renderReviewStep() {
    if (reviewLoading) return <Loader />;
    if (!reviewData)
      return <div>No review data available</div>;

    const c = reviewData.customer || {};
    const s = reviewData.salesExecutive || {};
    const w = reviewData.warehouse || {};
    const drops = dropOffs || [];
    const items = reviewData.items || [];
    const totals = reviewData.totals || {};

    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Review Order</h2>
        <Card>
          <div style={{ fontWeight: 'bold' }}>Customer</div>
          <div>{c.name}</div>
          <div>{c.mobile}</div>
          <div>{c.address || "Address not available"}</div>
        </Card>
        {s.name && (
          <Card>
            <div style={{ fontWeight: 'bold' }}>Sales Executive</div>
            <div>{s.name}</div>
            <div>{s.mobile}</div>
            <div>{s.email}</div>
          </Card>
        )}
        <Card>
          <div style={{ fontWeight: 'bold' }}>Warehouse</div>
          <div>{w.name || "Warehouse"}</div>
          <div>{[w.street, w.area, w.city, w.pincode].filter(Boolean).join(", ")}</div>
        </Card>
        <Card>
          <div style={{ fontWeight: 'bold' }}>Drop-off Points</div>
          {drops.length === 0 && <div>No drop-offs configured</div>}
          {drops.map((d, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div>{d.receiverName || "Receiver"}</div>
              <div>
                {[d.plot, d.street, d.area, d.city, d.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 'bold' }}>Products</div>
          {items.map((item, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
              <div>
                {item.productType === "packed"
                  ? `Qty: ${item.quantity} packs (${item.packageWeight} ${item.packageWeightUnit} each)`
                  : `Qty: ${item.quantity} ${item.unit}`}
              </div>
              <div>Base Price: ₹{item.basePrice}</div>
              <div>Tax: ₹{item.taxAmount}</div>
              <div>Total: ₹{item.totalAmount}</div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={styles.totalsRow}>
            <span>Subtotal</span>
            <span>₹{totals.subtotal}</span>
          </div>
          <div style={styles.totalsRow}>
            <span>Tax</span>
            <span>₹{totals.tax}</span>
          </div>
          <hr style={styles.divider} />
          <div style={{ ...styles.totalsRow, fontWeight: 700 }}>
            <span>Grand Total</span>
            <span>₹{totals.grandTotal}</span>
          </div>
        </Card>
        <Button
          onClick={finalizeOrder}
          disabled={reviewLoading}
          variant="primary"
        >
          Confirm and Go to Payment
        </Button>
      </div>
    );
  }

  // Step 5: Payment Step
  function renderPaymentStep() {
    function handleFileUpload(e, idx) {
      const file = e.target.files[0];
      if (!file) return;
      const previewUrl = URL.createObjectURL(file);
      const newPayments = [...payments];
      newPayments[idx].proofFile = file;
      newPayments[idx].proofPreviewUrl = previewUrl;
      setPayments(newPayments);
    }

    function updatePaymentFieldLocal(idx, field, value) {
      const newPayments = [...payments];
      newPayments[idx][field] = value;
      setPayments(newPayments);
    }

    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Payment Details</h2>
        <div>Sales Order ID: {reviewData?.orderId || ""}</div>
        <div>Total Amount: ₹{reviewData?.totalAmount || 0}</div>
        {/* (Simplified payment tabs for native React) */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activePaymentTab === 0 ? styles.tabActive : {})
            }}
            onClick={() => setActivePaymentTab(0)}
            type='button'
          >
            UPI
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activePaymentTab === 1 ? styles.tabActive : {})
            }}
            onClick={() => setActivePaymentTab(1)}
            type='button'
          >
            Bank
          </button>
        </div>
        {activePaymentTab === 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div>UPI ID: {reviewData?.upiId || "N/A"}</div>
          </div>
        )}
        {activePaymentTab === 1 && (
          <div style={{ marginBottom: "16px" }}>
            <div>Bank Account: {reviewData?.bankDetails?.accountNumber || "N/A"}</div>
            <div>IFSC: {reviewData?.bankDetails?.ifsc || "N/A"}</div>
          </div>
        )}
        {payments.map((payment, i) => (
          <Card key={i} style={{ marginBottom: "12px" }}>
            <div style={styles.flexRow}>
              <div style={{ fontWeight: "bold" }}>Payment #{i + 1}</div>
              <button
                style={{ ...styles.iconButton, marginLeft: "auto" }}
                onClick={() => removePayment(i)}
                disabled={payments.length === 1}
                title="Remove payment"
              >
                &#10005;
              </button>
            </div>
            <div style={styles.flexColumn}>
              <Input
                type="date"
                value={payment.transactionDate}
                onChange={e => updatePaymentFieldLocal(i, "transactionDate", e.target.value)}
              />
              <Select
                value={payment.paymentMode}
                onChange={e => updatePaymentFieldLocal(i, "paymentMode", e.target.value)}
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                value={payment.amount}
                onChange={e => updatePaymentFieldLocal(i, "amount", e.target.value)}
              />
              <Input
                type="text"
                placeholder="Reference"
                value={payment.reference}
                onChange={e => updatePaymentFieldLocal(i, "reference", e.target.value)}
              />
              <Select
                value={payment.transactionStatus}
                onChange={e => updatePaymentFieldLocal(i, "transactionStatus", e.target.value)}
              >
                <option value="Completed">Completed</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
              </Select>
              <textarea
                rows={2}
                placeholder="Remarks"
                value={payment.remark}
                onChange={e => updatePaymentFieldLocal(i, "remark", e.target.value)}
                style={{ ...styles.input, minHeight: "60px", resize: "vertical" }}
              />
              <div style={styles.flexRow}>
                <label style={styles.fileButton}>
                  Upload Proof
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    style={styles.fileInput}
                    onChange={e => handleFileUpload(e, i)}
                  />
                </label>
                {payment.proofPreviewUrl && (
                  <img
                    src={payment.proofPreviewUrl}
                    alt={`Payment proof #${i + 1}`}
                    style={styles.previewImage}
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
        <Button
          style={{ marginRight: "16px" }}
          onClick={addPayment}
          variant="success"
        >
          Add Payment
        </Button>
        <Button
          variant="primary"
          onClick={submitPayments}
          disabled={paymentUploading}
        >
          Submit Payments
        </Button>
      </div>
    );
  }

  // Main render function
  return (
    <>
      {/* Loader Keyframes */}
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.title}>Create New Sales Order</div>
        {step === 0 && renderCustomerStep()}
        {step === 1 && renderProductStep()}
        {step === 2 && renderLogisticsStep()}
        {step === 3 && renderReviewStep()}
        {step === 4 && renderPaymentStep()}
        {/* Toast */}
        {toast && (
          <div
            style={{
              ...styles.toast,
              ...(toast.severity === "success"
                ? styles.toastSuccess
                : toast.severity === "error"
                ? styles.toastError
                : toast.severity === "warning"
                ? styles.toastWarning
                : styles.toastInfo)
            }}
          >
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}
