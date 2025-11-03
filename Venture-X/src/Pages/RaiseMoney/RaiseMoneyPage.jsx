import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { menuOptions } from "../../assets/data.js";

const RaiseMoneyPage = () => {
  const [activeItem, setActiveItem] = useState("Overview");
  const { startupName: startupNameFromPath } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

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
      // Redirect to explore page after successful save
      setTimeout(() => {
        navigate("/explore");
      }, 1000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 relative font-sans">
      {/* Sidebar - Always Open */}
      <div
        className="fixed left-0 w-80 bg-white shadow-2xl z-40 border-r-2 border-gray-100"
        style={{
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
      >
        <div className="p-6 relative h-full overflow-y-auto">
          {/* Header: Startup Name */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent capitalize truncate">
                {startupDisplayName}
              </h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">Campaign Dashboard</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1.5">
            {menuOptions.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center px-4 py-3.5 text-left rounded-xl transition-all duration-200 group ${
                  activeItem === item.name
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border-2 border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent"
                }`}
                onClick={() => {
                  setActiveItem(item.name);
                  if (item.path) {
                    const slug =
                      startupNameFromPath ||
                      encodeURIComponent(
                        startupDisplayName
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                      );
                    navigate(item.path(slug));
                  } else {
                    console.log(
                      `Navigating to ${item.name} (not yet implemented)`
                    );
                  }
                }}
              >
                <span className={`text-xl mr-3 transition-transform duration-200 ${
                  activeItem === item.name ? "scale-110" : "group-hover:scale-110"
                }`}>
                  {item.icon}
                </span>
                <span className="font-semibold">{item.name}</span>
                {activeItem === item.name && (
                  <svg className="w-5 h-5 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content - Always has left margin */}
      <div className="ml-80 p-6 sm:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 sm:p-10 min-h-[50vh]">
            {/* Page Header */}
            <div className="mb-8 pb-6 border-b-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Company Overview
                </h2>
              </div>
              <p className="text-gray-600 ml-13">Set up your company's basic information and branding</p>
            </div>

            {/* Overview form */}
            <div className="grid grid-cols-1 gap-8 max-w-4xl">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-6 border-2 border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  Basic Information
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Acme Inc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tagline *
                    </label>
                    <input
                      name="companyOneLiner"
                      value={form.companyOneLiner}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="One sentence pitch"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>
              </div>

              {/* Online Presence Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 rounded-xl p-6 border-2 border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/>
                  </svg>
                  Online Presence
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      name="companyWebsite"
                      value={form.companyWebsite}
                      onChange={handleChange}
                      onBlur={normalizeOnBlur}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                        errors.companyWebsite 
                          ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
                          : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                      placeholder="https://example.com"
                    />
                    {errors.companyWebsite && (
                      <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.companyWebsite}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      name="linkedInLink"
                      value={form.linkedInLink}
                      onChange={handleChange}
                      onBlur={normalizeOnBlur}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                        errors.linkedInLink 
                          ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
                          : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                      placeholder="https://linkedin.com/company/..."
                    />
                    {errors.linkedInLink && (
                      <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.linkedInLink}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      name="InstagramLink"
                      value={form.InstagramLink}
                      onChange={handleChange}
                      onBlur={normalizeOnBlur}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                        errors.InstagramLink 
                          ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
                          : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                      placeholder="https://instagram.com/..."
                    />
                    {errors.InstagramLink && (
                      <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.InstagramLink}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      YouTube
                    </label>
                    <input
                      name="YoutubeLink"
                      value={form.YoutubeLink}
                      onChange={handleChange}
                      onBlur={normalizeOnBlur}
                      className={`w-full rounded-xl border-2 px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                        errors.YoutubeLink 
                          ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
                          : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                      placeholder="https://youtube.com/@..."
                    />
                    {errors.YoutubeLink && (
                      <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.YoutubeLink}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Visual Assets Section */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl p-6 border-2 border-amber-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                  </svg>
                  Visual Assets
                </h3>
                <div className="space-y-6">
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Main Cover Image
                      <span className="text-xs text-gray-500 font-normal ml-2">(1200x675 recommended)</span>
                    </label>
                    {(previews.mainCoverPhoto || form.mainCoverPhoto) && (
                      <div className="mb-4 relative group">
                        <img
                          src={previews.mainCoverPhoto || form.mainCoverPhoto}
                          alt="Main"
                          className="w-full h-56 object-cover rounded-xl border-2 border-gray-200 shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Change Image</span>
                        </div>
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          onUpload("mainCoverPhoto", e.target.files?.[0])
                        }
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {(previews.mainCoverPhoto || form.mainCoverPhoto) ? 'Change' : 'Upload'} Cover Image
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Video */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Cover Video
                      <span className="text-xs text-gray-500 font-normal ml-2">(MP4, up to 300MB)</span>
                    </label>
                    {(previews.mainCoverVideo || form.mainCoverVideo) && (
                      <div className="mb-4">
                        <video
                          className="w-full rounded-xl border-2 border-gray-200 shadow-md"
                          src={previews.mainCoverVideo || form.mainCoverVideo}
                          controls
                        />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="video/mp4,video/*"
                        className="hidden"
                        onChange={(e) =>
                          onUpload("mainCoverVideo", e.target.files?.[0])
                        }
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {(previews.mainCoverVideo || form.mainCoverVideo) ? 'Change' : 'Upload'} Video
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Company Logo
                    </label>
                    {(previews.companyLogo || form.companyLogo) && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={previews.companyLogo || form.companyLogo}
                          alt="Logo"
                          className="h-32 w-32 object-contain rounded-xl border-2 border-gray-200 bg-white p-4 shadow-md"
                        />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onUpload("companyLogo", e.target.files?.[0])}
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {(previews.companyLogo || form.companyLogo) ? 'Change' : 'Upload'} Logo
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Section */}
            <div className="mt-10 pt-8 border-t-2 border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  disabled={saving || Object.keys(errors).length > 0}
                  onClick={saveTextFields}
                  className={`px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
                    saving || Object.keys(errors).length > 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105"
                  }`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                
                {/* Messages */}
                <div className="flex-1">
                  {message && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                      message.toLowerCase().includes('saved') || message.toLowerCase().includes('uploaded')
                        ? 'bg-green-50 text-green-700 border-2 border-green-200'
                        : 'bg-red-50 text-red-700 border-2 border-red-200'
                    }`}>
                      {message.toLowerCase().includes('saved') || message.toLowerCase().includes('uploaded') ? (
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      )}
                      <span className="font-medium">{message}</span>
                    </div>
                  )}
                  {Object.keys(errors).length > 0 && !message && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 text-amber-700 border-2 border-amber-200">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Please fix the invalid links before saving</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseMoneyPage;
