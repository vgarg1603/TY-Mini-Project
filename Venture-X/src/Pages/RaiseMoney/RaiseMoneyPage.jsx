import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import { api } from "../../lib/api.js";

const RaiseMoneyPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Overview");
  const { startupName: startupNameFromPath } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const NAVBAR_HEIGHT = 80;

  const startupDisplayName = useMemo(() => {
    if (startupNameFromPath) return decodeURIComponent(startupNameFromPath);
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("startup") || params.get("name");
    return fromQuery ? fromQuery : "Startup Name";
  }, [startupNameFromPath, location.search]);

  // Overview form state
  const [form, setForm] = useState({
    companyName: "",
    companyOneLiner: "",
    companyWebsite: "",
    linkedInLink: "",
    InstagramLink: "",
    YoutubeLink: "",
    mainCoverPhoto: "",
    mainCoverVideo: "",
    companyLogo: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState({
    mainCoverPhoto: "",
    mainCoverVideo: "",
    companyLogo: "",
  });

  // Load existing company when user is ready
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.id) return;
      try {
        const { data } = await api.get("/api/raise_money/start", {
          params: { userSupaId: user.id },
        });
        const company = data?.company || data; // tolerate either shape
        if (!mounted || !company) return;
        setForm((prev) => ({
          ...prev,
          companyName: company.companyName || "",
          companyOneLiner: company.companyOneLiner || "",
          companyWebsite: company.companyWebsite || "",
          linkedInLink: company.linkedInLink || "",
          InstagramLink: company.InstagramLink || "",
          YoutubeLink: company.YoutubeLink || "",
          mainCoverPhoto: company.mainCoverPhoto || "",
          mainCoverVideo: company.mainCoverVideo || "",
          companyLogo: company.companyLogo || "",
          location: company.location || "",
        }));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // URL validation helpers
  const isUrl = (val) => {
    if (!val) return true; // empty is allowed
    try {
      const u = new URL(val.startsWith("http") ? val : `https://${val}`);
      return !!u.hostname && u.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const hostIncludes = (val, hosts) => {
    if (!val) return true; // empty is allowed
    try {
      const u = new URL(val.startsWith("http") ? val : `https://${val}`);
      return hosts.some((h) => u.hostname.toLowerCase().includes(h));
    } catch {
      return false;
    }
  };

  const validators = React.useMemo(
    () => ({
      companyWebsite: (v) => (isUrl(v) ? "" : "Enter a valid URL"),
      linkedInLink: (v) =>
        hostIncludes(v, ["linkedin.com"])
          ? ""
          : v
          ? "Must be a linkedin.com URL"
          : "",
      InstagramLink: (v) =>
        hostIncludes(v, ["instagram.com"])
          ? ""
          : v
          ? "Must be an instagram.com URL"
          : "",
      YoutubeLink: (v) =>
        hostIncludes(v, ["youtube.com", "youtu.be"])
          ? ""
          : v
          ? "Must be a youtube.com or youtu.be URL"
          : "",
    }),
    []
  );

  useEffect(() => {
    const newErrors = {};
    Object.entries(validators).forEach(([k, fn]) => {
      const msg = fn(form[k]);
      if (msg) newErrors[k] = msg;
    });
    setErrors(newErrors);
  }, [form, validators]);

  const normalizeOnBlur = (e) => {
    const { name, value } = e.target;
    if (!value) return;
    try {
      const withProto = value.startsWith("http") ? value : `https://${value}`;
      const url = new URL(withProto);
      setForm((f) => ({ ...f, [name]: url.href }));
    } catch {
      // leave as-is; validator will show error
    }
  };

  async function saveTextFields() {
    if (!user?.id) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        userSupaId: user.id,
        companyName: form.companyName,
        companyWebsite: form.companyWebsite,
        location: form.location,
        companyOneLiner: form.companyOneLiner,
        linkedInLink: form.linkedInLink,
        InstagramLink: form.InstagramLink,
        YoutubeLink: form.YoutubeLink,
      };
      await api.patch("/api/raise_money/start", payload);
      setMessage("Saved changes");
    } catch (err) {
      setMessage(err?.response?.data?.error || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(field, file) {
    if (!file || !user?.id) return;
    setSaving(true);
    setMessage("");
    try {
      // show immediate local preview
      const localUrl = URL.createObjectURL(file);
      setPreviews((p) => ({ ...p, [field]: localUrl }));
      const fileBase64 = await fileToBase64(file);
      const { data } = await api.post("/api/upload/company-asset", {
        userSupaId: user.id,
        field,
        fileBase64,
        fileName: file.name,
      });
      const url = data?.url;
      if (url) setForm((f) => ({ ...f, [field]: url }));
      setMessage("Uploaded");
    } catch (err) {
      setMessage(err?.response?.data?.error || err.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { name: "Overview" },
    { name: "Editor" },
    { name: "Investments" },
    { name: "Orders" },
    { name: "Products" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 relative font-sans">
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Toggle menu"
        style={{ top: NAVBAR_HEIGHT + 8 }}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
              isSidebarOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
            }`}
          ></span>
          <span
            className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
              isSidebarOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
              isSidebarOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
            }`}
          ></span>
        </div>
      </button>

      {/* Overlay (below navbar) */}
      {isSidebarOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-opacity-50 z-30"
          style={{ top: NAVBAR_HEIGHT }}
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
      >
        <div className="p-6 relative h-full">
          {/* Header: Startup Name + Close */}
          <div className="my-8 pb-4 border-b border-gray-200 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 capitalize truncate">
                {startupDisplayName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Campaign Dashboard</p>
            </div>
            <button
              aria-label="Close menu"
              className="shrink-0 text-2xl text-gray-500 hover:text-gray-700 -mt-1"
              onClick={toggleSidebar}
            >
              ×
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 group ${
                  activeItem === item.name
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => {
                  setActiveItem(item.name);
                  // Placeholder for navigation
                  console.log(`Navigating to ${item.name}`);
                }}
              >
                <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-80" : "ml-0"
        } p-8`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 min-h-[50vh]">
            {/* Overview form */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Basics
            </h2>
            <div className="grid grid-cols-1 gap-6 max-w-3xl">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Inc"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tagline
                </label>
                <input
                  name="companyOneLiner"
                  value={form.companyOneLiner}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="One sentence pitch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  name="companyWebsite"
                  value={form.companyWebsite}
                  onChange={handleChange}
                  onBlur={normalizeOnBlur}
                  className={`mt-1 w-full rounded-md border px-3 py-2 ${
                    errors.companyWebsite ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="https://example.com"
                />
                {errors.companyWebsite && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.companyWebsite}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                <input
                  name="linkedInLink"
                  value={form.linkedInLink}
                  onChange={handleChange}
                  onBlur={normalizeOnBlur}
                  className={`mt-1 w-full rounded-md border px-3 py-2 ${
                    errors.linkedInLink ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="https://linkedin.com/company/..."
                />
                {errors.linkedInLink && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.linkedInLink}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <input
                  name="InstagramLink"
                  value={form.InstagramLink}
                  onChange={handleChange}
                  onBlur={normalizeOnBlur}
                  className={`mt-1 w-full rounded-md border px-3 py-2 ${
                    errors.InstagramLink ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="https://instagram.com/..."
                />
                {errors.InstagramLink && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.InstagramLink}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  YouTube
                </label>
                <input
                  name="YoutubeLink"
                  value={form.YoutubeLink}
                  onChange={handleChange}
                  onBlur={normalizeOnBlur}
                  className={`mt-1 w-full rounded-md border px-3 py-2 ${
                    errors.YoutubeLink ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="https://youtube.com/@..."
                />
                {errors.YoutubeLink && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.YoutubeLink}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="City, State, Country"
                />
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Main Image (1200x675 suggested)
                </label>
                {(previews.mainCoverPhoto || form.mainCoverPhoto) && (
                  <img
                    src={previews.mainCoverPhoto || form.mainCoverPhoto}
                    alt="Main"
                    className="mt-2 h-40 w-full object-cover rounded border"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) =>
                    onUpload("mainCoverPhoto", e.target.files?.[0])
                  }
                />
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Video (.mp4 up to 300MB)
                </label>
                {(previews.mainCoverVideo || form.mainCoverVideo) && (
                  <video
                    className="mt-2 w-full rounded border"
                    src={previews.mainCoverVideo || form.mainCoverVideo}
                    controls
                  />
                )}
                <input
                  type="file"
                  accept="video/mp4,video/*"
                  className="mt-2"
                  onChange={(e) =>
                    onUpload("mainCoverVideo", e.target.files?.[0])
                  }
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Logo
                </label>
                {(previews.companyLogo || form.companyLogo) && (
                  <img
                    src={previews.companyLogo || form.companyLogo}
                    alt="Logo"
                    className="mt-2 h-24 w-24 object-contain rounded border"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => onUpload("companyLogo", e.target.files?.[0])}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                disabled={saving || Object.keys(errors).length > 0}
                onClick={saveTextFields}
                className={`px-4 py-2 rounded-md text-white ${
                  saving || Object.keys(errors).length > 0
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {message && (
                <span className="text-sm text-gray-600">{message}</span>
              )}
              {Object.keys(errors).length > 0 && (
                <span className="text-sm text-red-600">
                  Fix invalid links to save
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseMoneyPage;
