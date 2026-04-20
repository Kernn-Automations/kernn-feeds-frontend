import apiService from "./apiService";

const REPORT_CATEGORIES = {
  sales: "sales",
  inventory: "inventory",
  finance: "finance",
  target: "target",
  returns: "returns",
  damage: "damage",
  assets: "assets",
};

const REPORT_TYPES = {
  comparison: "comparison",
  summary: "summary",
  leaderboard: "leaderboard",
  trend: "trend",
  profitability: "profitability",
  stockSummary: "stockSummary",
  stockMovement: "stockMovement",
  paymentAnalysis: "paymentAnalysis",
  targetVsAchievement: "targetVsAchievement",
  returnSummary: "returnSummary",
  returnRegister: "returnRegister",
  damageSummary: "damageSummary",
  damageRegister: "damageRegister",
  assetSummary: "assetSummary",
  assetRegister: "assetRegister",
};

function buildErpReportsQuery(params) {
  const qs = new URLSearchParams();
  if (params.fromDate) qs.append("fromDate", params.fromDate);
  if (params.toDate) qs.append("toDate", params.toDate);
  if (params.reportCategory) qs.append("reportCategory", params.reportCategory);
  if (params.reportType) qs.append("reportType", params.reportType);
  if (params.storeIds && params.storeIds.length > 0) {
    qs.append("storeIds", params.storeIds.join(","));
  }
  return qs.toString();
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

class ErpReportsService {
  async getAvailableStores() {
    const response = await apiService.get("/reports/store-comparison/stores");
    if (!response) {
      return { success: false, message: "Request cancelled (not authenticated)" };
    }

    const data = await parseJsonSafe(response);

    if (!response.ok) {
      return {
        success: false,
        message:
          data?.message ||
          data?.error ||
          `Request failed (${response.status})`,
        data,
      };
    }

    return {
      success: true,
      data: data?.data || data?.stores || [],
    };
  }

  async getErpReport({
    fromDate,
    toDate,
    reportCategory,
    reportType,
    storeIds,
  }) {
    const query = buildErpReportsQuery({
      fromDate,
      toDate,
      reportCategory,
      reportType,
      storeIds,
    });

    const endpoint = `/reports/erp${query ? `?${query}` : ""}`;
    const response = await apiService.get(endpoint);
    if (!response) {
      return { success: false, message: "Request cancelled (not authenticated)" };
    }

    const data = await parseJsonSafe(response);

    if (!response.ok) {
      return {
        success: false,
        message:
          data?.message ||
          data?.error ||
          `Request failed (${response.status})`,
        data,
      };
    }

    return { success: true, data };
  }
}

export { REPORT_CATEGORIES, REPORT_TYPES };
export default new ErpReportsService();

