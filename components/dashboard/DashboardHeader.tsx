import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";

interface DashboardHeaderProps {
  userName: string;
  avatarUri?: string;
}

export const DashboardHeader = ({ userName, avatarUri }: DashboardHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
      <View>
        <Text className="text-gray-500 font-medium">Welcome back,</Text>
        <Text className={`${Typography.h3} text-primary dark:text-white`}>{userName}</Text>
      </View>
      
      <View className="flex-row items-center">
        <TouchableOpacity className="mr-4 p-2 bg-gray-50 dark:bg-surface-dark rounded-full">
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={{ uri: avatarUri || "https://i.pravatar.cc/150?u=ashford" }}
            className="w-12 h-12 rounded-full border-2 border-accent"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
