import { useEffect, useState } from "react";

const useToSetTheme = () => {
  const [theme, setTheme] = useState("light-theme");

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);

  return { theme, setTheme };
};

export default useToSetTheme;
