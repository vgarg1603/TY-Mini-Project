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

  const [activeItem, setActiveItem] = useState("Team Details");
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

      {/* Main content - Always has left margin */}
      <div className="ml-80 p-6 sm:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 sm:p-10 min-h-[50vh]">
            {/* Page Header */}
            <div className="mb-8 pb-6 border-b-2 border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Team Members
                    </h2>
                  </div>
                  <p className="text-gray-600 ml-13">Add and manage your company's team members</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={addMember}
                    className="px-6 py-3 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-semibold border-2 border-indigo-200 hover:border-indigo-300 transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Member
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-200 flex items-center gap-2 ${
                      saving
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
                        Save Team
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Status Message */}
              {statusMsg && (
                <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl ${
                  statusMsg.toLowerCase().includes('saved')
                    ? 'bg-green-50 text-green-700 border-2 border-green-200'
                    : 'bg-red-50 text-red-700 border-2 border-red-200'
                }`}>
                  {statusMsg.toLowerCase().includes('saved') ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  )}
                  <span className="font-medium">{statusMsg}</span>
                </div>
              )}
            </div>

            {/* Team Members */}
            <div className="space-y-6">
              {team.map((member) => (
                <div
                  key={member._localId}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border-2 border-gray-200 p-6 relative group overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-50/60 to-transparent" />
                  <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    {/* Picture + upload */}
                    <div className="flex flex-col items-center md:w-48">
                      <div
                        onClick={() => triggerFile(member._localId)}
                        className="w-36 h-36 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden ring-4 ring-transparent hover:ring-indigo-300 cursor-pointer relative shadow-md transition-all"
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
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] py-1.5 tracking-wide font-semibold text-center">
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
                        className={`mt-4 text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                          team.length === 1
                            ? "text-gray-400 border-2 border-gray-200 cursor-not-allowed"
                            : "text-red-600 border-2 border-red-300 hover:bg-red-50 hover:border-red-400"
                        }`}
                      >
                        Remove Member
                      </button>
                    </div>

                    {/* Form fields */}
                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
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
                          className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
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
                          className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Co-founder & CEO"
                        />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
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
                          className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                          placeholder="Short bio / notable achievements"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
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
                          className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="name@company.com"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">
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
                          className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-4">
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
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`founder-${member._localId}`}
                          className="text-sm font-semibold text-gray-700"
                        >
                          Founder
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-200 flex items-start gap-4 relative z-10">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md ring-2 ring-gray-300">
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {member.fullName || "Full Name"}
                        </h3>
                        <span className="text-sm text-gray-600 font-semibold">
                          {member.title || "Title / Role"}
                        </span>
                        {member.isFounder && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200">
                            🚀 Founder
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
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
    </div>
  );
};

export default RaiseMoneyTeam;
