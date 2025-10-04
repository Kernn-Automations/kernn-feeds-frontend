import React, { useState, useEffect } from "react";
//import axios from "axios";
import ApiService from "../../../services/apiService";
import { useAuth } from "@/Auth";
import { useDivision } from "../../context/DivisionContext";
import MapPicker from "./MapPicker";
import customerStyles from "../Customers/Customer.module.css";



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

// Application-consistent Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#555',
    textAlign: 'left',
    textDecoration: 'underline',
    textDecorationStyle: 'solid'
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '5px',
    border: '1px solid #d9d9d9',
    boxShadow: '1px 1px 3px #333',
    gap: '12px',
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
  stepConnector: {
    width: '30px',
    height: '1px',
    backgroundColor: '#dee2e6',
    display: 'none'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'flex-start',
    width: '100%'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px',
    textDecoration: 'underline',
    textDecorationStyle: 'solid'
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px'
  },
  card: {
    border: '1px solid #d9d9d9',
    borderRadius: '5px',
    padding: '15px',
    width: '100%',
    backgroundColor: '#ffffff',
    boxShadow: '1px 1px 3px #333',
    transition: 'all 0.2s ease'
  },
  validCard: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderColor: '#28a745'
  },
  invalidCard: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderColor: '#dc3545'
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#ffffff',
    fontFamily: 'inherit',
    boxShadow: '1px 1px 3px #333'
  },
  inputFocus: {
    borderColor: 'var(--primary-color)'
  },
  select: {
    width: '100%',
    padding: '8px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    boxShadow: '1px 1px 3px #333'
  },
  button: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: '80px'
  },
  buttonPrimary: {
    backgroundColor: 'var(--primary-color)',
    color: 'white'
  },
  buttonPrimaryHover: {
    backgroundColor: '#002654'
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    color: 'white'
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
    color: 'white'
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
    color: 'white'
  },
  buttonDisabled: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
    cursor: 'not-allowed'
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#dee2e6',
    margin: '15px 0',
    border: 'none'
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid var(--primary-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '20px auto'
  },
  toast: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '4px',
    color: 'white',
    fontWeight: '500',
    zIndex: 1000,
    minWidth: '250px',
    fontSize: '14px'
  },
  toastSuccess: {
    backgroundColor: '#28a745'
  },
  toastError: {
    backgroundColor: '#dc3545'
  },
  toastWarning: {
    backgroundColor: '#ffc107',
    color: '#212529'
  },
  toastInfo: {
    backgroundColor: '#17a2b8'
  },
  radioGroup: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #d9d9d9',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    boxShadow: '1px 1px 3px #333'
  },
  radioItemSelected: {
    borderColor: 'var(--primary-color)',
    backgroundColor: 'rgba(0, 49, 118, 0.1)'
  },
  radio: {
    width: '16px',
    height: '16px'
  },
  productCard: {
    border: '1px solid #d9d9d9',
    borderRadius: '5px',
    padding: '15px',
    width: '100%',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    boxShadow: '1px 1px 3px #333'
  },
  productTitle: {
    fontWeight: '600',
    fontSize: '16px',
    marginBottom: '10px',
    color: '#555'
  },
  productInfo: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '6px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  productActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginTop: '15px',
    flexWrap: 'wrap'
  },
  productQuantityBadge: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #dee2e6',
    marginBottom: '15px'
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease'
  },
  tabActive: {
    borderBottom: '2px solid var(--primary-color)',
    color: 'var(--primary-color)'
  },
  fileInput: {
    display: 'none'
  },
  fileButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    color: '#495057'
  },
  fileButtonHover: {
    borderColor: 'var(--primary-color)',
    backgroundColor: 'rgba(0, 49, 118, 0.05)'
  },
  previewImage: {
    width: '90px',
    height: '90px',
    objectFit: 'contain',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '8px',
    fontWeight: '500'
  },
  successText: {
    color: '#28a745',
    fontSize: '14px',
    fontWeight: '500'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    color: '#6c757d',
    transition: 'all 0.2s ease'
  },
  iconButtonHover: {
    backgroundColor: '#f8f9fa',
    color: '#dc3545'
  },
  totalsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '14px'
  },
  totalsFinal: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#555',
    borderTop: '1px solid #dee2e6',
    paddingTop: '12px'
  },
  navigationButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'space-between',
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '5px',
    border: '1px solid #d9d9d9',
    boxShadow: '1px 1px 3px #333'
  },
  modal: {
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
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    minWidth: '400px',
    maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    animation: 'modalSlideIn 0.3s ease-out'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#718096',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  modalBody: {
    marginBottom: '24px'
  },
  quantityInput: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    textAlign: 'center',
    fontWeight: '600',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  productLoadingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f4f6',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  }
};

