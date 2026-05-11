import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

interface StatsCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const StatsCard = ({ label, value, icon, color }: StatsCardProps) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 m-1">
      <View className="p-2 rounded-xl mb-3" style={{ backgroundColor: `${color}15` }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-gray-500 text-xs mb-1 font-medium">{label}</Text>
      <Text className="text-primary dark:text-white text-lg font-bold">{value}</Text>
    </View>
  );
};
