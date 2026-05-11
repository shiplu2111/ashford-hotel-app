import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { useThemeStore } from "../store/useThemeStore";

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const { theme: storeTheme } = useThemeStore();

  const theme = storeTheme === "system" ? systemColorScheme ?? "light" : storeTheme;
  const colors = Colors[theme];
  const isDark = theme === "dark";

  return { theme, colors, isDark };
};
