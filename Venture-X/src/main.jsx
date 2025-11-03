import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./lib/AuthContext.jsx";
import { StreamChatProvider } from "./lib/StreamChatContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <StreamChatProvider>
        <App />
      </StreamChatProvider>
    </AuthProvider>
  </StrictMode>
);
