import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";

interface DashboardHeaderProps {
  userName: string;
  avatarUri?: string;
}

export const DashboardHeader = ({ userName, avatarUri }: DashboardHeaderProps) => {
  const { colors } = useTheme();
  const router = useRouter();

  // Smart fallback for avatar
  const displayAvatar = (avatarUri && avatarUri.includes('/') && !avatarUri.endsWith('/')) 
    ? avatarUri 
    : `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=c5a059&color=fff&size=128`;

  return (
    <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
      <View>
        <Text className="text-gray-500 font-medium">Welcome back,</Text>
        <Text className={`${Typography.h3} text-primary dark:text-white`}>{userName}</Text>
      </View>
      
      <View className="flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.push("/notifications")}
          className="mr-4 p-2 bg-gray-50 dark:bg-surface-dark rounded-full"
        >
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image
            source={{ uri: displayAvatar }}
            className="w-12 h-12 rounded-full border-2 border-accent"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
