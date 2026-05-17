import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SettingsItem } from "../../components/settings/SettingsItem";
import { Typography } from "../../constants/Typography";
import { useThemeStore } from "../../store/useThemeStore";
import { useTheme } from "../../hooks/useTheme";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const { isDark } = useTheme();

  const [userName, setUserName] = useState("Admin Ashford");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.fullname || "Admin Ashford");
        setAvatarUri(user.image);
      }
    } catch (e) {
      console.error("Load Settings User Error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const displayAvatar = (avatarUri && avatarUri.includes('/') && !avatarUri.endsWith('/')) 
    ? avatarUri 
    : `https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=c5a059&color=fff&size=128`;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="px-6 pt-4 mb-4">
        <Text className={`${Typography.h3} text-primary dark:text-white`}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        {/* Profile Card */}
        <TouchableOpacity 
          onPress={() => router.push("/profile")}
          className="flex-row items-center p-5 bg-primary dark:bg-surface-dark rounded-[30px] mb-8"
        >
          <Image
            source={{ uri: displayAvatar }}
            className="w-16 h-16 rounded-2xl border-2 border-accent"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white font-bold text-lg">{userName}</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-accent/20 px-2 py-0.5 rounded-md border border-accent/30">
                <Text className="text-accent text-[10px] font-bold">ADMINISTRATOR</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#c5a059" />
        </TouchableOpacity>

        <View className="mb-6">
          <Text className="text-gray-400 font-bold text-xs tracking-widest mb-4">ACCOUNT SETTINGS</Text>
          <SettingsItem 
            label="Personal Information" 
            icon="person-outline" 
            onPress={() => router.push("/profile")} 
          />
          <SettingsItem 
            label="Security & Password" 
            icon="lock-closed-outline" 
            onPress={() => router.push("/security")} 
          />
          <SettingsItem 
            label="Notification Settings" 
            icon="notifications-outline" 
            type="switch"
            value={true}
            onValueChange={() => {}}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-400 font-bold text-xs tracking-widest mb-4">PREFERENCES</Text>
          <SettingsItem 
            label="Dark Mode" 
            icon="moon-outline" 
            type="switch"
            value={isDark}
            onValueChange={(val) => setTheme(val ? "dark" : "light")}
          />
        </View>

        <View className="mb-10">
          <Text className="text-gray-400 font-bold text-xs tracking-widest mb-4">SUPPORT</Text>
          <SettingsItem 
            label="Help Center" 
            icon="help-circle-outline" 
            onPress={() => router.push("/help-center")} 
          />
          <SettingsItem 
            label="About System" 
            icon="information-circle-outline" 
            onPress={() => router.push("/about")} 
          />
          
          <TouchableOpacity 
            className="flex-row items-center py-6 mt-4"
            onPress={async () => {
              await AsyncStorage.removeItem("user");
              router.replace("/(auth)/login");
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className="text-red-500 font-bold text-base ml-4">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

