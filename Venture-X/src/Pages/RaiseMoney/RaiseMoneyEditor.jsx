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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const toggleSidebar = () => setIsSidebarOpen((o) => !o);

  const log = () => {
    if (editorRef.current) console.log(editorRef.current.getContent());
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
              <p className="text-sm text-gray-500 mt-1">Campaign Editor</p>
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
          <div className="bg-white rounded-lg shadow-sm p-8 min-h-[50vh]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Editor
            </h2>
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
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {saving ? (
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Saving...
                </span>
              ) : lastSavedAt ? (
                <span>Saved {lastSavedAt.toLocaleTimeString()}</span>
              ) : (
                <span>Loaded</span>
              )}
              {saveError && <span className="text-red-500">{saveError}</span>}
              <button
                onClick={handleManualSave}
                disabled={saving}
                className={`px-2 py-1 rounded ${
                  saving ? "bg-slate-300" : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                Save Now
              </button>
              <button
                onClick={log}
                className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                Log HTML
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseMoneyEditor;
