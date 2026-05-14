import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../../constants/Typography";

export const SectionHeader = ({ 
  title, 
  actionLabel, 
  onAction 
}: { 
  title: string; 
  actionLabel?: string; 
  onAction?: () => void; 
}) => (
  <View className="flex-row justify-between items-center px-6 mt-6 mb-3">
    <Text className={`${Typography.h4} text-primary dark:text-white`}>{title}</Text>
    {actionLabel && (
      <TouchableOpacity onPress={onAction}>
        <Text className="text-accent font-semibold">{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const ActivityCard = ({ 
  title, 
  subtitle, 
  time, 
  icon, 
  color,
  onPress 
}: { 
  title: string; 
  subtitle: string; 
  time: string; 
  icon: keyof typeof Ionicons.glyphMap; 
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    className="flex-row items-center bg-white dark:bg-surface-dark px-4 py-3 rounded-2xl mb-2 mx-6 border border-gray-100 dark:border-gray-800"
  >
    <View className="p-2 rounded-xl mr-4" style={{ backgroundColor: `${color}15` }}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View className="flex-1">
      <Text className="text-primary dark:text-white font-semibold text-sm">{title}</Text>
      <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>
    </View>
    <Text className="text-gray-400 text-[10px] font-medium">{time}</Text>
  </TouchableOpacity>
);
