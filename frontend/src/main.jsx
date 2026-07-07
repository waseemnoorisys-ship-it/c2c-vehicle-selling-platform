import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import ThemeProvider from "./components/theme/ThemeProvider";
import useThemeStore from "./store/useThemeStore";
import "./index.css";
import "./i18n/i18n";

function ThemedToaster() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? "#121818" : "#ffffff",
          color: isDark ? "#f5f7f7" : "#0b0f0f",
          border: `1px solid ${isDark ? "#233232" : "#e5ecec"}`,
        },
        success: {
          iconTheme: {
            primary: "#7ee6c8",
            secondary: isDark ? "#121818" : "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: isDark ? "#121818" : "#ffffff",
          },
        },
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <ThemedToaster />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
