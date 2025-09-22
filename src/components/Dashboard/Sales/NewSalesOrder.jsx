import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Spinner,
  Text,
  VStack,
  HStack,
  RadioGroup,
  Radio,
  Stack,
  Input,
  Textarea,
  useToast,
  IconButton,
  Image,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { FaPlus as AddIcon, FaTrash as DeleteIcon } from "react-icons/fa6";
import axios from "axios";
import { apiService as axiosAPI } from "@/services/apiService";

import Divider from "@/components/ui/Divider";

// Your ApiUrls constant (simplified, replace with your import)
const ApiUrls = {
  createCart: "/cart",
  updateCart: "/cart/update",
  removeFromCart: "/cart/remove",
  getCart: "/cart",
  validate_drops: "/drops/validate",
  getProducts: "/warehouse/products",
  finalizeOrder: "/sales-orders/",
  get_review_details: "/cart/review",
  submitPayment: "/sales-orders/:id/payment",
};

// Axios instance example with token, adapt to your auth logic

// Utils to replace :id in endpoints
const fillUrl = (url, replacements) =>
  Object.entries(replacements).reduce(
    (acc, [key, val]) => acc.replace(`:${key}`, val),
    url
  );

// === Main Component ===
export default function SalesOrderWizard() {
  const toast = useToast();

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

  // === Step 1: Customer Load & Select ===
  useEffect(() => {
    // load customers (example API call)
    async function loadCustomers() {
      try {
        setCustomerLoading(true);
        const res = await axiosAPI.get(ApiUrls.get_customers_sales_executive);
        setCustomers(res.data || []);
      } catch (e) {
        toast({
          title: "Failed to load customers",
          status: "error",
          duration: 4000,
          isClosable: true,
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
    async function fetchCustomerDetails() {
      try {
        setCustomerLoading(true);
        const res = await axiosAPI.get(
          `${ApiUrls.get_customer_details}/${selectedCustomer}`
        );
        setCustomerDetails(res.data);
        setSelectedWarehouseType(""); // reset logistics selection
      } catch (e) {
        toast({
          title: "Failed to load customer details",
          status: "error",
          duration: 4000,
          isClosable: true,
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
        const res = await axiosAPI.get(
          `${ApiUrls.getProducts}?warehouseId=${warehouseId}`
        );
        setProducts(res.data.products || []);
        // Set available products for logistics step reference
        setAvailableProducts(res.data.products || []);
      } catch (e) {
        toast({
          title: "Failed to load products",
          status: "error",
          duration: 4000,
          isClosable: true,
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
      setCartLoading(true);
      const payload = {
        cartId: cartId || null,
        customerId: customerDetails.customerId,
        cartItems: [{ productId: product.id, quantity, unit: product.unit }],
      };
      const res = await axiosAPI.post(apiUrl, payload);
      if (isNewCart) setCartId(res.data.cart.id);
      // Update cart items map and metadata
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
      toast({
        title: "Failed to update cart",
        status: "error",
        duration: 4000,
        isClosable: true,
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
      // refresh cartItems from response
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
      toast({
        title: "Failed to remove item",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setCartLoading(false);
    }
  }

  // Confirm step 2 to go to step 3 (logistics)
  function confirmProductsStep() {
    if (Object.keys(cartItems).length === 0) {
      toast({
        title: "Add at least one product",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // Initialize dropoffs for step 3 with 1 dropoff by default
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

  // Update dropoff details inline function
  function updateDropOff(index, newData) {
    setDropOffs((old) =>
      old.map((d, i) => (i === index ? { ...d, ...newData } : d))
    );
  }

  // Update product quantity in dropoff
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

  // Validate a dropoff via API
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
      setLogisticsLoading(true);
      const res = await axiosAPI.post(ApiUrls.validate_drops, {
        customerId: customerDetails.customerId,
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
      toast({
        title: "Failed to validate drop-off",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLogisticsLoading(false);
    }
  }

  // Confirm logistics step go forward
  function confirmLogisticsStep() {
    if (!selectedWarehouseType) {
      toast({
        title: "Select warehouse type",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!isDropValid.every(Boolean)) {
      toast({
        title: "Validate all dropoffs",
        status: "warning",
        duration: 3000,
        isClosable: true,
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
      toast({
        title: "Assign products to dropoffs with quantities",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setStep(3);
    // Fetch review details next step
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
      toast({
        title: "Failed to fetch review data",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setReviewLoading(false);
    }
  }
  //const [reviewLoading, setReviewLoading] = useState(false);

  // === Step 4: Review ===
  async function finalizeOrder() {
    if (!reviewData) return;
    try {
      setReviewLoading(true);
      const payload = {
        customerId: selectedCustomer,
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
      if (res.status === 201) {
        toast({
          title: "Order finalized. Proceed to payment.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setStep(4);
      } else {
        toast({
          title: "Failed to finalize order",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (e) {
      toast({
        title: "Error finalizing order",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setReviewLoading(false);
    }
  }

  // === Step 5: Payment ===

  // Payment handlers
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
        toast({ title: `Enter valid amount for payment #${i + 1}`, status: "error", isClosable: true });
        return false;
      }
      if (!p.transactionDate) {
        toast({ title: `Select date for payment #${i + 1}`, status: "error", isClosable: true });
        return false;
      }
      if (!p.reference.trim()) {
        toast({ title: `Enter reference for payment #${i + 1}`, status: "error", isClosable: true });
        return false;
      }
      if (!p.proofFile) {
        toast({ title: `Upload proof for payment #${i + 1}`, status: "error", isClosable: true });
        return false;
      }
      if ((p.transactionStatus === "Processing" || p.transactionStatus === "Failed") && !p.remark.trim()) {
        toast({ title: `Add remark for payment #${i + 1}`, status: "error", isClosable: true });
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
        toast({
          title: "Payment submitted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Redirect or reset flow as needed
        setStep(0);
      } else {
        toast({
          title: "Failed to submit payment",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (e) {
      toast({
        title: "Error submitting payment",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setPaymentUploading(false);
    }
  }


  // === Render Sections ===

  // Step 1 Customer select UI
  function renderCustomerStep() {
    if (customerLoading) return <Spinner />;
    return (
      <VStack align="flex-start" spacing={3}>
        <Heading size="md">Select Customer</Heading>
        <Select
          placeholder="Select Customer"
          value={selectedCustomer || ""}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          {customers.map((c) => (
            <option key={c.customerId} value={c.customerId}>
              {c.name}
            </option>
          ))}
        </Select>
        {customerDetails && (
          <Box mt={4} p={4} borderWidth={1} borderRadius="md" width="100%">
            <Text fontWeight="bold">Customer Details</Text>
            <Text>Name: {customerDetails.name}</Text>
            <Text>Phone: {customerDetails.phone}</Text>
            {customerDetails.employee && (
              <>
                <Divider my={2} />
                <Text fontWeight="bold">Associated Employee</Text>
                <Text>Name: {customerDetails.employee.name}</Text>
                <Text>Employee ID: {customerDetails.employee.employeeId}</Text>
                <Text>Team Name: {customerDetails.employee.teamName}</Text>
                <Text>Team ID: {customerDetails.employee.teamId}</Text>
              </>
            )}
          </Box>
        )}
        <Button
          mt={6}
          colorScheme="blue"
          isDisabled={!selectedCustomer}
          onClick={() => setStep(1)}
        >
          Confirm Customer
        </Button>
      </VStack>
    );
  }

  // Step 2 Product list UI
  function renderProductStep() {
    return (
      <VStack align="flex-start" spacing={4}>
        <Heading size="md">Add Products</Heading>
        {productsLoading ? (
          <Spinner />
        ) : (
          <>
            {products.map((product) => {
              const inCart = cartItems[product.id]?.quantity || 0;
              return (
                <Box
                  key={product.id}
                  borderWidth={1}
                  borderRadius="md"
                  p={4}
                  w="100%"
                >
                  <Text fontWeight="bold">{product.name}</Text>
                  <Text>SKU: {product.sku || "N/A"}</Text>
                  <Text>Current Stock: {product.stock || 0}</Text>
                  <Text>
                    Quantity Unit:{" "}
                    {product.productType === "packed"
                      ? `packs`
                      : product.unit || "unit"}
                  </Text>
                  <HStack mt={2}>
                    <Button
                      size="sm"
                      onClick={() => {
                        const newQty = inCart + 1;
                        addOrUpdateCart(product, newQty);
                      }}
                      isLoading={cartLoading}
                    >
                      Add
                    </Button>
                    {inCart > 0 && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => removeFromCart(product.id)}
                        isLoading={cartLoading}
                      >
                        Remove
                      </Button>
                    )}
                    <Text ml={2}>
                      {inCart > 0 ? `In Cart: ${inCart}` : "Not Added"}
                    </Text>
                  </HStack>
                </Box>
              );
            })}
            <Button mt={6} onClick={confirmProductsStep}>
              Confirm Products
            </Button>
          </>
        )}
      </VStack>
    );
  }

  // Step 3 Logistics UI
  function renderDropOffCard(index, drop) {
    return (
      <Box
        key={index}
        borderWidth={1}
        borderRadius="md"
        p={4}
        mb={4}
        w="100%"
        backgroundColor={isDropValid[index] ? "green.50" : "red.50"}
      >
        <Heading size="sm" mb={2}>
          Drop-off #{index + 1}
        </Heading>
        <Stack spacing={2}>
          <Input
            placeholder="Receiver Name"
            value={drop.receiverName}
            onChange={(e) =>
              updateDropOff(index, { receiverName: e.target.value })
            }
          />
          <Input
            placeholder="Receiver Mobile"
            value={drop.receiverMobile}
            onChange={(e) =>
              updateDropOff(index, { receiverMobile: e.target.value })
            }
          />
          <Input
            placeholder="Plot"
            value={drop.plot}
            onChange={(e) => updateDropOff(index, { plot: e.target.value })}
          />
          <Input
            placeholder="Street"
            value={drop.street}
            onChange={(e) => updateDropOff(index, { street: e.target.value })}
          />
          <Input
            placeholder="Area"
            value={drop.area}
            onChange={(e) => updateDropOff(index, { area: e.target.value })}
          />
          <Input
            placeholder="City"
            value={drop.city}
            onChange={(e) => updateDropOff(index, { city: e.target.value })}
          />
          <Input
            placeholder="Pincode"
            value={drop.pincode}
            onChange={(e) => updateDropOff(index, { pincode: e.target.value })}
          />
        </Stack>

        <Divider my={4} />

        <Heading size="sm" mb={2}>
          Product Assignment
        </Heading>
        {drop.items?.map((item, i) => (
          <HStack key={item.productId} mb={2}>
            <Text flex="1">
              {item.productName} ({item.quantity} {item.unit})
            </Text>
            <Input
              type="number"
              min={0}
              max={cartItems[item.productId]?.quantity}
              value={item.quantity}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val > cartItems[item.productId]?.quantity) val = cartItems[item.productId]?.quantity;
                if (val < 0) val = 0;
                updateDropItemQuantity(index, item.productId, val);
              }}
              width={24}
            />
          </HStack>
        ))}

        <Button
          mt={3}
          colorScheme="teal"
          size="sm"
          onClick={() => validateDropOff(index)}
          isLoading={logisticsLoading}
        >
          Validate Dropoff
        </Button>
        {dropValidationErrors[index] && (
          <Text color="red.500" mt={1}>
            {dropValidationErrors[index]}
          </Text>
        )}
      </Box>
    );
  }

  function renderLogisticsStep() {
    if (!warehouseOptions?.length) return <Text>No warehouse options available</Text>;
    return (
      <VStack align="flex-start" spacing={4}>
        <Heading size="md">Logistics</Heading>
        <Text>Select Warehouse</Text>
        <RadioGroup
          value={selectedWarehouseType}
          onChange={setSelectedWarehouseType}
          mb={4}
        >
          <Stack direction="row" spacing={4}>
            {warehouseOptions.map((opt) => (
              <Radio key={opt} value={opt}>
                {opt.toUpperCase()}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>

        <Text>Select Number of Drop-offs (Max {dropOffLimit})</Text>
        <Select
          w={32}
          value={dropCount}
          onChange={(e) => {
            const val = Number(e.target.value);
            setDropCount(val);
            // adjust dropOffs array length accordingly
            setDropOffs((oldDrops) => {
              if (val > oldDrops.length) {
                // add empty dropoffs
                const additions = Array(val - oldDrops.length)
                  .fill(0)
                  .map((_, i) => ({
                    order: oldDrops.length + i + 1,
                    receiverName: "",
                    receiverMobile: "",
                    plot: "",
                    street: "",
                    area: "",
                    city: "",
                    pincode: "",
                    items: [],
                  }));
                return [...oldDrops, ...additions];
              } else {
                return oldDrops.slice(0, val);
              }
            });
            setIsDropValid(Array(val).fill(false));
            setDropValidationErrors(Array(val).fill(null));
          }}
          mb={6}
        >
          {[...Array(dropOffLimit).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </Select>

        <Divider />

        {dropOffs.length > 0 ? (
          dropOffs.map((drop, i) => renderDropOffCard(i, drop))
        ) : (
          <Text>No dropoff configured</Text>
        )}

        <Button mt={4} colorScheme="blue" onClick={confirmLogisticsStep}>
          Confirm Logistics
        </Button>
      </VStack>
    );
  }

  // Step 4 Review UI
  function renderReviewStep() {
    if (reviewLoading) return <Spinner />;
    if (!reviewData) return <Text>No review data available</Text>;

    const c = reviewData.customer || {};
    const s = reviewData.salesExecutive || {};
    const w = reviewData.warehouse || {};
    const drops = dropOffs || [];
    const items = reviewData.items || [];
    const totals = reviewData.totals || {};

    return (
      <VStack align="flex-start" spacing={4}>
        <Heading size="md">Review Order</Heading>

        {/* Customer details */}
        <Box borderWidth={1} borderRadius="md" p={4} w="100%">
          <Text fontWeight="bold">Customer</Text>
          <Text>{c.name}</Text>
          <Text>{c.mobile}</Text>
          <Text>{c.address || "Address not available"}</Text>
        </Box>

        {/* Sales Executive */}
        {s.name && (
          <Box borderWidth={1} borderRadius="md" p={4} w="100%">
            <Text fontWeight="bold">Sales Executive</Text>
            <Text>{s.name}</Text>
            <Text>{s.mobile}</Text>
            <Text>{s.email}</Text>
          </Box>
        )}

        {/* Warehouse */}
        <Box borderWidth={1} borderRadius="md" p={4} w="100%">
          <Text fontWeight="bold">Warehouse</Text>
          <Text>{w.name || "Warehouse"}</Text>
          <Text>
            {[w.street, w.area, w.city, w.pincode].filter(Boolean).join(", ")}
          </Text>
        </Box>

        {/* Drop-offs */}
        <Box borderWidth={1} borderRadius="md" p={4} w="100%">
          <Text fontWeight="bold">Drop-off Points</Text>
          {drops.length === 0 && <Text>No drop-offs configured</Text>}
          {drops.map((d, i) => (
            <Box key={i} my={2}>
              <Text>{d.receiverName || "Receiver"}</Text>
              <Text>
                {[d.plot, d.street, d.area, d.city, d.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Products */}
        <Box borderWidth={1} borderRadius="md" p={4} w="100%">
          <Text fontWeight="bold">Products</Text>
          {items.map((item, i) => (
            <Box key={i} my={2}>
              <Text fontWeight="bold">{item.productName}</Text>
              <Text>
                {item.productType === "packed"
                  ? `Qty: ${item.quantity} packs (${item.packageWeight} ${item.packageWeightUnit} each)`
                  : `Qty: ${item.quantity} ${item.unit}`}
              </Text>
              <Text>Base Price: ₹{item.basePrice}</Text>
              <Text>Tax: ₹{item.taxAmount}</Text>
              <Text>Total: ₹{item.totalAmount}</Text>
            </Box>
          ))}
        </Box>

        {/* Totals */}
        <Box borderWidth={1} borderRadius="md" p={4} w="100%">
          <HStack justify="space-between">
            <Text>Subtotal</Text>
            <Text>₹{totals.subtotal}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Tax</Text>
            <Text>₹{totals.tax}</Text>
          </HStack>
          <Divider />
          <HStack justify="space-between" fontWeight="bold">
            <Text>Grand Total</Text>
            <Text>₹{totals.grandTotal}</Text>
          </HStack>
        </Box>

        <Button onClick={finalizeOrder} isLoading={reviewLoading} mt={4}>
          Confirm and Go to Payment
        </Button>
      </VStack>
    );
  }

  // Step 5 Payment UI
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

    function updatePaymentField(idx, field, value) {
      const newPayments = [...payments];
      newPayments[idx][field] = value;
      setPayments(newPayments);
    }

    return (
      <VStack align="flex-start" spacing={4}>
        <Heading size="md">Payment Details</Heading>
        <Text>
          Sales Order ID: {reviewData?.orderId || ""}
        </Text>
        <Text>Total Amount: ₹{reviewData?.totalAmount || 0}</Text>

        <Tabs>
          <TabList>
            <Tab>UPI</Tab>
            <Tab>Bank</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {/* UPI Payment info */}
              <Text>UPI ID: {reviewData?.upiId || "N/A"}</Text>
              {/* Add QR code or payment link UI here if needed */}
            </TabPanel>
            <TabPanel>
              {/* Bank Payment info */}
              <Text>Bank Account: {reviewData?.bankDetails?.accountNumber || "N/A"}</Text>
              <Text>IFSC: {reviewData?.bankDetails?.ifsc || "N/A"}</Text>
              {/* Add more bank details here */}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {payments.map((payment, i) => (
          <Box key={i} borderWidth={1} borderRadius="md" p={4} w="100%">
            <HStack justify="space-between">
              <Text fontWeight="bold">Payment #{i + 1}</Text>
              <IconButton
                aria-label="Remove payment"
                icon={<DeleteIcon />}
                onClick={() => removePayment(i)}
                isDisabled={payments.length === 1}
              />
            </HStack>
            <Stack spacing={3} mt={2}>
              <Input
                type="date"
                value={payment.transactionDate}
                onChange={(e) =>
                  updatePaymentField(i, "transactionDate", e.target.value)
                }
              />
              <Select
                value={payment.paymentMode}
                onChange={(e) => updatePaymentField(i, "paymentMode", e.target.value)}
              >
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Other</option>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                value={payment.amount}
                onChange={(e) => updatePaymentField(i, "amount", e.target.value)}
              />
              <Input
                placeholder="Reference"
                value={payment.reference}
                onChange={(e) => updatePaymentField(i, "reference", e.target.value)}
              />
              <Select
                value={payment.transactionStatus}
                onChange={(e) =>
                  updatePaymentField(i, "transactionStatus", e.target.value)
                }
              >
                <option>Completed</option>
                <option>Processing</option>
                <option>Failed</option>
              </Select>
              <Textarea
                placeholder="Remarks"
                value={payment.remark}
                onChange={(e) => updatePaymentField(i, "remark", e.target.value)}
              />
              <Flex align="center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, i)}
                />
                {payment.proofPreviewUrl && (
                  <Image
                    src={payment.proofPreviewUrl}
                    alt={`proof-${i}`}
                    boxSize="90px"
                    ml={3}
                    objectFit="contain"
                    border="1px"
                    borderColor="gray.300"
                  />
                )}
              </Flex>
            </Stack>
          </Box>
        ))}
        <Button
          leftIcon={<AddIcon />}
          onClick={addPayment}
          mt={3}
          colorScheme="green"
        >
          Add Payment
        </Button>

        <Button
          mt={6}
          colorScheme="blue"
          isLoading={paymentUploading}
          onClick={submitPayments}
        >
          Submit Payments
        </Button>
      </VStack>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <Heading mb={6}>Create New Sales Order</Heading>
      {step === 0 && renderCustomerStep()}
      {step === 1 && renderProductStep()}
      {step === 2 && renderLogisticsStep()}
      {step === 3 && renderReviewStep()}
      {step === 4 && renderPaymentStep()}
    </Box>
  );
}
