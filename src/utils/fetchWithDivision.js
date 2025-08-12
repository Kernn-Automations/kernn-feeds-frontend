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
  // 1) build the base URL
  let url = import.meta.env.VITE_API_URL + endpoint;

  // 2) append the right query or path param
  if (showAll) {
    url += "?showAllDivisions=true";
  } else if (divisionId && divisionId !== "all") {
    // <-- new: path-param style
    url += `/division/${divisionId}`;
    console.log(`[fetchWithDivision] Building URL with divisionId: ${divisionId} (type: ${typeof divisionId})`);
  }
  
  console.log(`[fetchWithDivision] Final URL: ${url}`);

  // 3) do the fetch
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 4) error‐throwing
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[fetchWithDivision] ${response.status} ${url}`, text);
    throw new Error(`Error ${response.status} fetching ${url}: ${text}`);
  }

  return response.json();
};