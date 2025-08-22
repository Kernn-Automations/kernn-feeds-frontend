import React, { useEffect, useState } from "react";
import styles from "./Purchases.module.css";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/Auth";
import axios from "axios";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import PDFPreviewModal from "@/utils/PDFPreviewModal";
import { useHighlight } from "@chakra-ui/react";


function ReportsModal({ pdetails, warehouses ,setWarehouses }) {
  const { axiosAPI } = useAuth();

  const VITE_API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token");

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Damaged Goods UI state
  const [selectedSku, setSelectedSku] = useState("");
  const [damagedQty, setDamagedQty] = useState("");
  const [damagedReason, setDamagedReason] = useState("");
  const [damagedGoods, setDamagedGoods] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const closeModal = () => setIsModalOpen(false);

  // Validation function for damaged goods
  const validateDamagedGoods = () => {
    const errors = {};
    
    if (!selectedSku) {
      errors.product = "Please select a product";
    }
    
    if (!damagedQty || damagedQty <= 0) {
      errors.quantity = "Please enter a valid damaged quantity";
    } else {
      const selectedProduct = pdetails.items.find(item => item.SKU === selectedSku);
      if (selectedProduct && Number(damagedQty) > selectedProduct.quantity) {
        errors.quantity = `Damaged quantity cannot exceed ordered quantity (${selectedProduct.quantity})`;
      }
    }
    
    if (!damagedReason || damagedReason.trim() === '') {
      errors.reason = "Please enter a reason for the damage";
    }
    
    if (!image) {
      errors.image = "Please upload an image for the damaged goods";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const downloadPDF = async () => {
    if (!pdetails?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${VITE_API}/purchases/${pdetails.id}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Purchase-${pdetails.orderNumber || pdetails.id}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log(e)
      setError(e.response?.data?.message || "Download error");
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Damaged Goods
  const handleAddDamagedGood = () => {
    // Validate before adding
    if (!validateDamagedGoods()) {
      return;
    }

    const prod = pdetails.items.find(item => item.SKU === selectedSku);
    if (!prod) return;

    const netAmount = (
      ((prod.totalAmount || 0) * damagedQty) /
      (prod.quantity || 1)
    ).toFixed(2);

    setDamagedGoods(prev => [
      ...prev,
      {
        SKU: prod.SKU,
        name: prod.name,
        unit: prod.unit,
        orderedQty: prod.quantity,
        damagedQty: Number(damagedQty),
        reason: damagedReason,
        netAmount,
        image: image, // store the actual file
        imagePreview: imagePreview || null, // for UI only
      },
    ]);
    
    // Clear form and errors
    setSelectedSku("");
    setDamagedQty("");
    setDamagedReason("");
    setImage(null);
    setImagePreview(null);
    setFormErrors({});
  };

  const handleRemoveDamagedGood = (idx) => {
    setDamagedGoods(prev => prev.filter((_, i) => i !== idx));
  };

  // ✅ When user selects image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('✅ File selected:', file.name, file.size, file.type);
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  // useEffect(() => {
  //   async function fetchDropdowns() {
  //     try {
  //       setLoading(true);
  //       const [w, p, o] = await Promise.all([
  //         axiosAPI.get("/warehouses"),
  //         axiosAPI.get("/products/list"),
  //         axiosAPI.get("/purchases?limit=100")
  //       ]);
  //       setWarehouses(w.data.warehouses);
  //       setProducts(p.data.products);
  //       setOrders(Array.isArray(o.data.purchaseOrders) ? o.data.purchaseOrders : []);
  //     } catch (e) {
  //       console.log(e)
  //       setError(e.response?.data?.message);
  //       setIsModalOpen(true);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchDropdowns();
  // }, []);

  return (
    <>
      <h3 className={`px-3 mdl-title`}>Purchase Report</h3>
      <div className="row m-0 p-0">
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Date :</label>
          <input type="text" value={pdetails && pdetails.date} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Time :</label>
          <input
            type="text"
            value={pdetails && pdetails.createdAt.slice(11, 16)}
            readOnly
          />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Warehouse :</label>
          <input
            type="text"
            value={pdetails?.warehouse?.name}
            readOnly
          />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Purchase ID :</label>
          <input type="text" value={pdetails?.orderNumber} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Status :</label>
          <input 
            type="text" 
            value={pdetails?.status || 'Unknown'} 
            readOnly 
            style={{
              backgroundColor: pdetails?.status === 'Received' ? '#d4edda' : 
                              pdetails?.status === 'Stocked In' ? '#cce5ff' : 
                              pdetails?.status === 'stocked_in' ? '#cce5ff' : '#f8d7da',
              color: pdetails?.status === 'Received' ? '#155724' : 
                    pdetails?.status === 'Stocked In' ? '#004085' : 
                    pdetails?.status === 'stocked_in' ? '#004085' : '#721c24'
            }}
          />
        </div>
      </div>

      <div className="row m-0 p-0">
        <h5 className={styles.headmdl}>TO</h5>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Vendor Name :</label>
          <input type="text" value={pdetails?.supplier?.name} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Vendor ID :</label>
          <input type="text" value={pdetails?.supplier?.supplierCode} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 1 :</label>
          <input type="text" value={pdetails?.supplier?.plot} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Address Line 2 :</label>
          <input type="text" value={pdetails?.supplier?.street} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Village/City :</label>
          <input type="text" value={pdetails?.supplier?.city} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">District :</label>
          <input type="text" value={pdetails?.supplier?.district} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">State :</label>
          <input type="text" value={pdetails?.supplier?.state} readOnly />
        </div>
        <div className={`col-3 ${styles.longformmdl}`}>
          <label htmlFor="">Pincode :</label>
          <input type="text" value={pdetails?.supplier?.pincode} readOnly />
        </div>
      </div>

      <div className="row m-0 p-0 justify-content-center">
        <h5 className={styles.headmdl}>Products</h5>
        <div className="col-10">
          <table
            className={`table table-bordered borderedtable ${styles.mdltable}`}
          >
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Units</th>
                <th>Quantity</th>
                <th>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {pdetails &&
                pdetails.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.SKU}</td>
                    <td>{item.name}</td>
                    <td>{item.unit}</td>
                    <td>{item.quantity}</td>
                    <td>{item.totalAmount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="row m-0 p-3 pt-4">
          <div className={`col-3 ${styles.longformmdl}`}>
            <label htmlFor="">Total Amount :</label>
            <span>{(pdetails && pdetails.totalAmount) || 0}/-</span>
          </div>
        </div>
      </div>

      {/* STOCK IN MODAL */}
      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className={`col-4`}>
          {!loading && (
            <>
              <PDFPreviewModal
                pdfUrl={`/purchases/${pdetails.id}/pdf`}
                filename={`Purchase-${pdetails.orderNumber || pdetails.id}.pdf`}
                triggerText="Preview PDF"
              />

              {pdetails?.status !== "Received" && (
                <DialogRoot
                  placement={"center"}
                  size={"lg"}
                  className={styles.mdl}
                >
                  <DialogTrigger asChild>
                    <button className={`submitbtn`}>Stock IN</button>
                  </DialogTrigger>
                  <DialogContent className="mdl" style={{ minWidth: 700, maxWidth: 850 }}>
                    <DialogBody>
                      <div className="row m-0 p-3">
                        <div className={`col`}>
                          <h5 className="mdltitle">Confirm Stock In</h5>
                          <p>
                            Please confirm the received quantities for the following products:
                          </p>
                          <table className="table table-sm table-bordered borderedtable">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Ordered Qty</th>
                                <th>Received Qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pdetails.items.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.name}</td>
                                  <td>{item.quantity}</td>
                                  <td>{item.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Damaged Goods */}
<h5 style={{ fontWeight: 600, marginTop: 16, marginBottom: 8 }}>
  Damaged Goods
</h5>
<table className="table table-bordered">
  <thead>
    <tr>
      <th>#</th>
      <th>SKU</th>
      <th>Ordered Qty</th>
      <th>Damaged Qty</th>
      <th>Reason</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {/* Row to Add New Damaged Product */}
    <tr>
      <td>#</td>
      <td>
        <select
          value={selectedSku}
          onChange={e => setSelectedSku(e.target.value)}
          style={{ 
            border: formErrors.product ? '1px solid #dc3545' : '1px solid #ced4da',
            borderRadius: '4px',
            padding: '6px 12px',
            width: '100%'
          }}
        >
          <option value="">--select product--</option>
          {pdetails.items.map(item => (
            <option key={item.id} value={item.SKU}>
              {item.SKU} - {item.name}
            </option>
          ))}
        </select>
        {formErrors.product && (
          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
            {formErrors.product}
          </div>
        )}
      </td>
      <td>
        {pdetails.items.find(item => item.SKU === selectedSku)?.quantity || ""}
      </td>
      <td>
        <input
          type="number"
          min={1}
          max={pdetails.items.find(item => item.SKU === selectedSku)?.quantity || 1}
          value={damagedQty}
          onChange={e => setDamagedQty(e.target.value)}
          placeholder="Qty"
          style={{ 
            border: formErrors.quantity ? '1px solid #dc3545' : '1px solid #ced4da',
            borderRadius: '4px',
            padding: '6px 12px',
            width: '100%'
          }}
        />
        {formErrors.quantity && (
          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
            {formErrors.quantity}
          </div>
        )}
      </td>
      <td>
        <input
          type="text"
          value={damagedReason}
          onChange={e => setDamagedReason(e.target.value)}
          placeholder="Reason for damage"
          style={{ 
            border: formErrors.reason ? '1px solid #dc3545' : '1px solid #ced4da',
            borderRadius: '4px',
            padding: '6px 12px',
            width: '100%'
          }}
        />
        {formErrors.reason && (
          <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
            {formErrors.reason}
          </div>
        )}
      </td>
      <td>
        <button className="btn btn-success" onClick={handleAddDamagedGood}>
          + Add Product
        </button>
      </td>
    </tr>
    {/* Existing Rows */}
    {damagedGoods.length === 0 ? (
      <tr>
        <td colSpan={6} style={{ textAlign: "center" }}>
          No damaged goods added.
        </td>
      </tr>
    ) : (
      damagedGoods.map((good, idx) => (
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td>{good.SKU}</td>
          <td>{good.orderedQty}</td>
          <td>{good.damagedQty}</td>
          <td>{good.reason || '-'}</td>
          <td>
            <button className="btn btn-danger" onClick={() => handleRemoveDamagedGood(idx)}>
              Delete
            </button>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>
                          {/* Image Upload below the table */}
                          <div style={{ marginBottom: 8 }}>
                            <label style={{ fontWeight: 600 }}>
                              Image for Damaged Good <span style={{ color: '#dc3545' }}>*</span>:
                            </label>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                              style={{ 
                                border: formErrors.image ? '1px solid #dc3545' : '1px solid #ced4da',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                width: '100%'
                              }}
                            />
                            {formErrors.image && (
                              <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                                {formErrors.image}
                              </div>
                            )}
                            {imagePreview && (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                  width: 40,
                                  height: 40,
                                  marginLeft: 8,
                                  verticalAlign: "middle"
                                }}
                              />
                            )}
                          </div>
                          {/* Cancel and Confirm Buttons */}
                          <div className="d-flex justify-content-end mt-3">
                            <button 
                              className="cancelbtn me-2"
                              onClick={() => {
                                // Close the modal manually
                                const closeButton = document.querySelector('[data-radix-dialog-close]');
                                if (closeButton) closeButton.click();
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="submitbtn"
                              onClick={async () => {
                                console.log('=== STOCK IN BUTTON CLICKED ===');
                                console.log('Purchase details:', pdetails);
                                console.log('Damaged goods:', damagedGoods);
                                
                                // Check if purchase order has already been stocked in
                                if (pdetails.status === 'stocked_in' || pdetails.stockInStatus === 'completed' || pdetails.status === 'Stocked In') {
                                  setError("This purchase order has already been stocked in. You cannot stock-in the same order twice.");
                                  setIsModalOpen(true);
                                  return;
                                }
                                
                                // Check if purchase order status allows stock-in
                                if (pdetails.status !== 'Received' && pdetails.status !== 'received' && pdetails.status !== 'Pending' && pdetails.status !== 'pending') {
                                  setError(`Cannot stock-in purchase order. Current status: ${pdetails.status}. Status must be "Received" or "Pending" to proceed with stock-in.`);
                                  setIsModalOpen(true);
                                  return;
                                }
                                
                                // Validate that all required fields are filled
                                if (damagedGoods.length > 0) {
                                  // Check if any damaged goods are missing required fields
                                  const hasInvalidDamagedGoods = damagedGoods.some(good => 
                                    !good.SKU || !good.damagedQty || !good.reason || !good.image
                                  );
                                  
                                  if (hasInvalidDamagedGoods) {
                                    setError("Please ensure all damaged goods have product, quantity, reason, and image filled.");
                                    setIsModalOpen(true);
                                    return;
                                  }
                                }
                                
                                // Declare variables outside try block to ensure they're always defined
                                let requestData = null;
                                let formData = null;
                                
                                try {
                                  setConfirmLoading(true);
                                  console.log('Starting Stock IN process for purchase:', pdetails.id);
                                  
                                  const receivedItems = pdetails.items.map(
                                    (item) => ({
                                      productId: item.productId,
                                      receivedQuantity: item.quantity,
                                    })
                                  );
                                  
                                  console.log('📋 receivedItems array:', receivedItems);
                                  console.log('📋 pdetails.items:', pdetails.items);
                                  
                                  // ✅ Validate that we have receivedItems
                                  if (!receivedItems || receivedItems.length === 0) {
                                    throw new Error('No received items found in purchase order');
                                  }
                                  
                                  // Map damagedGoods to backend-required format
                                  const mappedDamagedGoods = damagedGoods.map((good) => {
                                    const prod = pdetails.items.find(item => item.SKU === good.SKU);
                                    return {
                                      productId: prod?.productId,
                                      receivedQuantity: parseFloat(prod?.quantity || 0),
                                      damagedQuantity: parseFloat(good.damagedQty || 0),
                                      warehouseId: pdetails?.warehouse?.id || pdetails?.warehouseId,
                                      reason: good.reason || 'Damaged during stock-in',
                                      image: good.image, // Keep image for FormData processing
                                    };
                                  });
                                  
                                  console.log('📋 mappedDamagedGoods:', mappedDamagedGoods);
                                  
                                  console.log('Sending Stock IN request with data:', {
                                    receivedItems,
                                    damagedGoods: mappedDamagedGoods,
                                  });
                                  
                                  console.log('Original damaged goods data:', damagedGoods);
                                  console.log('Purchase details items:', pdetails.items);
                                  
                                  // ✅ Create request data in the correct format for stock-in
                                  requestData = {
                                    receivedItems: receivedItems,
                                    damagedGoods: mappedDamagedGoods
                                  };
                                  
                                  console.log('📋 Final request data:', requestData);
                                  
                                  // ✅ Create FormData
                                  formData = new FormData();

                                  // ✅ Append JSON data
                                  formData.append('receivedItems', JSON.stringify(requestData.receivedItems));
                                  
                                  // ✅ Create damagedGoods without images for JSON
                                  const damagedGoodsWithoutImages = requestData.damagedGoods.map(good => ({
                                    productId: good.productId,
                                    receivedQuantity: good.receivedQuantity,
                                    damagedQuantity: good.damagedQuantity,
                                    warehouseId: good.warehouseId,
                                    reason: good.reason || 'Damaged during stock-in'
                                  }));
                                  formData.append('damagedGoods', JSON.stringify(damagedGoodsWithoutImages));

                                  // ✅ Append image files with indexed names as per backend requirements
                                  console.log('🔍 Checking damaged goods for image files:');
                                  requestData.damagedGoods.forEach((item, index) => {
                                    console.log(`  Item ${index}:`, {
                                      productId: item.productId,
                                      hasImage: !!item.image,
                                      imageType: typeof item.image,
                                      isFile: item.image instanceof File,
                                      imageName: item.image?.name,
                                      imageSize: item.image?.size
                                    });
                                    
                                    if (item.image && item.image instanceof File) {
                                      formData.append(`damagedGoodsImages_${index}`, item.image);
                                      console.log(`✅ Added image file: damagedGoodsImages_${index} = ${item.image.name} (${item.image.size} bytes)`);
                                    } else {
                                      console.log(`⚠️ No image file found for damaged good at index ${index}`);
                                    }
                                  });
                                  
                                  // Debug: Log what we're sending
                                  console.log('🚀 Sending request to backend:');
                                  console.log('URL:', `/warehouses/incoming/purchases/${pdetails.id}`);
                                  console.log('Purchase ID:', pdetails.id);
                                  console.log('Warehouse ID:', pdetails?.warehouse?.id);
                                  console.log('FormData contents:');
                                  for (let [key, value] of formData.entries()) {
                                    if (value instanceof File) {
                                      console.log('Field:', key, 'Value: File(' + value.name + ', ' + value.size + ' bytes)');
                                    } else {
                                      console.log('Field:', key, 'Value:', value);
                                    }
                                  }
                                  
                                  // Enhanced validation before sending
                                  const receivedItemsData = formData.get('receivedItems');
                                  const damagedGoodsData = formData.get('damagedGoods');
                                  const imageFiles = [];
                                  // Get all image files with indexed names
                                  for (let i = 0; i < requestData.damagedGoods.length; i++) {
                                    const imageFile = formData.get(`damagedGoodsImages_${i}`);
                                    if (imageFile) {
                                      imageFiles.push(imageFile);
                                    }
                                  }
                                  
                                  console.log('🔍 Enhanced validation:');
                                  console.log('- receivedItems exists:', !!receivedItemsData);
                                  console.log('- damagedGoods exists:', !!damagedGoodsData);
                                  console.log('- imageFiles count:', imageFiles.length);
                                  console.log('- receivedItems length:', receivedItemsData ? JSON.parse(receivedItemsData).length : 0);
                                  console.log('- damagedGoods length:', damagedGoodsData ? JSON.parse(damagedGoodsData).length : 0);

                                  // ✅ API call with FormData
                                  let response;
                                  try {
                                    console.log('🔄 Sending FormData to warehouse route...');
                                    console.log('🔍 Final FormData contents before sending:');
                                    for (let [key, value] of formData.entries()) {
                                      if (value instanceof File) {
                                        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                                      } else {
                                        console.log(`  ${key}: ${value}`);
                                      }
                                    }
                                    
                                    response = await axiosAPI.post(
                                      `/warehouses/incoming/purchases/${pdetails.id}`,
                                      formData,
                                      {
                                        headers: {
                                          // ❌ Don't set Content-Type - let browser set it for FormData
                                        }
                                      }
                                    );
                                    console.log('✅ Warehouse route successful');
                                  } catch (warehouseError) {
                                    console.log('❌ Warehouse route failed, trying JSON format...');
                                    console.log('Warehouse error:', warehouseError.response?.data);
                                    
                                    // Fallback to JSON format without images
                                    const jsonData = {
                                      receivedItems: requestData.receivedItems,
                                      damagedGoods: damagedGoodsWithoutImages
                                    };
                                    
                                    // Try warehouse route with JSON
                                    try {
                                      response = await axiosAPI.post(
                                        `/warehouses/incoming/purchases/${pdetails.id}`,
                                        jsonData,
                                        {
                                          headers: {
                                            'Content-Type': 'application/json',
                                          }
                                        }
                                      );
                                      console.log('✅ Warehouse route with JSON successful');
                                    } catch (jsonError) {
                                      console.log('❌ All routes failed');
                                      throw jsonError; // Re-throw to be caught by outer catch
                                    }
                                  }
                                  
                                  console.log('Stock In response:', response.data);
                                  console.log('Response status:', response.status);
                                  console.log('Response success check:', response.data.success);
                                  console.log('Response status:', response.status);
                                  console.log('Response success check:', response.data.success);
                                  
                                  // Handle the response format - check for success or 200 status
                                  if (response.data.success || response.status === 200 || response.status === 201) {
                                    // Show success message
                                    setError("Stock IN completed successfully!");
                                    setIsModalOpen(true);
                                    
                                    // Close the modal manually after successful API call
                                    setTimeout(() => {
                                      const closeButton = document.querySelector('[data-radix-dialog-close]');
                                      if (closeButton) closeButton.click();
                                    }, 1000);
                                    
                                    // Multiple refresh mechanisms to ensure UI updates
                                    console.log('Attempting to refresh UI after successful stock-in...');
                                    if (typeof window.refreshPurchaseOrders === 'function') {
                                      console.log('Using window.refreshPurchaseOrders()');
                                      window.refreshPurchaseOrders();
                                    } else if (typeof setWarehouses === 'function') {
                                      console.log('Using setWarehouses() to force update');
                                      setWarehouses((prev) => [...prev]); // force update
                                    } else {
                                      console.log('Using window.location.reload() as fallback');
                                      // Reload after a short delay to show success
                                      setTimeout(() => {
                                        window.location.reload();
                                      }, 2000);
                                    }
                                  } else {
                                    // Handle backend error response
                                    setError(response.data.message || "Stock IN failed");
                                    setIsModalOpen(true);
                                  }
                                } catch (err) {
                                  console.error('Stock IN Error:', err);
                                  console.error('Error Response:', err.response?.data);
                                  console.error('Error Status:', err.response?.status);
                                  console.error('Error Message:', err.response?.data?.message);
                                  console.error('Request Data:', requestData || 'Not defined');
                                  console.error('Request was using FormData');
                                  
                                  // Log the actual FormData that was sent
                                  console.error('FormData that was sent:');
                                  if (formData) {
                                    for (let [key, value] of formData.entries()) {
                                      console.error('FormData Field:', key, 'Value:', value);
                                    }
                                  }
                                  
                                  // Handle the new error response format
                                  let errorMessage = err.response?.data?.message || 
                                                     err.response?.data?.error || 
                                                     err.message || 
                                                     "Stock IN failed. Please try again.";
                                  
                                  // Special handling for already stocked in error
                                  if (errorMessage.includes("already been stocked in")) {
                                    errorMessage = "This purchase order has already been stocked in. You cannot stock-in the same order twice.";
                                    console.log('⚠️ Purchase order already stocked in - this is expected behavior');
                                  }
                                  
                                  setError(errorMessage);
                                  setIsModalOpen(true);
                                } finally {
                                  setConfirmLoading(false);
                                }
                              }}
                            >
                              {confirmLoading
                                ? "Processing..."
                                : "Confirm Stock In"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </DialogBody>
                    <DialogCloseTrigger className="inputcolumn-mdl-close" />
                  </DialogContent>
                </DialogRoot>
              )}
            </>
          )}
          {loading && <Loading />}
        </div>
      </div>

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}
    </>
  );
}

export default ReportsModal;