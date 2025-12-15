import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Auth';
import { useDivision } from '../../context/DivisionContext';
import Loading from '@/components/Loading';
import ErrorModal from '@/components/ErrorModal';
import storeService from '../../../services/storeService';
import styles from './StoresProducts.module.css';

const StoresProducts = () => {
  const navigate = useNavigate();
  const { axiosAPI } = useAuth();
  const { selectedDivision, showAllDivisions } = useDivision();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [storeProductsData, setStoreProductsData] = useState([]);
  const [fbPeriods, setFbPeriods] = useState(['Fb20', 'Fb22', 'Fb24']); // Default periods, can be fetched from API
  const [skuToProductName, setSkuToProductName] = useState({}); // Mapping of SKU to Product Name
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStoreProducts();
  }, [selectedDivision, showAllDivisions]);

  // Transform backend API response to component data structure
  const transformApiDataToFlatStructure = (apiData) => {
    const flattenedData = [];
    
    // API structure: zones[] -> subZones[] -> stores[] -> products[]
    apiData.forEach(zone => {
      zone.subZones?.forEach(subZone => {
        subZone.stores?.forEach(store => {
          // Build prices object from products
          const prices = {};
          
          // Extract products by SKU and map to prices structure
          store.products?.forEach(product => {
            const sku = product.sku; // e.g., "Fb20", "Fb22", "Fb24"
            if (sku) {
              prices[sku] = {
                sellingPrice: product.currentSellingPrice || product.customPrice || product.basePrice || null,
                purchasePrice: product.purchasePrice || null,
                // Store additional product info for reference
                productId: product.productId,
                storeProductId: product.storeProductId,
                basePrice: product.basePrice,
                stockQuantity: product.stockQuantity,
                productName: product.productName || product.name || sku // Store product name
              };
            }
          });
          
          // Add row for this store
          flattenedData.push({
            zone: zone.zone || zone.division || '',
            subZone: subZone.subZone || '',
            store: store.storeName || store.storeCode || '',
            storeId: store.storeId,
            storeCode: store.storeCode,
            prices: prices
          });
        });
      });
    });
    
    return flattenedData;
  };

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the backend API endpoint
      const response = await storeService.getAllStoresWithProducts();
      
      // Extract data from response
      const responseData = response.data || response;
      
      // Transform API data to flat structure (one row per store)
      const flattenedData = transformApiDataToFlatStructure(Array.isArray(responseData) ? responseData : []);
      
      // Extract unique SKUs (Fb20, Fb22, Fb24, etc.) from all products for column headers
      // Also create mapping of SKU to Product Name
      const allSkus = new Set();
      const skuProductNameMap = {};
      
      flattenedData.forEach(row => {
        Object.keys(row.prices || {}).forEach(sku => {
          allSkus.add(sku);
          // Store product name for this SKU (use first occurrence or update if different)
          if (row.prices[sku]?.productName && !skuProductNameMap[sku]) {
            skuProductNameMap[sku] = row.prices[sku].productName;
          }
        });
      });
      const sortedSkus = Array.from(allSkus).sort();
      
      // Update periods if we found different SKUs
      if (sortedSkus.length > 0) {
        setFbPeriods(sortedSkus);
      }
      
      // Update SKU to Product Name mapping
      setSkuToProductName(skuProductNameMap);
      
      setStoreProductsData(flattenedData);
    } catch (err) {
      console.error('Error fetching store products:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch store products';
      setError(errorMessage);
      setIsErrorModalOpen(true);
      setStoreProductsData([]);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setError(null);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    // Initialize editing data with current data
    // Use the same rowId format as the table uses
    const editData = {};
    
    // Group data the same way the table does
    const groupedData = storeProductsData.reduce((acc, row) => {
      const key = `${row.zone}-${row.subZone}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(row);
      return acc;
    }, {});
    
    // Create rowIds with globalIndex matching the table
    // IMPORTANT: Deep copy prices to avoid mutating original data
    let globalIndex = 0;
    Object.values(groupedData).forEach((group) => {
      group.forEach((row) => {
        const rowKey = `${row.zone}-${row.subZone}-${row.store}-${globalIndex}`;
        
        // Deep copy prices object to avoid reference issues
        const deepCopiedPrices = {};
        if (row.prices) {
          Object.keys(row.prices).forEach(sku => {
            deepCopiedPrices[sku] = {
              ...row.prices[sku]
            };
          });
        }
        
        editData[rowKey] = {
          ...row,
          prices: deepCopiedPrices
        };
        globalIndex++;
      });
    });
    
    console.log('Initialized editing data:', editData);
    setEditingData(editData);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingData({});
  };

  const handlePriceChange = (rowKey, fb, priceType, value) => {
    setEditingData(prev => {
      const newData = { ...prev };
      if (!newData[rowKey]) {
        // Find the original row data by matching properties
        const originalRow = storeProductsData.find(row => {
          // Try to match by rowId if it exists, or by properties
          return row.rowId === rowKey || 
                 (prev[rowKey] && row.storeId === prev[rowKey].storeId && 
                  row.zone === prev[rowKey].zone && 
                  row.subZone === prev[rowKey].subZone &&
                  row.store === prev[rowKey].store);
        });
        
        // If still not found, try parsing the rowKey
        if (!originalRow) {
          const parts = rowKey.split('-');
          if (parts.length >= 3) {
            const storeName = parts.slice(2).join('-'); // Store name might contain dashes
            const originalRowByKey = storeProductsData.find(row => 
              row.zone === parts[0] && 
              row.subZone === parts[1] && 
              row.store === storeName
            );
            if (originalRowByKey) {
              // Deep copy prices
              const deepCopiedPrices = {};
              if (originalRowByKey.prices) {
                Object.keys(originalRowByKey.prices).forEach(sku => {
                  deepCopiedPrices[sku] = { ...originalRowByKey.prices[sku] };
                });
              }
              newData[rowKey] = {
                ...originalRowByKey,
                prices: deepCopiedPrices
              };
            } else {
              console.warn('Could not find original row for key:', rowKey);
              return prev;
            }
          } else {
            return prev;
          }
        } else {
          // Deep copy prices
          const deepCopiedPrices = {};
          if (originalRow.prices) {
            Object.keys(originalRow.prices).forEach(sku => {
              deepCopiedPrices[sku] = { ...originalRow.prices[sku] };
            });
          }
          newData[rowKey] = {
            ...originalRow,
            prices: deepCopiedPrices
          };
        }
      }
      if (!newData[rowKey].prices) {
        newData[rowKey].prices = {};
      }
      if (!newData[rowKey].prices[fb]) {
        newData[rowKey].prices[fb] = {};
      }
      const parsedValue = value === '' || value === null || value === undefined ? null : parseFloat(value);
      newData[rowKey].prices[fb][priceType] = parsedValue;
      
      console.log('Price changed:', { rowKey, fb, priceType, value, parsedValue, newData: newData[rowKey].prices[fb] });
      
      return newData;
    });
  };

  const handleSavePrices = async () => {
    try {
      setSaving(true);
      setError(null);

      // Collect all price changes grouped by storeId
      const updatesByStore = {};
      
      console.log('=== SAVE PRICES DEBUG START ===');
      console.log('editingData:', editingData);
      console.log('storeProductsData:', storeProductsData);
      
      // Iterate through all edited rows
      Object.keys(editingData).forEach(rowKey => {
        const editRow = editingData[rowKey];
        
        // Find the original row by matching storeId, zone, subZone, and store name
        const originalRow = storeProductsData.find(row => {
          return row.storeId === editRow.storeId && 
                 row.zone === editRow.zone && 
                 row.subZone === editRow.subZone &&
                 row.store === editRow.store;
        });
        
        if (!originalRow || !editRow.prices) {
          console.log('Skipping row:', { rowKey, hasOriginal: !!originalRow, hasPrices: !!editRow.prices });
          return;
        }
        
        const storeId = originalRow.storeId;
        if (!storeId) return;
        
        if (!updatesByStore[storeId]) {
          updatesByStore[storeId] = [];
        }
        
        // Compare original and edited prices to find changes
        const allSkus = new Set([
          ...Object.keys(originalRow.prices || {}),
          ...Object.keys(editRow.prices || {})
        ]);
        
        allSkus.forEach(sku => {
          const originalPrice = originalRow.prices?.[sku];
          const editedPrice = editRow.prices?.[sku];
          
          if (!originalPrice) {
            return;
          }
          
          // If editedPrice doesn't exist, it means this SKU wasn't edited, so skip it
          if (!editedPrice) {
            return;
          }
          
          // Helper to normalize price values
          const normalizePrice = (price) => {
            if (price === null || price === undefined || price === '' || price === 'null') return null;
            if (typeof price === 'number') return isNaN(price) ? null : price;
            const num = parseFloat(String(price));
            return isNaN(num) ? null : num;
          };
          
          // Get normalized prices
          const origSelling = normalizePrice(originalPrice.sellingPrice);
          const editSelling = normalizePrice(editedPrice.sellingPrice);
          const origPurchase = normalizePrice(originalPrice.purchasePrice);
          const editPurchase = normalizePrice(editedPrice.purchasePrice);
          
          // Compare prices (handle null and numbers)
          const isDifferent = (a, b) => {
            if (a === null && b === null) return false;
            if (a === null || b === null) return true;
            return Math.abs(a - b) >= 0.01; // Consider different if difference >= 0.01
          };
          
          const sellingChanged = isDifferent(origSelling, editSelling);
          const purchaseChanged = isDifferent(origPurchase, editPurchase);
          
          console.log(`SKU ${sku}:`, {
            origSelling,
            editSelling,
            sellingChanged,
            origPurchase,
            editPurchase,
            purchaseChanged,
            originalPriceObj: originalPrice,
            editedPriceObj: editedPrice
          });
          
          if (sellingChanged || purchaseChanged) {
            const productId = originalPrice.productId;
            if (!productId) {
              console.warn('Missing productId for SKU:', sku);
              return;
            }
            
            const existingUpdate = updatesByStore[storeId].find(u => u.productId === productId);
            const updatePayload = {
              productId: productId,
              customPrice: editSelling, // Always use edited value
              purchasePrice: editPurchase // Always use edited value
            };
            
            if (existingUpdate) {
              Object.assign(existingUpdate, updatePayload);
            } else {
              updatesByStore[storeId].push(updatePayload);
            }
            
            console.log('✅ Added update for productId:', productId, updatePayload);
          }
        });
      });
      
      console.log('=== FINAL UPDATES ===', updatesByStore);
      
      console.log('Final updatesByStore:', updatesByStore);
      
      // Check if there are any updates to save
      const totalUpdates = Object.values(updatesByStore).reduce((sum, updates) => sum + updates.length, 0);
      console.log('Total updates detected:', totalUpdates);
      console.log('Updates by store:', updatesByStore);
      
      if (totalUpdates === 0) {
        console.log('No updates detected. Debug info:', {
          editingDataKeys: Object.keys(editingData),
          storeProductsDataLength: storeProductsData.length,
          sampleEditingData: Object.keys(editingData).slice(0, 2).map(key => ({
            key,
            prices: editingData[key]?.prices
          })),
          sampleOriginalData: storeProductsData.slice(0, 2).map(row => ({
            store: row.store,
            prices: row.prices
          }))
        });
        setError('No price changes detected. Please edit prices before saving.');
        setIsErrorModalOpen(true);
        setSaving(false);
        return;
      }
      
      // Log updates for debugging
      console.log('Price updates to be saved:', updatesByStore);
      console.log(`Total updates: ${totalUpdates} across ${Object.keys(updatesByStore).length} stores`);
      
      // Update prices for each store
      const updatePromises = Object.keys(updatesByStore).map(async (storeId) => {
        const updates = updatesByStore[storeId];
        if (updates.length === 0) return;
        
        // Update each product individually using updateStoreProductPricing
        const productUpdates = updates.map(async (update) => {
          const payload = {
            productId: update.productId
          };
          
          // Only include fields that are defined
          if (update.customPrice !== undefined) {
            payload.customPrice = update.customPrice;
          }
          if (update.purchasePrice !== undefined) {
            payload.purchasePrice = update.purchasePrice;
          }
          
          console.log(`Updating product ${update.productId} in store ${storeId} with payload:`, payload);
          
          try {
            const response = await storeService.updateStoreProductPricing(storeId, payload);
            console.log(`Successfully updated product ${update.productId} in store ${storeId}:`, response);
            return response;
          } catch (err) {
            console.error(`Error updating product ${update.productId} in store ${storeId}:`, err);
            console.error('Error details:', {
              status: err.response?.status,
              statusText: err.response?.statusText,
              data: err.response?.data,
              message: err.message
            });
            throw err; // Re-throw to be caught by outer catch
          }
        });
        
        return Promise.all(productUpdates);
      });
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      console.log('All price updates completed successfully');
      
      // Refresh data from backend to ensure consistency (DO NOT update local state first)
      await fetchStoreProducts();
      
      // Clear edit mode after successful save
      setIsEditMode(false);
      setEditingData({});
      
      // Show success message
      alert(`Successfully updated ${totalUpdates} product price(s)!`);
    } catch (err) {
      console.error('Error saving prices:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save prices';
      setError(errorMessage);
      setIsErrorModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading && storeProductsData.length === 0) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Stores Products</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isEditMode ? (
            <button
              className="homebtn"
              onClick={handleEditClick}
            >
              <i className="bi bi-pencil"></i> Edit Prices
            </button>
          ) : (
            <>
              <button
                className="homebtn"
                onClick={handleSavePrices}
                disabled={saving}
                style={{ background: '#28a745' }}
              >
                {saving ? 'Saving...' : <><i className="bi bi-check"></i> Save</>}
              </button>
              <button
                className="homebtn"
                onClick={handleCancelEdit}
                disabled={saving}
                style={{ background: '#6c757d' }}
              >
                <i className="bi bi-x"></i> Cancel
              </button>
            </>
          )}
          <button
            className="homebtn"
            onClick={() => navigate('/divisions?tab=stores')}
          >
            Back to Stores
          </button>
        </div>
      </div>

      {error && !isErrorModalOpen && (
        <div className={styles.errorBanner}>
          <p>{error}</p>
          <button onClick={fetchStoreProducts}>Retry</button>
        </div>
      )}

      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={`table table-bordered borderedtable ${styles.productsTable}`}>
            <thead>
              <tr>
                <th rowSpan="2" className={styles.zoneColumn}>Zone</th>
                <th rowSpan="2" className={styles.subZoneColumn}>Sub Zone</th>
                <th rowSpan="2" className={styles.storeColumn}>Store</th>
                {fbPeriods.map((fb) => (
                  <th key={fb} colSpan="2" className={styles.fbHeader}>
                    {skuToProductName[fb] || fb}
                  </th>
                ))}
              </tr>
              <tr>
                {fbPeriods.map((fb) => (
                  <React.Fragment key={fb}>
                    <th className={styles.priceHeader}>Selling Price</th>
                    <th className={styles.priceHeader}>Purchase Price</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {storeProductsData.length === 0 ? (
                <tr>
                  <td colSpan={3 + fbPeriods.length * 2} className={styles.noData}>
                    No store products data found
                  </td>
                </tr>
              ) : (() => {
                // Group data by zone and sub-zone to calculate rowspans
                const groupedData = storeProductsData.reduce((acc, row) => {
                  const key = `${row.zone}-${row.subZone}`;
                  if (!acc[key]) {
                    acc[key] = [];
                  }
                  acc[key].push(row);
                  return acc;
                }, {});

                // Flatten grouped data with rowspan information
                const rowsWithRowspan = [];
                let globalIndex = 0;
                Object.values(groupedData).forEach((group) => {
                  group.forEach((row, index) => {
                    rowsWithRowspan.push({
                      ...row,
                      isFirstInGroup: index === 0,
                      rowspan: group.length,
                      rowId: `${row.zone}-${row.subZone}-${row.store}-${globalIndex}`
                    });
                    globalIndex++;
                  });
                });

                return rowsWithRowspan.map((row, index) => {
                  const rowKey = row.rowId || index;
                  const editRow = editingData[rowKey] || row;
                  return (
                    <tr key={rowKey}>
                      {row.isFirstInGroup && (
                        <>
                          <td rowSpan={row.rowspan} className={styles.zoneCell}>
                            {row.zone || '-'}
                          </td>
                          <td rowSpan={row.rowspan} className={styles.subZoneCell}>
                            {row.subZone || '-'}
                          </td>
                        </>
                      )}
                      <td>{row.store || '-'}</td>
                      {fbPeriods.map((fb) => (
                        <React.Fragment key={fb}>
                          <td className={styles.priceCell}>
                            {isEditMode ? (
                              <input
                                type="number"
                                className={styles.priceInput}
                                value={editRow.prices?.[fb]?.sellingPrice || ''}
                                onChange={(e) => handlePriceChange(rowKey, fb, 'sellingPrice', e.target.value)}
                                placeholder="-"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              editRow.prices?.[fb]?.sellingPrice || '-'
                            )}
                          </td>
                          <td className={styles.priceCell}>
                            {isEditMode ? (
                              <input
                                type="number"
                                className={styles.priceInput}
                                value={editRow.prices?.[fb]?.purchasePrice || ''}
                                onChange={(e) => handlePriceChange(rowKey, fb, 'purchasePrice', e.target.value)}
                                placeholder="-"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              editRow.prices?.[fb]?.purchasePrice || '-'
                            )}
                          </td>
                        </React.Fragment>
                      ))}
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {isErrorModalOpen && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          message={error}
          onClose={closeErrorModal}
        />
      )}
    </div>
  );
};

export default StoresProducts;

