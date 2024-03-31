import { THEME_TYPE } from "../THEME_TYPE";

export function toggleTheme(theme, setTheme) {
  if (theme === THEME_TYPE.DARK_THEME) setTheme(THEME_TYPE.LIGHT_THEME);
  else setTheme(THEME_TYPE.DARK_THEME);
}
