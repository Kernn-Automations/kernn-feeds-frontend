// src/utils/fetchWithDivision.js

/**
 * Fetches data from your API, automatically applying the selected division filter.
 *
 * @param {string}          endpoint      The API path (e.g. "/employees").
 * @param {string}          token         The JWT access token.
 * @param {number|string}   divisionId    The selected division ID, or "all".
 * @param {boolean}         showAll       If true, fetch across all divisions.
 *
 * @returns {Promise<any>}  The parsed JSON response.
 */
export const fetchWithDivision = async (
  endpoint,
  token,
  divisionId,
  showAll
) => {
  console.log(`[fetchWithDivision] Called with:`, {
    endpoint,
    divisionId,
    showAll,
    token: token ? 'present' : 'missing'
  });
  
  // 1) build the base URL
  let url = import.meta.env.VITE_API_URL + endpoint;

  // 2) append the right query parameters
  if (showAll || divisionId === "all") {
    url += "?showAllDivisions=true";
    console.log(`[fetchWithDivision] Building URL with showAllDivisions=true (divisionId: ${divisionId})`);
  } else if (divisionId && divisionId !== "all") {
    // Use query parameter style for better compatibility
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}divisionId=${divisionId}`;
    console.log(`[fetchWithDivision] Building URL with divisionId: ${divisionId} (type: ${typeof divisionId})`);
  }
  
  console.log(`[fetchWithDivision] Final URL: ${url}`);
  console.log(`[fetchWithDivision] Request details:`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token ? 'present' : 'missing'}`,
      "Content-Type": "application/json"
    }
  });

  // 3) do the fetch
  console.log(`[fetchWithDivision] Executing fetch to: ${url}`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  console.log(`[fetchWithDivision] Response status: ${response.status}`);

  // 4) error‐throwing
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[fetchWithDivision] ${response.status} ${url}`, text);
    throw new Error(`Error ${response.status} fetching ${url}: ${text}`);
  }

  // 5) parse and return
  const result = await response.json();
  console.log(`[fetchWithDivision] Successfully parsed response for ${endpoint}`);
  return result;
};