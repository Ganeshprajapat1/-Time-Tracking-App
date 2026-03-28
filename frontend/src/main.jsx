import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import "./styles.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {clientId ? (
            <GoogleOAuthProvider clientId={clientId}>
              <App />
            </GoogleOAuthProvider>
          ) : (
            <App />
          )}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")).render(tree);
