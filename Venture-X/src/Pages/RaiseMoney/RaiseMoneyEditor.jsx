import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { api } from "../../lib/api.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import { menuOptions } from "../../assets/data.js";

const NAVBAR_HEIGHT = 80;

const RaiseMoneyEditor = () => {
  const { startupName: startupNameFromPath } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeItem, setActiveItem] = useState("Editor");
  const [initialDescription, setInitialDescription] = useState("<p></p>");
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const editorRef = useRef(null);
  const autosaveRef = useRef(null);
  const skipNextSaveRef = useRef(false);

  const startupDisplayName = useMemo(() => {
    if (startupNameFromPath) return decodeURIComponent(startupNameFromPath);
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("startup") || params.get("name");
    return fromQuery ? fromQuery : "Startup Name";
  }, [startupNameFromPath, location.search]);

  // Load existing description
  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try {
        const { data } = await api.get("/api/raise_money/start", {
          params: { userSupaId: user.id },
        });
        const company = data?.company || data;
        if (company?.companyDescription) {
          setInitialDescription(company.companyDescription);
          if (editorRef.current) {
            skipNextSaveRef.current = true;
            editorRef.current.setContent(company.companyDescription);
          }
        }
      } catch (e) {
        console.error("Failed to load description", e);
      }
    })();
  }, [user?.id]);

  const performSave = useCallback(async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      setSaveError(null);
      const html = editorRef.current?.getContent() || "";
      await api.patch("/api/raise_money/description", {
        userSupaId: user.id,
        companyDescription: html,
      });
      setLastSavedAt(new Date());
    } catch (e) {
      console.error("Save failed", e);
      setSaveError(e?.response?.data?.error || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }, [user?.id]);

  const scheduleAutosave = useCallback(() => {
    if (!user?.id) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      performSave();
    }, 1200);
  }, [performSave, user?.id]);

  const handleManualSave = async () => {
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    await performSave();
  };

  const log = () => {
    if (editorRef.current) console.log(editorRef.current.getContent());
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Company Description
                </h2>
              </div>
              <p className="text-gray-600 ml-13">Write and edit your company's detailed description</p>
            </div>
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
              onInit={(_evt, editor) => (editorRef.current = editor)}
              initialValue={initialDescription}
              init={{
                height: 800,
                plugins: [
                  "anchor",
                  "autolink",
                  "charmap",
                  "codesample",
                  "emoticons",
                  "link",
                  "lists",
                  "media",
                  "searchreplace",
                  "table",
                  "visualblocks",
                  "wordcount",
                  "checklist",
                  "mediaembed",
                  "casechange",
                  "formatpainter",
                  "pageembed",
                  "a11ychecker",
                  "tinymcespellchecker",
                  "permanentpen",
                  "powerpaste",
                  "advtable",
                  "advcode",
                  "advtemplate",
                  "ai",
                  "uploadcare",
                  "mentions",
                  "tinycomments",
                  "tableofcontents",
                  "footnotes",
                  "mergetags",
                  "autocorrect",
                  "typography",
                  "inlinecss",
                  "markdown",
                  "importword",
                  "exportword",
                  "exportpdf",
                ],
                toolbar:
                  "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                tinycomments_mode: "embedded",
                tinycomments_author: "Author name",
                mergetags_list: [
                  { value: "First.Name", title: "First Name" },
                  { value: "Email", title: "Email" },
                ],
                ai_request: (request, respondWith) =>
                  respondWith.string(() =>
                    Promise.reject("See docs to implement AI Assistant")
                  ),
                uploadcare_public_key: "1896a96d7f97b7c05b52",
                setup: (editor) => {
                  editor.on("Change KeyUp Undo Redo", scheduleAutosave);
                },
              }}
            />
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={handleManualSave}
                  disabled={saving}
                  className={`px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center gap-2 ${
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
                      Save Now
                    </>
                  )}
                </button>
                
                {/* Status Messages */}
                <div className="flex-1 flex items-center gap-4">
                  {saving ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 border-2 border-blue-200">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="font-medium">Saving...</span>
                    </div>
                  ) : lastSavedAt ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 text-green-700 border-2 border-green-200">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Saved at {lastSavedAt.toLocaleTimeString()}</span>
                    </div>
                  ) : null}
                  {saveError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 border-2 border-red-200">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">{saveError}</span>
                    </div>
                  )}
                  <button
                    onClick={log}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                  >
                    Log HTML
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseMoneyEditor;
