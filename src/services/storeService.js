import api from "./apiService";

const storeService = {
  async createStore(body) {
    const res = await api.request("/stores", { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async getStores() {
    const res = await api.request("/stores", { method: "GET" });
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

  async createOrFindCustomer(body) {
    const res = await api.request(`/stores/customers`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async createSale(body) {
    const res = await api.request(`/stores/sales`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async createIndent(body) {
    const res = await api.request(`/store-indents/indents`, { method: "POST", body: JSON.stringify(body) });
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
    const res = await api.request(`/store-indents/indents/${indentId}/approve-reject`, { method: "PUT", body: JSON.stringify({ action, notes }) });
    return res.json();
  },
  async createStockTransfer(body) {
    const res = await api.request(`/store-indents/stock-transfers`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
  async processStockIn(body) {
    const res = await api.request(`/store-indents/stock-in`, { method: "POST", body: JSON.stringify(body) });
    return res.json();
  },
};

export default storeService;


