import api from "./apiService";

const settingsService = {
  async getSettings() {
    const res = await api.request("/settings", { method: "GET" });
    return res.json();
  },
  async updateSettings(body) {
    const res = await api.request("/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return res.json();
  },
};

export default settingsService;
