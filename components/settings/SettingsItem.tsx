import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

interface SettingsItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  type?: "link" | "switch" | "value";
  valueText?: string;
  color?: string;
}

export const SettingsItem = ({
  label,
  icon,
  onPress,
  value,
  onValueChange,
  type = "link",
  valueText,
  color,
}: SettingsItemProps) => {
  const { isDark, colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={type === "switch"}
      className="flex-row items-center justify-between py-4 border-b border-gray-50 dark:border-gray-800"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 items-center justify-center mr-4">
          <Ionicons name={icon} size={20} color={color || (isDark ? "#c5a059" : "#1a1f2c")} />
        </View>
        <Text className="text-primary dark:text-white font-semibold text-base">{label}</Text>
      </View>

      <View className="flex-row items-center">
        {type === "value" && (
          <Text className="text-gray-400 mr-2 text-sm">{valueText}</Text>
        )}
        {type === "switch" ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: "#E5E7EB", true: colors.accent }}
            thumbColor="#fff"
          />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );
};
