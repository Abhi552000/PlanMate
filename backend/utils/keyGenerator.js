/**
 * Key Generation Utility for Organizations and Boards
 * 
 * Rules:
 * 1. Company Key:
 *    - Derived from Organization Name.
 *    - For multi-word company (e.g. "TCSNET Solution"), takes initials: "TS".
 *    - Default tickets: TS-1, TS-2.
 * 
 * 2. Board / Workspace Key:
 *    - Derived from Company Prefix + Environment / Board designation.
 *    - For "TCSNET Solution" in "SIT" environment (or "TCSNET SOLUTION SIT"):
 *      Prefix "TC" + "SIT" => "TCSIT".
 *      Tickets in SIT board: TCSIT-1, TCSIT-2.
 *    - For "UAT": "TC" + "UAT" => "TCUAT".
 *    - For "DEV": "TC" + "DEV" => "TCDEV".
 */

export const generateCompanyKey = (orgName) => {
  if (!orgName || typeof orgName !== "string") return "PM";
  const clean = orgName.trim().replace(/[^a-zA-Z0-9\s]/g, "");
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    // E.g. "TCSNET Solution" -> "TS"
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
  } else if (words.length === 1) {
    // E.g. "TCSNET" -> "TCS" or "TC"
    return words[0].slice(0, 3).toUpperCase();
  }

  return "PM";
};

const ENV_CODES = {
  sit: "SIT",
  uat: "UAT",
  development: "DEV",
  staging: "STG",
  production: "PRD",
  other: "GEN",
};

export const generateBoardKey = (orgName, boardName = "", environment = "sit") => {
  // 1. Identify Environment Code
  const normalizedEnv = (environment || "sit").toLowerCase();
  let envCode = ENV_CODES[normalizedEnv] || "SIT";

  // Check if boardName explicitly mentions an environment
  const upperBoardName = (boardName || "").toUpperCase();
  if (upperBoardName.includes("UAT")) {
    envCode = "UAT";
  } else if (upperBoardName.includes("SIT")) {
    envCode = "SIT";
  } else if (upperBoardName.includes("DEV") || upperBoardName.includes("DEVELOPMENT")) {
    envCode = "DEV";
  } else if (upperBoardName.includes("STAGE") || upperBoardName.includes("STAGING")) {
    envCode = "STG";
  } else if (upperBoardName.includes("PROD") || upperBoardName.includes("PRODUCTION")) {
    envCode = "PRD";
  }

  // 2. Company Prefix (first 2 alphanumeric characters of company name or first word)
  // E.g. "TCSNET Solution" -> first word "TCSNET" -> "TC"
  let companyPrefix = "TC";
  if (orgName && typeof orgName === "string") {
    const cleanOrg = orgName.trim().replace(/[^a-zA-Z0-9\s]/g, "");
    const words = cleanOrg.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      companyPrefix = words[0].slice(0, 2).toUpperCase();
    }
  }

  // Combine: E.g. "TC" + "SIT" => "TCSIT", "TC" + "UAT" => "TCUAT"
  return `${companyPrefix}${envCode}`;
};
