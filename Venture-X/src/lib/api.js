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
