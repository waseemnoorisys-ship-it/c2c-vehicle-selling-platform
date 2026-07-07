import { useEffect } from "react";
import useThemeStore from "../../store/useThemeStore";

const THEME_COLORS = {
  dark: "#050707",
  light: "#F4F7F7",
};

export default function ThemeProvider({ children }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = THEME_COLORS[theme];
  }, [theme]);

  return children;
}
