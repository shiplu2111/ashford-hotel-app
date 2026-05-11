import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";

export type OrderStatus = "Pending" | "Preparing" | "Completed" | "Cancelled";

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const getStyles = () => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      case "Preparing":
        return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" };
      case "Completed":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "Cancelled":
        return { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
    }
  };

  const styles = getStyles();

  return (
    <View
      className={`flex-row items-center px-2.5 py-1 rounded-full ${styles.bg}`}
    >
      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${styles.dot}`} />
      <Text className={`text-[10px] font-bold ${styles.text}`}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

export const SearchInput = ({ value, onChangeText, placeholder }: any) => {
  const { isDark } = useTheme();
  return (
    <View className="flex-row items-center bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl px-4 h-12 mx-6 mt-2 mb-1">
      <Ionicons
        name="search"
        size={20}
        color={isDark ? "#4B5563" : "#9CA3AF"}
      />
      <TextInput
        className="flex-1 ml-2 text-primary dark:text-white"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
      />
    </View>
  );
};

export const FilterTabs = ({ tabs, activeTab, onTabPress }: any) => (
  <View style={{ height: 44 }} className="mb-2">
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4"
      contentContainerStyle={{ alignItems: "center", paddingRight: 16 }}
    >
      {tabs.map((tab: string) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabPress(tab)}
          className={`px-5 py-2 rounded-full mr-2 ${
            activeTab === tab ? "bg-accent" : "bg-gray-100 dark:bg-surface-dark"
          }`}
        >
          <Text
            className={`font-semibold text-sm ${activeTab === tab ? "text-white" : "text-gray-500"}`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);
