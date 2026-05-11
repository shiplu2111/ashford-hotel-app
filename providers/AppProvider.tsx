import { ReactNode, useEffect } from "react";
import { View } from "react-native";
import { useThemeStore } from "../store/useThemeStore";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const { theme } = useThemeStore();
  const { setColorScheme } = useNativeWindColorScheme();

  useEffect(() => {
    if (theme === "system") {
      setColorScheme("system");
    } else {
      setColorScheme(theme);
    }
  }, [theme]);

  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};
