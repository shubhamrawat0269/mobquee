import { useEffect, useState } from "react";
import { THEME_TYPE } from "../utils/THEME_TYPE";

const useToSetTheme = () => {
  const [theme, setTheme] = useState("light-theme");

  useEffect(() => {
    const themeType = JSON.parse(localStorage.getItem("theme"));
    if (theme === THEME_TYPE.LIGHT_THEME) setTheme(themeType);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);

  return { theme, setTheme };
};

export default useToSetTheme;
