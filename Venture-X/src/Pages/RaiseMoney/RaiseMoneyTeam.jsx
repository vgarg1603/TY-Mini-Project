import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import {
  saveTeam,
  getRaiseStart,
  uploadTeamProfileImage,
} from "../../lib/api.js";
import { menuOptions } from "../../assets/data.js";

const NAVBAR_HEIGHT = 80;

const emptyMember = () => ({
  fullName: "",
  title: "",
  about: "",
  workEmail: "",
  isFounder: false,
  linkedInProfile: "",
  profilePicture: "", // URL or base64 uploaded placeholder
  _localId: crypto.randomUUID(), // for React key
});

const RaiseMoneyTeam = () => {
  const { startupName: startupNameFromPath } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Team");
  const [team, setTeam] = useState([emptyMember()]);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const fileInputsRef = useRef({});

  const startupDisplayName = useMemo(() => {
    if (startupNameFromPath) return decodeURIComponent(startupNameFromPath);
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("startup") || params.get("name");
    return fromQuery ? fromQuery : "Startup Name";
  }, [startupNameFromPath, location.search]);

  // Load existing team if any
  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try {
        const company = await getRaiseStart(user.id);
        if (company?.team && company.team.length) {
          setTeam(
            company.team.map((m) => ({ ...m, _localId: crypto.randomUUID() }))
          );
        }
      } catch (e) {
        console.error("Failed to load team", e);
      }
    })();
  }, [user?.id]);

  const toggleSidebar = () => setIsSidebarOpen((o) => !o);

  const handleFieldChange = (id, field, value) => {
    setTeam((list) =>
      list.map((m) => (m._localId === id ? { ...m, [field]: value } : m))
    );
  };

  const addMember = () => {
    setTeam((list) => [...list, emptyMember()]);
    setStatusMsg(null);
  };

  const removeMember = (id) => {
    setTeam((list) =>
      list.length === 1 ? list : list.filter((m) => m._localId !== id)
    );
  };

  const handleImageSelect = async (id, file) => {
    if (!file) return;
    if (!user?.id) {
      setStatusMsg("Not authenticated");
      return;
    }
    // Optimistic local preview
    const previewUrl = URL.createObjectURL(file);
    handleFieldChange(id, "profilePicture", previewUrl);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const url = await uploadTeamProfileImage({
            userSupaId: user.id,
            fileBase64: e.target.result,
            fileName: file.name,
          });
          if (url) handleFieldChange(id, "profilePicture", url);
        } catch (err) {
          console.error("Upload failed", err);
          setStatusMsg("Image upload failed");
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error("Image processing failed", e);
      setStatusMsg("Image processing failed");
    }
  };

  const triggerFile = (id) => {
    if (fileInputsRef.current[id]) fileInputsRef.current[id].click();
  };

  const validate = () => {
    // Basic: at least one member with fullName
    return team.some((m) => m.fullName.trim());
  };

  const handleSave = async () => {
    if (!user?.id) {
      setStatusMsg("Not authenticated");
      return;
    }
    if (!validate()) {
      setStatusMsg("Add at least one team member with a name.");
      return;
    }
    try {
      setSaving(true);
      setStatusMsg(null);
      const payload = team.map((m) => {
        const { _localId, ...rest } = m;
        return rest;
      });
      const saved = await saveTeam({ userSupaId: user.id, team: payload });
      setTeam(saved.map((m) => ({ ...m, _localId: crypto.randomUUID() })));
      setStatusMsg("Saved");
    } catch (e) {
      setStatusMsg(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative font-sans">
      {/* Hamburger */}
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
          <div className="my-8 pb-4 border-b border-gray-200 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 capitalize truncate">
                {startupDisplayName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Team Builder</p>
            </div>
            <button
              aria-label="Close menu"
              className="shrink-0 text-2xl text-gray-500 hover:text-gray-700 -mt-1"
              onClick={toggleSidebar}
            >
              ×
            </button>
          </div>
          <nav className="space-y-2">
            {menuOptions.map((item) => (
              <button
                key={item.name}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 group ${
                  activeItem === item.name
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
                  }
                }}
              >
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-80" : "ml-0"
        } p-8`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Team</h2>
            <div className="flex items-center gap-3">
              {statusMsg && (
                <span className="text-sm text-slate-600">{statusMsg}</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded text-white text-sm font-medium ${
                  saving ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? "Saving..." : "Save Team"}
              </button>
              <button
                onClick={addMember}
                className="px-4 py-2 rounded text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm font-medium"
              >
                + Add Member
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {team.map((member) => (
              <div
                key={member._localId}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative group overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-50/40 to-transparent" />
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Picture + upload */}
                  <div className="flex flex-col items-center md:w-48">
                    <div
                      onClick={() => triggerFile(member._localId)}
                      className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-transparent hover:ring-indigo-300 cursor-pointer relative"
                    >
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={member.fullName || "profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 text-center px-4 leading-tight">
                          Upload Photo
                        </span>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] py-1 tracking-wide">
                        Change
                      </div>
                    </div>
                    <input
                      ref={(el) =>
                        (fileInputsRef.current[member._localId] = el)
                      }
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageSelect(member._localId, e.target.files?.[0])
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeMember(member._localId)}
                      disabled={team.length === 1}
                      className={`mt-3 text-xs px-2 py-1 rounded border ${
                        team.length === 1
                          ? "text-slate-400 border-slate-200"
                          : "text-red-600 border-red-300 hover:bg-red-50"
                      }`}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="flex-1 grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1">
                        Full Name
                      </label>
                      <input
                        value={member.fullName}
                        onChange={(e) =>
                          handleFieldChange(
                            member._localId,
                            "fullName",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1">
                        Title / Role
                      </label>
                      <input
                        value={member.title}
                        onChange={(e) =>
                          handleFieldChange(
                            member._localId,
                            "title",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Co-founder & CEO"
                      />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1">
                        About
                      </label>
                      <textarea
                        rows={3}
                        value={member.about}
                        onChange={(e) =>
                          handleFieldChange(
                            member._localId,
                            "about",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Short bio / notable achievements"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1">
                        Work Email
                      </label>
                      <input
                        type="email"
                        value={member.workEmail}
                        onChange={(e) =>
                          handleFieldChange(
                            member._localId,
                            "workEmail",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="name@company.com"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        value={member.linkedInProfile}
                        onChange={(e) =>
                          handleFieldChange(
                            member._localId,
                            "linkedInProfile",
                            e.target.value
                          )
                        }
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        id={`founder-${member._localId}`}
                        type="checkbox"
                        checked={member.isFounder}
                        onChange={(e) =>
                          handleFieldChange(
                            member._localId,
                            "isFounder",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        htmlFor={`founder-${member._localId}`}
                        className="text-xs font-medium text-slate-700"
                      >
                        Founder
                      </label>
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                <div className="mt-6 border-t pt-4 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-500 px-1 text-center leading-tight">
                        Photo
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <h3 className="text-base font-semibold text-slate-800">
                        {member.fullName || "Full Name"}
                      </h3>
                      <span className="text-sm text-slate-500 font-medium">
                        {member.title || "Title / Role"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {member.about || "Short bio will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseMoneyTeam;
