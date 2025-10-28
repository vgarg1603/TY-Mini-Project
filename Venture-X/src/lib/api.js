import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE,
  // Set to true only if you intend to use cookies/sessions across origins
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function syncUser({ supabaseId, email, fullName }) {
  try {
    const { data } = await api.post("/api/auth/sync", {
      supabaseId,
      email,
      fullName,
    });
    return data;
  } catch (err) {
    const message =
      err?.response?.data?.error || err?.message || "Failed to sync user";
    throw new Error(message);
  }
}

export async function getWelcomeData(email) {
  if (!email) throw new Error("email is required");
  try {
    const { data } = await api.get("/api/welcome", { params: { email } });
    return data?.user || null;
  } catch (err) {
    const message =
      err?.response?.data?.error || err?.message || "Failed to fetch data";
    throw new Error(message);
  }
}

export async function saveWelcomeProgress(payload) {
  try {
    const { data } = await api.patch("/api/welcome", payload);
    return data?.user || null;
  } catch (err) {
    const message =
      err?.response?.data?.error || err?.message || "Failed to save progress";
    throw new Error(message);
  }
}

export async function uploadProfileImage({ email, fileBase64, fileName }) {
  if (!email) throw new Error("email is required");
  if (!fileBase64) throw new Error("fileBase64 is required");
  try {
    const { data } = await api.post("/api/upload/profile-image", {
      email,
      fileBase64,
      fileName,
    });
    return data; // { url, user }
  } catch (err) {
    const message =
      err?.response?.data?.error || err?.message || "Failed to upload image";
    throw new Error(message);
  }
}

export async function getRaiseStart(userSupaId) {
  if (!userSupaId) throw new Error("userSupaId is required");
  try {
    const { data } = await api.get("/api/raise_money/start", {
      params: { userSupaId },
    });
    return data?.company || null;
  } catch (err) {
    const message =
      err?.response?.data?.error || err?.message || "Failed to fetch company";
    throw new Error(message);
  }
}

export async function saveRaiseStart(payload) {
  try {
    const { data } = await api.patch("/api/raise_money/start", payload);
    return data?.company || null;
  } catch (err) {
    const message =
      err?.response?.data?.error || err?.message || "Failed to save company";
    throw new Error(message);
  }
}

// Returns a safe redirect path for Raise Money click, and associates a new company if missing
export async function getRaiseMoneyRedirect({ supabaseId }) {
  if (!supabaseId) throw new Error("supabaseId is required");
  try {
    const { data } = await api.get("/api/company/redirect", {
      params: { supabaseId },
    });
    return data?.path || "/raise_money/start";
  } catch {
    // fallback to start on any error
    return "/raise_money/start";
  }
}

export async function getCompanyStatus({ supabaseId }) {
  if (!supabaseId) throw new Error("supabaseId is required");
  const { data } = await api.get("/api/company/status", {
    params: { supabaseId },
  });
  return data;
}

export async function saveCompanyDetails(payload) {
  // expects: { supabaseId, companyName, companyWebsite, location, industries, tags, raiseAlready, raiseWant }
  if (!payload?.supabaseId) throw new Error("supabaseId is required");
  const { data } = await api.post("/api/company/save", payload);
  return data; // { company, startupName }
}

// Upload a company asset (image/video/logo) to ImageKit and persist URL on company document
export async function uploadCompanyAsset({
  userSupaId,
  field,
  fileBase64,
  fileName,
}) {
  if (!userSupaId) throw new Error("userSupaId is required");
  if (!fileBase64) throw new Error("fileBase64 is required");
  const { data } = await api.post("/api/upload/company-asset", {
    userSupaId,
    field,
    fileBase64,
    fileName,
  });
  return data; // { url, field, company }
}

// Save rich description (HTML) only (autosave usage)
export async function saveCompanyDescription({
  userSupaId,
  companyDescription,
}) {
  if (!userSupaId) throw new Error("userSupaId is required");
  const { data } = await api.patch("/api/raise_money/description", {
    userSupaId,
    companyDescription,
  });
  return data?.companyDescription || "";
}

// Update round info
export async function saveRound({ userSupaId, round }) {
  if (!userSupaId) throw new Error("userSupaId is required");
  const { data } = await api.patch("/api/raise_money/round", {
    userSupaId,
    round,
  });
  return data?.round || null;
}

// List investments for a company (by userSupaId or startupName)
export async function getInvestments({ userSupaId, startupName, limit = 50 }) {
  const params = {};
  if (userSupaId) params.userSupaId = userSupaId;
  if (startupName) params.startupName = startupName;
  params.limit = limit;
  const { data } = await api.get("/api/investment/list", { params });
  return data?.investments || [];
}

// Create an investment (for testing/demo; in real app investor identity would be current user)
export async function createInvestment({
  userSupaId,
  startupName,
  investorSupaId,
  investorEmail,
  amount,
  note,
}) {
  const payload = {
    userSupaId,
    startupName,
    investorSupaId,
    investorEmail,
    amount,
    note,
  };
  const { data } = await api.post("/api/investment", payload);
  return data?.investment || null;
}

// Save team array
export async function saveTeam({ userSupaId, team }) {
  if (!userSupaId) throw new Error("userSupaId is required");
  const { data } = await api.patch("/api/raise_money/team", {
    userSupaId,
    team,
  });
  return data?.team || [];
}

// Upload a team profile image and return its URL
export async function uploadTeamProfileImage({
  userSupaId,
  fileBase64,
  fileName,
}) {
  if (!userSupaId) throw new Error("userSupaId is required");
  if (!fileBase64) throw new Error("fileBase64 is required");
  const { data } = await api.post("/api/upload/team-profile", {
    userSupaId,
    fileBase64,
    fileName,
  });
  return data?.url;
}

// List companies with optional filters
export async function getCompanies({
  industry,
  industries,
  q,
  limit = 24,
  skip = 0,
} = {}) {
  const params = { limit, skip };
  if (industry) params.industry = industry;
  if (industries && Array.isArray(industries) && industries.length) {
    params.industries = industries.join(",");
  }
  if (q) params.q = q;
  const { data } = await api.get("/api/company/list", { params });
  return data; // { items, total, limit, skip }
}