// CSS keyframes and responsive styles
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes modalSlideIn {
  0% { 
    opacity: 0; 
    transform: translateY(-20px) scale(0.95); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .step-indicator {
    flex-direction: column !important;
    gap: 8px !important;
  }
  
  .product-grid {
    grid-template-columns: 1fr !important;
  }
  
  .product-card-with-cart {
    flex-direction: column !important;
  }
  
  .cart-details-section {
    flex: 1 !important;
    margin-top: 16px !important;
  }
}
  
  .review-grid {
    grid-template-columns: 1fr !important;
  }
  
  .payment-grid {
    grid-template-columns: 1fr !important;
  }
  
  .navigation-buttons {
    flex-direction: column !important;
    gap: 12px !important;
  }
  
  .cart-summary {
    flex-direction: column !important;
    text-align: center !important;
  }
  
  .tabs {
    flex-direction: column !important;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 16px !important;
  }
  
  .title {
    font-size: 2rem !important;
  }
  
  .section-title {
    font-size: 1.5rem !important;
  }
  
  .card {
    padding: 16px !important;
  }
}
`;

export default function SalesOrderWizard() {

  const { axiosAPI } = useAuth();
  const { selectedDivision } = useDivision();
  
  // Sync division context to localStorage for API calls
  useEffect(() => {
    if (selectedDivision) {
      // Handle "All Divisions" case properly
      let divisionId;
      let isAllDivisions = false;
      
      if (selectedDivision.id === "all" || selectedDivision.isAllDivisions) {
        divisionId = "1"; // Backend expects "1" for all divisions
        isAllDivisions = true;
      } else {
        divisionId = String(selectedDivision.id);
      }
      
      localStorage.setItem('currentDivisionId', divisionId);
      localStorage.setItem('currentDivisionName', selectedDivision.name);
      localStorage.setItem('isAllDivisions', isAllDivisions ? 'true' : 'false');
      
      console.log('Sales Order - Division context synced:', { 
        divisionId, 
        name: selectedDivision.name,
        originalId: selectedDivision.id,
        isAllDivisions,
        selectedDivisionIsAllDivisions: selectedDivision.isAllDivisions
      });
    } else {
      console.log('Sales Order - No division selected yet');
    }
  }, [selectedDivision]);

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
  const [inputQuantity, setInputQuantity] = useState('');
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [loadingProductIds, setLoadingProductIds] = useState(new Set());


  // Step 3: Logistics
  const [selectedWarehouseType, setSelectedWarehouseType] = useState("");
  const [dropCount, setDropCount] = useState(1);
  const [dropOffs, setDropOffs] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Fetch priceBreakup when warehouse type changes
  useEffect(() => {
    if (selectedWarehouseType && cartId && Object.keys(cartItems).length > 0) {
      fetchCartPriceBreakup();
    }
  }, [selectedWarehouseType]);
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
    // Wait for division context to be available
    if (!selectedDivision) {
      console.log('Sales Order - Waiting for division context...');
      return;
    }
    
    async function loadCustomers() {
      try {
        setCustomerLoading(true);
        
        // Add division context parameters
        let customersUrl = ApiUrls.get_customers_sales_executive;
        const currentDivisionId = localStorage.getItem('currentDivisionId');
        const isAllDivisions = localStorage.getItem('isAllDivisions') === 'true';
        
        console.log('Sales Order - Loading customers with division context:', {
          selectedDivision,
          currentDivisionId,
          isAllDivisions,
          userRoles: JSON.parse(localStorage.getItem('user') || '{}')?.roles,
          accessToken: localStorage.getItem('accessToken') ? 'present' : 'missing',
          refreshToken: localStorage.getItem('refreshToken') ? 'present' : 'missing'
        });
        
        if (isAllDivisions) {
          customersUrl += `?showAllDivisions=true`;
        } else if (currentDivisionId) {
          customersUrl += `?divisionId=${currentDivisionId}`;
        }
        
        console.log('Customers URL with division params:', customersUrl);
        const res = await axiosAPI.get(customersUrl);
        console.log("Customers:", res);
        setCustomers(res.data.customers || []);
      } catch (e) {
        console.error('Sales Order - Failed to load customers:', e);
        console.error('Sales Order - Error details:', {
          status: e.response?.status,
          statusText: e.response?.statusText,
          data: e.response?.data,
          message: e.message
        });
        
        let errorMessage = "Failed to load customers";
        if (e.response?.status === 403) {
          errorMessage = "Access denied. You don't have permission to view customers in this division.";
        } else if (e.response?.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (e.response?.data?.message) {
          errorMessage = e.response.data.message;
        }
        
        showToast({
          title: errorMessage,
          status: "error",
          duration: 4000,
        });
      } finally {
        setCustomerLoading(false);
      }
    }
    loadCustomers();
  }, [selectedDivision]);

  // When selectedCustomer changes, fetch full details and products
  useEffect(() => {
    if (!selectedCustomer) return;
    console.log("Selected customer:", selectedCustomer);
    async function fetchCustomerDetails() {
      try {
        setCustomerLoading(true);
        
        // Add division context parameters
        let customerUrl = `${ApiUrls.get_customer_details}/${selectedCustomer}`;
        const currentDivisionId = localStorage.getItem('currentDivisionId');
        if (currentDivisionId && currentDivisionId !== '1') {
          customerUrl += `?divisionId=${currentDivisionId}`;
        } else if (currentDivisionId === '1') {
          customerUrl += `?showAllDivisions=true`;
        }
        
        console.log('Customer details URL with division params:', customerUrl);
        const res = await axiosAPI.get(customerUrl);
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
        let url = ApiUrls.getProducts.replace(':id', warehouseId);
        
        // Add division context parameters
        const currentDivisionId = localStorage.getItem('currentDivisionId');
        if (currentDivisionId && currentDivisionId !== '1') {
          url += `?divisionId=${currentDivisionId}`;
        } else if (currentDivisionId === '1') {
          url += `?showAllDivisions=true`;
        }
        
        console.log('Products URL with division params:', url);
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

  // Show quantity modal for product
  function showQuantityModalForProduct(product) {
    setSelectedProductForQty(product);
    setInputQuantity('');
    setShowQuantityModal(true);
  }

  // Fetch priceBreakup data for cart items
  async function fetchCartPriceBreakup() {
    if (!cartId) return;
    
    try {
      // Use a default warehouse type if none selected
      const warehouseType = selectedWarehouseType || 'main';
      const res = await axiosAPI.get(
        `${ApiUrls.get_review_details}/${cartId}?warehouseType=${warehouseType}`
      );
      
      if (res.data && res.data.items) {
        // Update cart items with priceBreakup data
        setCartItems(prevItems => {
          const updatedItems = { ...prevItems };
          res.data.items.forEach(reviewItem => {
            if (updatedItems[reviewItem.productId] && reviewItem.priceBreakup) {
              updatedItems[reviewItem.productId] = {
                ...updatedItems[reviewItem.productId],
                priceBreakup: reviewItem.priceBreakup
              };
            }
          });
          return updatedItems;
        });
      }
    } catch (e) {
      console.log('Failed to fetch priceBreakup data:', e);
      // Don't show error toast as this is not critical for basic cart functionality
    }
  }

  // Add or Update cart item (step 2)
  async function addOrUpdateCart(product, quantity) {
    if (!customerDetails) return;
    const isNewCart = !cartId;
    let apiUrl = isNewCart ? ApiUrls.createCart : ApiUrls.updateCart;
    
    // Add division context parameters
    const currentDivisionId = localStorage.getItem('currentDivisionId');
    if (currentDivisionId && currentDivisionId !== '1') {
      apiUrl += `?divisionId=${currentDivisionId}`;
    } else if (currentDivisionId === '1') {
      apiUrl += `?showAllDivisions=true`;
    }
    
    // Add product to loading set
    setLoadingProductIds(prev => new Set(prev).add(product.id));
    
    try {
      console.log('Cart API URL with division params:', apiUrl);
      console.log(customerDetails)
      setCartLoading(true);
      const payload = {
        cartId: cartId || null,
        customerId: customerDetails.customer_id,
        cartItems: [{ productId: product.id, quantity, unit: product.unit }],
      };
      const res = await axiosAPI.post(apiUrl, payload);
      console.log('Full API response:', res)
      if (isNewCart) setCartId(res.data.cart.id);
      
      const itemsMap = {};
      res.data.cart.items.forEach((it) => {
        console.log('Individual cart item:', it);
        itemsMap[it.productId] = {
          ...it,
          totalPrice: it.price * it.quantity,
        };
      });
      console.log('Final cart items map:', itemsMap);
      setCartItems(itemsMap);
      setDropOffLimit(res.data.logistics?.maxDropOffs || 1);
      setWarehouseOptions(res.data.logistics?.warehouseOptions || []);
      setCartTotal(res.data.totals?.cartTotalAmount || 0);
      
      // Fetch priceBreakup data for the cart items
      await fetchCartPriceBreakup();
      
      showToast({
        title: `Added ${quantity} ${product.productType === "packed" ? "packs" : product.unit} of ${product.name} to cart`,
        status: "success",
        duration: 2000,
      });
    } catch (e) {
      showToast({
        title: "Failed to update cart",
        status: "error",
        duration: 4000,
      });
    } finally {
      setCartLoading(false);
      // Remove product from loading set
      setLoadingProductIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  }

  // Handle quantity modal confirmation
  function handleQuantityConfirm() {
    const qty = parseInt(inputQuantity) || 0;
    if (selectedProductForQty && qty > 0) {
      const currentInCart = cartItems[selectedProductForQty.id]?.quantity || 0;
      addOrUpdateCart(selectedProductForQty, currentInCart + qty);
      setShowQuantityModal(false);
      setSelectedProductForQty(null);
      setInputQuantity('');
    }
  }

  // Remove item from cart
  async function removeFromCart(productId) {
    if (!cartId) return;
    try {
      setCartLoading(true);
      
      // Add division context parameters
      let removeUrl = ApiUrls.removeFromCart;
      const currentDivisionId = localStorage.getItem('currentDivisionId');
      if (currentDivisionId && currentDivisionId !== '1') {
        removeUrl += `?divisionId=${currentDivisionId}`;
      } else if (currentDivisionId === '1') {
        removeUrl += `?showAllDivisions=true`;
      }
      
      console.log('Remove from cart URL with division params:', removeUrl);
      const res = await axiosAPI.post(removeUrl, {
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
      
      // Fetch priceBreakup data for remaining cart items
      await fetchCartPriceBreakup();
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
    console.log('updateDropOff called:', { index, newData });
    setDropOffs((old) => {
      const updated = old.map((d, i) => (i === index ? { ...d, ...newData } : d));
      console.log('Updated dropOffs:', updated);
      return updated;
    });
  }

  // Handle drop-off field changes - exactly like CreateCustomer handleChange
  function handleDropOffChange(index, field, value) {
    setDropOffs((old) => {
      const updated = old.map((d, i) => 
        i === index ? { ...d, [field]: value } : d
      );
      return updated;
    });
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
      console.error("Drop-off validation error:", e);
      let errorMessage = "Failed to validate drop-off";
      
      if (e.response?.status === 403) {
        errorMessage = "You don't have permission to validate drop-offs. Please contact your administrator.";
      } else if (e.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (e.response?.status === 404) {
        errorMessage = "Drop-off validation service not found.";
      } else if (e.response?.status >= 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = `Validation failed: ${e.message}`;
      }
      
      showToast({
        title: errorMessage,
        status: "error",
        duration: 4000,
      });
      
      // Set as invalid so user can't proceed without proper validation
      setIsDropValid((old) => {
        const newArr = [...old];
        newArr[index] = false;
        return newArr;
      });
      setDropValidationErrors((old) => {
        const newArr = [...old];
        newArr[index] = e.response?.status === 403 ? "Validation failed due to permission error" : errorMessage;
        return newArr;
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
      console.log("Finalize order response:", res);
      if (res.status === 201) {
        // Update reviewData with the order information from the response
        setReviewData(prevData => ({
          ...prevData,
          orderId: res.data.orderId || res.data.id || res.data.order?.id,
          paymentId: res.data.paymentId,
          totalAmount: res.data.totalAmount || prevData?.totals?.grandTotal,
          upiId: res.data.upiId,
          bankDetails: res.data.bankDetails
        }));
        
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
      const orderId = reviewData?.orderId;
      if (!orderId) {
        showToast({
          title: "Order ID not found. Please go back and complete the review step.",
          status: "error",
          duration: 4000,
        });
        return;
      }
      
      const url = fillUrl(ApiUrls.submitPayment, { id: orderId });
      console.log("Payment URL:", url); // Debug log
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
      console.error("Payment submission error:", e);
      let errorMessage = "Error submitting payment";
      
      if (e.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (e.response?.status === 403) {
        errorMessage = "You don't have permission to submit payments.";
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      }
      
      showToast({
        title: errorMessage,
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

  const StepIndicator = () => {
    const steps = [
      { number: 1, title: 'Customer', description: 'Select customer' },
      { number: 2, title: 'Products', description: 'Add products to cart' },
      { number: 3, title: 'Logistics', description: 'Configure delivery' },
      { number: 4, title: 'Review', description: 'Review order details' },
      { number: 5, title: 'Payment', description: 'Payment information' }
    ];

    return (
      <div style={styles.stepIndicator} className="step-indicator">
        {steps.map((stepItem, index) => {
          let stepStyle = { ...styles.stepItem };
          
          if (index < step) {
            stepStyle = { ...stepStyle, ...styles.stepItemCompleted };
          } else if (index === step) {
            stepStyle = { ...stepStyle, ...styles.stepItemActive };
          } else {
            stepStyle = { ...stepStyle, ...styles.stepItemPending };
          }

          return (
            <div 
              key={index} 
              style={{
                ...stepStyle,
                cursor: index < step ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                // Only allow navigation to completed steps (green ones)
                if (index < step) {
                  setStep(index);
                }
              }}
              onMouseEnter={(e) => {
                if (index < step) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (index < step) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '';
                }
              }}
              title={index < step ? `Click to go back to ${stepItem.title}` : ''}
            >
              <div style={styles.stepNumber}>
                {index < step ? '✓' : stepItem.number}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '12px' }}>{stepItem.title}</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>{stepItem.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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

  const Input = ({ type = 'text', value, onChange, placeholder, disabled, style = {}, ...props }) => {
    const handleChange = (e) => {
      console.log('Input onChange triggered:', { type, value: e.target.value, placeholder });
      // Prevent any event bubbling that might cause issues
      e.stopPropagation();
      if (onChange) {
        onChange(e);
      }
    };

    const handleKeyDown = (e) => {
      console.log('Input onKeyDown:', e.key);
      // Prevent any default behavior that might cause issues
      e.stopPropagation();
      // Don't prevent default for normal typing keys, but prevent form submission
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleKeyUp = (e) => {
      e.stopPropagation();
    };

    const handleFocus = (e) => {
      e.target.style.borderColor = styles.inputFocus.borderColor;
      e.stopPropagation();
    };

    const handleBlur = (e) => {
      e.target.style.borderColor = styles.input.borderColor;
      e.stopPropagation();
    };

    return (
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        style={{ ...styles.input, ...style }}
        autoComplete="off"
        spellCheck="false"
        {...props}
      />
    );
  };

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

  // Quantity Modal Component
  const QuantityModal = () => {
    if (!showQuantityModal || !selectedProductForQty) return null;

    return (
      <div 
        style={styles.modal}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowQuantityModal(false);
            setSelectedProductForQty(null);
            setInputQuantity('');
          }
        }}
      >
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>Add to Cart</h3>
            <button
              style={styles.closeButton}
              onClick={() => {
                setShowQuantityModal(false);
                setSelectedProductForQty(null);
                setInputQuantity('');
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.color = '#e53e3e';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#718096';
              }}
            >
              ×
            </button>
          </div>
          
          <div style={styles.modalBody}>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#2d3748' }}>
                {selectedProductForQty.name}
              </h4>
              <p style={{ margin: '0', color: '#718096', fontSize: '14px' }}>
                Available: {selectedProductForQty.quantity || selectedProductForQty.stockQuantity || selectedProductForQty.stock || 0} {selectedProductForQty.productType === "packed" ? "packs" : selectedProductForQty.unit}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>
                Price: ₹{(selectedProductForQty.basePrice || 0).toLocaleString('en-IN')} per {selectedProductForQty.productType === "packed" ? "pack" : selectedProductForQty.unit}
              </p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
                Quantity to Add
              </label>
              <input
                type="number"
                min="1"
                value={inputQuantity}
                placeholder="Enter quantity"
                onChange={(e) => {
                  setInputQuantity(e.target.value);
                }}
                style={styles.quantityInput}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                autoFocus
              />
              
              {/* Out of stock warning */}
              {(selectedProductForQty.quantity || selectedProductForQty.stockQuantity || selectedProductForQty.stock || 0) <= 0 && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  ⚠️ This product is out of stock. Adding to cart for future availability.
                </div>
              )}
              
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0', fontWeight: '600', color: 'var(--primary-color)', fontSize: '16px' }}>
                  Total: ₹{((selectedProductForQty.basePrice || 0) * (parseInt(inputQuantity) || 0)).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
          
          <div style={styles.modalFooter}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowQuantityModal(false);
                setSelectedProductForQty(null);
                setInputQuantity('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleQuantityConfirm}
              disabled={!inputQuantity || parseInt(inputQuantity) <= 0}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Step 1: Customer Selection
  function renderCustomerStep() {
    if (customerLoading) return <Loader />;
    
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Select Customer</h2>
        <p style={styles.sectionSubtitle}>Choose a customer to create a new sales order</p>
        
        <Card>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: 'var(--primary-color)', fontSize: '14px' }}>
              Customer
            </label>
            <Select
              value={selectedCustomer || ""}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              style={{ marginBottom: '16px' }}
            >
              <option value="">Choose a customer...</option>
              {(Array.isArray(customers) ? customers : []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {customerDetails && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {customerDetails.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <h3 style={{ margin: '0', fontWeight: '600', fontSize: '16px', color: '#555' }}>
                  Customer Details
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>Review customer information</p>
              </div>
            </div>
            
            <div style={styles.flexColumn}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px' }}>Name:</span>
                <span style={{ color: '#555', fontSize: '14px' }}>{customerDetails.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '14px' }}>Phone:</span>
                <span style={{ color: '#555', fontSize: '14px' }}>{customerDetails.mobile}</span>
              </div>
              
              {customerDetails.salesExecutive && (
                <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                    Sales Executive
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary-color)', fontSize: '12px' }}>Name:</span>
                    <span style={{ color: '#555', fontSize: '12px' }}>{customerDetails.salesExecutive.name}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <Button
          variant="primary"
          disabled={!selectedCustomer}
          onClick={() => setStep(1)}
          style={{ marginTop: '15px' }}
        >
          Continue to Products →
        </Button>
      </div>
    );
  }

  // Step 2: Products + Cart
  function renderProductStep() {
    const cartItemsCount = Object.keys(cartItems).length;
    const totalCartValue = Object.values(cartItems).reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Add Products</h2>
        <p style={styles.sectionSubtitle}>Select products and quantities for this order</p>
        
        {/* Cart Summary */}
        {cartItemsCount > 0 && (
          <Card style={{ backgroundColor: 'rgba(0, 49, 118, 0.1)', borderColor: 'var(--primary-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0', fontWeight: '600', color: 'var(--primary-color)', fontSize: '16px' }}>Cart Summary</h3>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                  {cartItemsCount} item{cartItemsCount !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary-color)' }}>
                  ₹{totalCartValue.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Value</div>
              </div>
            </div>
          </Card>
        )}

        {productsLoading ? (
          <Loader />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }} className="product-grid">
              {products.map((product) => {
                const inCart = cartItems[product.id]?.quantity || 0;
                const isInCart = inCart > 0;
                
                return (
                  <Card 
                    key={product.id}
                    style={{ 
                      ...styles.productCard,
                      ...(isInCart ? { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.02)' } : {}),
                      position: 'relative',
                      display: 'flex',
                      gap: '16px'
                    }}
                    className={isInCart ? "product-card-with-cart" : ""}
                  >
                    {/* Left side - Product Info */}
                    <div style={{ flex: isInCart ? '1' : '1', minWidth: '300px' }}>
                      <div style={styles.productTitle}>{product.name}</div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div style={styles.productInfo}>
                          <span style={{ fontWeight: '600' }}>SKU:</span>
                          <span>{product.sku || product.SKU || "N/A"}</span>
                        </div>
                        <div style={styles.productInfo}>
                          <span style={{ fontWeight: '600' }}>Stock:</span>
                          <span style={{ color: (product.quantity || product.stockQuantity || product.stock || 0) > 10 ? '#28a745' : (product.quantity || product.stockQuantity || product.stock || 0) > 0 ? '#ffc107' : '#dc3545' }}>
                            {(product.quantity || product.stockQuantity || product.stock || 0) <= 0 ? 'Out of Stock' : (product.quantity || product.stockQuantity || product.stock || 0)}
                          </span>
                        </div>
                        <div style={styles.productInfo}>
                          <span style={{ fontWeight: '600' }}>Unit:</span>
                          <span>{product.productType === "packed" ? "packs" : (product.unit === "packet" ? "packs" : product.unit) || "unit"}</span>
                        </div>
                        <div style={styles.productInfo}>
                          <span style={{ fontWeight: '600' }}>Price:</span>
                          <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                            ₹{(product.basePrice || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div style={styles.productActions}>
                        <Button
                          variant={isInCart ? "success" : "primary"}
                          disabled={loadingProductIds.has(product.id)}
                          onClick={() => showQuantityModalForProduct(product)}
                          style={{ minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {loadingProductIds.has(product.id) && (
                            <div style={styles.productLoadingSpinner}></div>
                          )}
                          {loadingProductIds.has(product.id) ? 'Adding...' :
                           isInCart ? 'Add More' : 'Add to Cart'}
                        </Button>
                        
                        {inCart > 0 && (
                          <Button
                            variant="danger"
                            disabled={cartLoading}
                            onClick={() => removeFromCart(product.id)}
                            style={{ minWidth: '100px' }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - Cart Details */}
                    {inCart > 0 && (
                      <div 
                        className="cart-details-section"
                        style={{
                          flex: '0 0 280px',
                          padding: '16px',
                          backgroundColor: '#f0f9ff',
                          borderRadius: '8px',
                          border: '1px solid #bae6fd',
                          borderLeft: '3px solid #0369a1'
                        }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <h4 style={{ 
                            margin: '0', 
                            fontWeight: '600', 
                            color: '#0369a1', 
                            fontSize: '14px' 
                          }}>
                            🛒 Cart Details
                          </h4>
                          <span style={{
                            backgroundColor: '#0369a1',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            In Cart
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                           {(() => {
                             const cartItem = cartItems[product.id];
                             console.log('Cart item for product', product.id, ':', cartItem);
                             
                             const priceBreakup = cartItem?.priceBreakup?.[0];
                             console.log('Price breakup for product', product.id, ':', priceBreakup);
                             
                             if (!cartItem) {
                               return <div style={{ color: '#dc2626' }}>Cart item not found</div>;
                             }
                             
                             if (!priceBreakup) {
                               return (
                                 <div>
                                   <div style={{ color: '#dc2626', marginBottom: '8px' }}>No priceBreakup data</div>
                                   <div style={{ fontSize: '11px', color: '#64748b' }}>
                                     Available fields: {Object.keys(cartItem).join(', ')}
                                   </div>
                                 </div>
                               );
                             }
                             
                             return (
                               <>
                                 {/* Quantity */}
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ color: '#64748b', fontWeight: '500' }}>Quantity:</span>
                                   <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                     {priceBreakup.quantity || 0} {priceBreakup.unit || 'units'}
                                   </span>
                                 </div>
                                 
                                 {/* Quantity in KG */}
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ color: '#64748b', fontWeight: '500' }}>Quantity in KG:</span>
                                   <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                     {priceBreakup.quantityInkg || 'N/A'} {priceBreakup.quantityInkg ? 'kg' : ''}
                                   </span>
                                 </div>
                                 
                                 {/* Total Cost */}
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ color: '#64748b', fontWeight: '500' }}>Total Cost:</span>
                                   <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                     ₹{(priceBreakup.totalCost || 0).toLocaleString('en-IN')}
                                   </span>
                                 </div>
                                 
                                 {/* Tax Amount */}
                                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <span style={{ color: '#64748b', fontWeight: '500' }}>Tax Amount:</span>
                                   <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                     ₹{(priceBreakup.taxAmount || 0).toLocaleString('en-IN')}
                                   </span>
                                 </div>
                                 
                                 {/* Tax Breakdown */}
                                 <div style={{ marginTop: '4px' }}>
                                   <span style={{ color: '#64748b', fontWeight: '500', fontSize: '12px', marginBottom: '4px', display: 'block' }}>Tax Breakdown:</span>
                                   <div style={{ marginLeft: '8px', display: 'grid', gap: '2px' }}>
                                     {priceBreakup.taxBreakdown && priceBreakup.taxBreakdown.length > 0 ? (
                                       priceBreakup.taxBreakdown.map((tax, index) => (
                                         <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                           <span style={{ color: '#64748b' }}>{tax.name} ({tax.percentage}%):</span>
                                           <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                             ₹{(tax.amount || 0).toLocaleString('en-IN')}
                                           </span>
                                         </div>
                                       ))
                                     ) : (
                                       <div style={{ fontSize: '12px', color: '#64748b' }}>No breakdown available</div>
                                     )}
                                   </div>
                                 </div>
                                 
                                 {/* Total Amount */}
                                 <div style={{ 
                                   display: 'flex', 
                                   justifyContent: 'space-between',
                                   paddingTop: '8px',
                                   borderTop: '2px solid #0369a1',
                                   marginTop: '8px'
                                 }}>
                                   <span style={{ color: '#0369a1', fontWeight: '700', fontSize: '14px' }}>Total Amount:</span>
                                   <span style={{ fontWeight: '700', color: '#0369a1', fontSize: '16px' }}>
                                     ₹{(priceBreakup.totalAmount || 0).toLocaleString('en-IN')}
                                   </span>
                                 </div>
                               </>
                             );
                           })()}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
              <Button
                variant="secondary"
                onClick={() => setStep(0)}
              >
                ← Back to Customer
              </Button>
              <Button
                variant="primary"
                onClick={confirmProductsStep}
                disabled={cartItemsCount === 0}
              >
                Continue to Logistics →
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Step 3: Logistics
  function renderDropOffCard(index, drop) {
    return (
      <Card
        variant={
          isDropValid[index]
            ? "valid"
            : dropValidationErrors[index]
            ? "invalid"
            : undefined
        }
        style={{ marginBottom: '16px', maxWidth: '600px', width: '100%' }}
      >
        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
          Drop-off #{index + 1}
        </div>
        
        <div className="row m-0 p-3">
          <div className="col-6">
            <div className={customerStyles.longform}>
              <label>Receiver Name :</label>
              <input
                type="text"
                defaultValue={drop.receiverName}
                onBlur={(e) => handleDropOffChange(index, "receiverName", e.target.value)}
                style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
              />
            </div>
          </div>
          <div className="col-6">
            <div className={customerStyles.longform}>
              <label>Receiver Mobile :</label>
              <input
                type="text"
                defaultValue={drop.receiverMobile}
                onBlur={(e) => handleDropOffChange(index, "receiverMobile", e.target.value)}
                style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
              />
            </div>
          </div>
          <div className="col-6">
            <div className={customerStyles.longform}>
              <label>Plot :</label>
              <input
                type="text"
                defaultValue={drop.plot}
                onBlur={(e) => handleDropOffChange(index, "plot", e.target.value)}
                style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
              />
            </div>
          </div>
          <div className="col-6">
            <div className={customerStyles.longform}>
              <label>Street :</label>
              <input
                type="text"
                defaultValue={drop.street}
                onBlur={(e) => handleDropOffChange(index, "street", e.target.value)}
                style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
              />
            </div>
          </div>
          <div className="col-6">
            <div className={customerStyles.longform}>
              <label>Area :</label>
              <input
                type="text"
                defaultValue={drop.area}
                onBlur={(e) => handleDropOffChange(index, "area", e.target.value)}
                style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
              />
            </div>
          </div>
          <div className="col-6">
            <div className={customerStyles.longform}>
              <label>City :</label>
              <input
                type="text"
                defaultValue={drop.city}
                onBlur={(e) => handleDropOffChange(index, "city", e.target.value)}
                style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
              />
            </div>
          </div>
          <div className="col-6">
            <div className={customerStyles.longform}>
              <label>Pincode :</label>
              <input
                type="text"
                defaultValue={drop.pincode}
                onBlur={(e) => handleDropOffChange(index, "pincode", e.target.value)}
                style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>
        <div style={{ marginTop: '15px' }}>
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
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            disabled={logisticsLoading}
            onClick={() => validateDropOff(index)}
          >
            Validate Dropoff
          </Button>
          {dropValidationErrors[index] && dropValidationErrors[index].includes("permission") && (
            <Button
              variant="secondary"
              disabled={logisticsLoading}
              onClick={() => {
                // Allow manual validation bypass for permission issues
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
                showToast({
                  title: "Drop-off marked as valid (validation bypassed)",
                  status: "warning",
                  duration: 3000,
                });
              }}
              style={{ fontSize: '12px' }}
            >
              Skip Validation
            </Button>
          )}
        </div>
        {dropValidationErrors[index] && (
          <div style={styles.errorText}>
            {dropValidationErrors[index]}
            {dropValidationErrors[index].includes("permission") && (
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#ffc107' }}>
                You can use "Skip Validation" to proceed without validation.
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }

  function renderLogisticsStep() {
    if (!warehouseOptions.length)
      return (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Logistics</h2>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ color: '#718096', margin: '0' }}>No warehouse options available</h3>
              <p style={{ color: '#a0aec0', margin: '8px 0 0 0' }}>Please contact support for assistance</p>
            </div>
          </Card>
        </div>
      );
      
    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Logistics</h2>
        <p style={styles.sectionSubtitle}>Configure delivery details and drop-off locations</p>
        
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#555', fontSize: '14px' }}>Select Warehouse</h3>
          <div style={styles.radioGroup}>
            {warehouseOptions.map(opt => {
              const isSelected = selectedWarehouseType === opt;
              return (
                <label 
                  key={opt} 
                  style={{
                    ...styles.radioItem,
                    ...(isSelected ? styles.radioItemSelected : {})
                  }}
                >
                  <input
                    type="radio"
                    name="warehouseType"
                    style={styles.radio}
                    value={opt}
                    checked={isSelected}
                    onChange={e => setSelectedWarehouseType(e.target.value)}
                  />
                  <span style={{ fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '12px' }}>
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#555', fontSize: '14px' }}>
            Number of Drop-offs
          </h3>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px' }}>
            Maximum allowed: {dropOffLimit}
          </p>
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
            style={{ maxWidth: '200px' }}
          >
            {Array.from({ length: dropOffLimit }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} Drop-off{i > 0 ? 's' : ''}
              </option>
            ))}
          </Select>
        </div>

        <hr style={styles.divider} />
        
        {dropOffs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end' }}>
            {dropOffs.map((drop, idx) => (
              <div key={`dropoff-${idx}`}>
                {renderDropOffCard(idx, drop)}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
              <h3 style={{ color: '#718096', margin: '0' }}>No drop-offs configured</h3>
              <p style={{ color: '#a0aec0', margin: '8px 0 0 0' }}>Select number of drop-offs above</p>
            </div>
          </Card>
        )}
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
          <Button
            variant="secondary"
            onClick={() => setStep(1)}
          >
            ← Back to Products
          </Button>
          <Button
            variant="primary"
            onClick={confirmLogisticsStep}
            disabled={!selectedWarehouseType || !isDropValid.every(Boolean)}
          >
            Continue to Review →
          </Button>
        </div>
      </div>
    );
  }

  // Step 4: Review
  function renderReviewStep() {
    if (reviewLoading) return <Loader />;
    if (!reviewData)
      return (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Review Order</h2>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <h3 style={{ color: '#718096', margin: '0' }}>No review data available</h3>
              <p style={{ color: '#a0aec0', margin: '8px 0 0 0' }}>Please go back and complete the previous steps</p>
            </div>
          </Card>
        </div>
      );

    const c = reviewData.customer || {};
    const s = reviewData.salesExecutive || {};
    const w = reviewData.warehouse || {};
    const drops = dropOffs || [];
    const items = reviewData.items || [];
    const totals = reviewData.totals || {};

    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Review Order</h2>
        <p style={styles.sectionSubtitle}>Please review all order details before proceeding to payment</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Customer Information */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                👤
              </div>
              <div>
                <h3 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Customer</h3>
                <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Order recipient</p>
              </div>
            </div>
            <div style={styles.flexColumn}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Name:</span>
                <span style={{ color: '#2d3748' }}>{c.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Phone:</span>
                <span style={{ color: '#2d3748' }}>{c.mobile}</span>
              </div>
              {c.address && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ fontWeight: '600', color: '#4a5568' }}>Address:</span>
                  <span style={{ color: '#2d3748', textAlign: 'right', maxWidth: '60%' }}>{c.address}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Sales Executive */}
          {s.name && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  👨‍💼
                </div>
                <div>
                  <h3 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Sales Executive</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Account manager</p>
                </div>
              </div>
              <div style={styles.flexColumn}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '600', color: '#4a5568' }}>Name:</span>
                  <span style={{ color: '#2d3748' }}>{s.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: '600', color: '#4a5568' }}>Phone:</span>
                  <span style={{ color: '#2d3748' }}>{s.mobile}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ fontWeight: '600', color: '#4a5568' }}>Email:</span>
                  <span style={{ color: '#2d3748' }}>{s.email}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Warehouse */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                🏪
              </div>
              <div>
                <h3 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Warehouse</h3>
                <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Fulfillment center</p>
              </div>
            </div>
            <div style={styles.flexColumn}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Name:</span>
                <span style={{ color: '#2d3748' }}>{w.name || "Warehouse"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontWeight: '600', color: '#4a5568' }}>Address:</span>
                <span style={{ color: '#2d3748', textAlign: 'right', maxWidth: '60%' }}>
                  {[w.street, w.area, w.city, w.pincode].filter(Boolean).join(", ") || "Address not available"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Drop-off Points */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              📍
            </div>
            <div>
              <h3 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Drop-off Points</h3>
              <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Delivery locations</p>
            </div>
          </div>
          {drops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
              No drop-offs configured
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {drops.map((d, idx) => (
                <div key={idx} style={{ 
                  padding: '16px', 
                  backgroundColor: '#f7fafc', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontWeight: '700', color: '#2d3748', marginBottom: '8px' }}>
                    Drop-off #{idx + 1}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#4a5568' }}>Receiver:</span>
                    <span style={{ color: '#2d3748' }}>{d.receiverName || "Not specified"}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#4a5568' }}>Phone:</span>
                    <span style={{ color: '#2d3748' }}>{d.receiverMobile || "Not specified"}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#4a5568' }}>Address:</span>
                    <span style={{ color: '#2d3748', textAlign: 'right', maxWidth: '60%' }}>
                      {[d.plot, d.street, d.area, d.city, d.pincode].filter(Boolean).join(", ") || "Address not complete"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Products */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#8b5cf6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              📦
            </div>
            <div>
              <h3 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Products</h3>
              <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Order items</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {items.map((item, i) => (
              <div key={i} style={{ 
                padding: '16px', 
                backgroundColor: '#f7fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontWeight: '700', color: '#2d3748', marginBottom: '12px', fontSize: '16px' }}>
                  {item.productName}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#4a5568' }}>Quantity:</span>
                    <span style={{ color: '#2d3748' }}>
                      {item.productType === "packed"
                        ? `${item.quantity} packs`
                        : `${item.quantity} ${item.unit}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#4a5568' }}>Base Price:</span>
                    <span style={{ color: '#2d3748' }}>₹{item.basePrice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#4a5568' }}>Tax:</span>
                    <span style={{ color: '#2d3748' }}>₹{item.taxAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', color: '#667eea' }}>Total:</span>
                    <span style={{ color: '#667eea', fontWeight: '700' }}>₹{item.totalAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Totals */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              💰
            </div>
            <div>
              <h3 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Order Summary</h3>
              <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Price breakdown</p>
            </div>
          </div>
          <div style={styles.flexColumn}>
            <div style={styles.totalsRow}>
              <span style={{ fontWeight: '600', color: '#4a5568' }}>Subtotal</span>
              <span style={{ color: '#2d3748', fontWeight: '600' }}>₹{totals.subtotal}</span>
            </div>
            <div style={styles.totalsRow}>
              <span style={{ fontWeight: '600', color: '#4a5568' }}>Tax</span>
              <span style={{ color: '#2d3748', fontWeight: '600' }}>₹{totals.tax}</span>
            </div>
            <hr style={styles.divider} />
            <div style={{ ...styles.totalsRow, ...styles.totalsFinal }}>
              <span>Grand Total</span>
              <span>₹{totals.grandTotal}</span>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
          <Button
            variant="secondary"
            onClick={() => setStep(2)}
          >
            ← Back to Logistics
          </Button>
          <Button
            onClick={finalizeOrder}
            disabled={reviewLoading}
            variant="primary"
          >
            Confirm & Continue to Payment →
          </Button>
        </div>
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
      console.log(`Updating payment ${idx}, field: ${field}, value:`, value);
      const newPayments = [...payments];
      newPayments[idx][field] = value;
      setPayments(newPayments);
      console.log('Updated payments:', newPayments);
    }

    return (
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Payment Details</h2>
        <p style={styles.sectionSubtitle}>Complete payment information to finalize the order</p>
        
        {/* Order Summary */}
        <Card style={{ backgroundColor: 'rgba(102, 126, 234, 0.05)', borderColor: '#667eea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: '0', fontWeight: '700', color: '#667eea' }}>Order Summary</h3>
              <p style={{ margin: '4px 0 0 0', color: '#4a5568' }}>
                Order ID: {reviewData?.orderId || "Pending"}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
                ₹{(reviewData?.totalAmount || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '14px', color: '#718096' }}>Total Amount</div>
            </div>
          </div>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: '700', color: '#2d3748' }}>Payment Method</h3>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activePaymentTab === 0 ? styles.tabActive : {})
              }}
              onClick={() => setActivePaymentTab(0)}
              type='button'
            >
              💳 UPI Payment
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activePaymentTab === 1 ? styles.tabActive : {})
              }}
              onClick={() => setActivePaymentTab(1)}
              type='button'
            >
              🏦 Bank Transfer
            </button>
          </div>
          
          {activePaymentTab === 0 && (
            <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px'
                }}>
                  💳
                </div>
                <div>
                  <h4 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>UPI Payment Details</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Use the following UPI ID for payment</p>
                </div>
              </div>
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontFamily: 'monospace',
                fontSize: '16px',
                fontWeight: '600',
                color: '#2d3748',
                textAlign: 'center'
              }}>
                {reviewData?.upiId || "UPI ID not available"}
              </div>
            </div>
          )}
          
          {activePaymentTab === 1 && (
            <div style={{ padding: '20px', backgroundColor: '#f7fafc', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px'
                }}>
                  🏦
                </div>
                <div>
                  <h4 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Bank Transfer Details</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Use the following bank details for transfer</p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: '600', color: '#4a5568' }}>Account Number:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#2d3748' }}>
                    {reviewData?.bankDetails?.accountNumber || "Not available"}
                  </span>
                </div>
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontWeight: '600', color: '#4a5568' }}>IFSC Code:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#2d3748' }}>
                    {reviewData?.bankDetails?.ifsc || "Not available"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Payment Records */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Payment Records</h3>
          <Button
            onClick={addPayment}
            variant="success"
            style={{ minWidth: 'auto' }}
          >
            ➕ Add Payment
          </Button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {payments.map((payment, i) => (
            <Card key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#8b5cf6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <h4 style={{ margin: '0', fontWeight: '700', color: '#2d3748' }}>Payment #{i + 1}</h4>
                    <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>Payment details and proof</p>
                  </div>
                </div>
                {payments.length > 1 && (
                  <button
                    style={{
                      ...styles.iconButton,
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      borderRadius: '8px'
                    }}
                    onClick={() => removePayment(i)}
                    title="Remove payment"
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fecaca';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#fee2e2';
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    defaultValue={payment.transactionDate}
                    onBlur={e => updatePaymentFieldLocal(i, "transactionDate", e.target.value)}
                    style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
                    Payment Mode
                  </label>
                  <Select
                    value={payment.paymentMode}
                    onChange={e => updatePaymentFieldLocal(i, "paymentMode", e.target.value)}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    defaultValue={payment.amount || ''}
                    onBlur={e => updatePaymentFieldLocal(i, "amount", e.target.value)}
                    step="0.01"
                    min="0"
                    style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    placeholder="Reference ID/UTR"
                    defaultValue={payment.reference || ''}
                    onBlur={e => updatePaymentFieldLocal(i, "reference", e.target.value)}
                    style={{ width: '150px', height: '27px', paddingLeft: '4px', borderRadius: '4px', border: '1px solid #d9d9d9', boxShadow: '1px 1px 3px #333', fontWeight: '500', fontSize: '14px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
                    Transaction Status
                  </label>
                  <Select
                    value={payment.transactionStatus}
                    onChange={e => updatePaymentFieldLocal(i, "transactionStatus", e.target.value)}
                  >
                    <option value="Completed">✅ Completed</option>
                    <option value="Processing">⏳ Processing</option>
                    <option value="Failed">❌ Failed</option>
                  </Select>
                </div>
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
                  Remarks
                </label>
              <textarea
                rows={3}
                placeholder="Add any additional notes or remarks..."
                defaultValue={payment.remark || ''}
                onBlur={e => updatePaymentFieldLocal(i, "remark", e.target.value)}
                style={{ 
                  width: '100%',
                  height: '27px',
                  paddingLeft: '4px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  boxShadow: '1px 1px 3px #333',
                  fontWeight: '500',
                  fontSize: '14px',
                  minHeight: "80px", 
                  resize: "vertical",
                  fontFamily: 'inherit'
                }}
              />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568' }}>
                  Payment Proof
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <label 
                    style={{
                      ...styles.fileButton,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      Object.assign(e.target.style, styles.fileButtonHover);
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#f7fafc';
                    }}
                  >
                    📎 Upload Proof
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={styles.fileInput}
                      onChange={e => handleFileUpload(e, i)}
                    />
                  </label>
                  {payment.proofPreviewUrl && (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={payment.proofPreviewUrl}
                        alt={`Payment proof #${i + 1}`}
                        style={styles.previewImage}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
          <Button
            variant="secondary"
            onClick={() => setStep(3)}
          >
            ← Back to Review
          </Button>
          <Button
            variant="primary"
            onClick={submitPayments}
            disabled={paymentUploading}
            style={{ minWidth: '200px' }}
          >
            {paymentUploading ? '⏳ Submitting...' : '✅ Submit Order'}
          </Button>
        </div>
      </div>
    );
  }

  // Main render function
  return (
    <>
      {/* Loader Keyframes */}
      <style>{keyframes}</style>
      <div style={styles.container} className="container">
        <div style={styles.title} className="title">Create New Sales Order</div>
        <StepIndicator />
        {step === 0 && renderCustomerStep()}
        {step === 1 && renderProductStep()}
        {step === 2 && renderLogisticsStep()}
        {step === 3 && renderReviewStep()}
        {step === 4 && renderPaymentStep()}
        
        {/* Quantity Modal */}
        <QuantityModal />
        
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
