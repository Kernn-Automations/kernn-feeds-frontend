import api from "./apiService";

const storeService = {
  async createStore(body) {
    const res = await api.request("/stores", { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async getStores(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.storeType) queryParams.append('storeType', params.storeType);
    const url = `/stores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await api.request(url, { method: "GET" });
    return res.json();
  },
  async getStoreById(id) {
    const res = await api.request(`/stores/${id}`, { method: "GET" });
    return res.json();
  },
  async updateStore(id, body) {
    const res = await api.request(`/stores/${id}`, { method: "PUT", body: JSON.stringify(body) });
    return res.json();
  },
  async deleteStore(id) {
    const res = await api.request(`/stores/${id}`, { method: "DELETE" });
    return res.json();
  },

  async assignManager({ storeId, staffManagerId }) {
    const res = await api.request(`/store-employees/assign-manager`, { method: "POST", body: JSON.stringify({ storeId, staffManagerId }) });
    return res.json();
  },
  async assignEmployee({ storeId, employeeId }) {
    const res = await api.request(`/store-employees/assign-employee`, { method: "POST", body: JSON.stringify({ storeId, employeeId }) });
    return res.json();
  },
  async getStoreStaff(storeId) {
    const res = await api.request(`/store-employees/store/${storeId}`, { method: "GET" });
    return res.json();
  },
  async getStoresByManager(managerId) {
    const res = await api.request(`/store-employees/manager/${managerId}/stores`, { method: "GET" });
    return res.json();
  },

  async createOrFindCustomer(body) {
    const res = await api.request(`/stores/customers`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async createSale(body) {
    const res = await api.request(`/stores/sales`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async createIndent(body) {
    const res = await api.request(`/stores/indents`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async reportDamagedGoods(body) {
    const res = await api.request(`/stores/damaged-goods`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async processReturn(body) {
    const res = await api.request(`/stores/returns`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },

  async approveRejectIndent(indentId, action, notes) {
    const res = await api.request(`/indents/${indentId}/approve-reject`, { method: "PUT", body: JSON.stringify({ action, notes }) });
    return res.json();
  },
  async createStockTransfer(body) {
    const res = await api.request(`/stock-transfers`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async processStockIn(body) {
    const res = await api.request(`/stores/stock-in`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },

  // Store Assets operations
  async getStoreAssets(storeId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.status) queryParams.append("status", params.status);
    const query = queryParams.toString();

    const res = await api.request(`/stores/${storeId}/assets${query ? `?${query}` : ""}`, { method: "GET" });
    return res.json();
  },
  async getStoreAssetById(storeId, assetId) {
    const res = await api.request(`/stores/${storeId}/assets/${assetId}`, { method: "GET" });
    return res.json();
  },
  async updateStoreAsset(storeId, assetId, body) {
    const res = await api.request(`/stores/${storeId}/assets/${assetId}`, { method: "PUT", body: JSON.stringify(body) });
    return res.json();
  },
  async stockInStoreAsset(storeId, assetId, body) {
    const res = await api.request(`/stores/${storeId}/assets/${assetId}/stock-in`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async deleteStoreAsset(storeId, assetId) {
    const res = await api.request(`/stores/${storeId}/assets/${assetId}`, { method: "DELETE" });
    return res.json();
  },
  
  // Expenditures CRUD operations
  async getStoreExpenditures(storeId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    const res = await api.request(
      `/stores/${storeId}/expenditures${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.json();
  },
  async getStoreExpenditureById(storeId, expenditureId) {
    const res = await api.request(`/stores/${storeId}/expenditures/${expenditureId}`, { method: "GET" });
    return res.json();
  },
  async getStoreExpenditureSummary(storeId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    const res = await api.request(
      `/stores/${storeId}/expenditures/summary${queryString ? `?${queryString}` : ""}`,
      { method: "GET" }
    );
    return res.json();
  },
  async createStoreExpenditure(storeId, body) {
    const res = await api.request(`/stores/${storeId}/expenditures`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.json();
  },
  async updateStoreExpenditure(storeId, expenditureId, body) {
    const res = await api.request(`/stores/${storeId}/expenditures/${expenditureId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return res.json();
  },
  async deleteStoreExpenditure(storeId, expenditureId) {
    const res = await api.request(`/stores/${storeId}/expenditures/${expenditureId}`, { method: "DELETE" });
    return res.json();
  },
  
  // Store Sales operations
  async getStoreSales(storeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await api.request(`/stores/${storeId}/sales${queryParams ? `?${queryParams}` : ''}`, { method: "GET" });
    return res.json();
  },
  async updateSalePaymentUTR(saleId, utrNumber) {
    const res = await api.request(`/stores/sales/${saleId}/payment/utr`, { method: "PUT", body: JSON.stringify({ utrNumber }) });
    return res.json();
  },
  
  // Store Customers operations
  async getStoreCustomers(storeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await api.request(`/stores/${storeId}/customers${queryParams ? `?${queryParams}` : ''}`, { method: "GET" });
    return res.json();
  },
  async getStoreCustomerById(storeId, customerId) {
    const res = await api.request(`/stores/${storeId}/customers/${customerId}`, { method: "GET" });
    return res.json();
  },
  async searchStoreCustomers(storeId, searchTerm) {
    const res = await api.request(`/stores/${storeId}/customers/search?search=${encodeURIComponent(searchTerm)}`, { method: "GET" });
    return res.json();
  },
  
  // Store Indents operations
  async getStoreIndents(storeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await api.request(`/stores/${storeId}/indents${queryParams ? `?${queryParams}` : ''}`, { method: "GET" });
    return res.json();
  },
  
  // Store Damaged Goods operations
  async getStoreDamagedGoods(storeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await api.request(`/stores/${storeId}/damaged-goods${queryParams ? `?${queryParams}` : ''}`, { method: "GET" });
    return res.json();
  },
  
  // Store Returns operations
  async getStoreReturns(storeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await api.request(`/stores/${storeId}/returns${queryParams ? `?${queryParams}` : ''}`, { method: "GET" });
    return res.json();
  },
  
  // Store Inventory operations
  async getStoreInventory(storeId) {
    const res = await api.request(`/stores/${storeId}/inventory`, { method: "GET" });
    return res.json();
  },
  
  // Store Products operations
  async getStoreProducts(storeId) {
    const res = await api.request(`/stores/${storeId}/products`, { method: "GET" });
    return res.json();
  },
  async getStoreProductsForSale(storeId, searchTerm = "", productType = "") {
    let queryParams = [];
    if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
    if (productType) queryParams.push(`productType=${encodeURIComponent(productType)}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : "";
    const res = await api.request(`/stores/${storeId}/products/for-sale${queryString}`, { method: "GET" });
    return res.json();
  },
  async getStoreProductsForBulkUpdate(storeId, searchTerm = "") {
    const queryParams = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
    const res = await api.request(`/stores/${storeId}/products/bulk-update${queryParams}`, { method: "GET" });
    return res.json();
  },
  async bulkUpdateStoreProductPricing(storeId, body) {
    const res = await api.request(`/stores/${storeId}/products/bulk-update`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async updateStoreProductPricing(storeId, body) {
    const res = await api.request(`/stores/${storeId}/products/pricing`, { method: "PUT", body: JSON.stringify(body) });
    return res.json();
  },
  
  // Store Reports operations
  async getDayWiseSalesReport(storeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await api.request(`/stores/${storeId}/reports/day-wise-sales${queryParams ? `?${queryParams}` : ''}`, { method: "GET" });
    return res.json();
  },
  async getPaymentReports(storeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await api.request(`/stores/${storeId}/reports/payments${queryParams ? `?${queryParams}` : ''}`, { method: "GET" });
    return res.json();
  },
  async getStorePerformance(storeId, params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const res = await api.request(`/stores/${storeId}/reports/performance${queryParams ? `?${queryParams}` : ''}`, { method: "GET" });
    return res.json();
  },
};

export default storeService;


