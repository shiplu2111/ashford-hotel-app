import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SettingsItem } from "../../components/settings/SettingsItem";
import { Typography } from "../../constants/Typography";
import { useThemeStore } from "../../store/useThemeStore";
import { useTheme } from "../../hooks/useTheme";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const { isDark } = useTheme();

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
            source={{ uri: "https://i.pravatar.cc/150?u=ashford" }}
            className="w-16 h-16 rounded-2xl border-2 border-accent"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white font-bold text-lg">Alexander Ashford</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-accent/20 px-2 py-0.5 rounded-md border border-accent/30">
                <Text className="text-accent text-[10px] font-bold">GENERAL MANAGER</Text>
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
            onPress={() => {}} 
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
          <SettingsItem 
            label="Language" 
            icon="globe-outline" 
            type="value"
            valueText="English (US)"
            onPress={() => {}} 
          />
        </View>

        <View className="mb-10">
          <Text className="text-gray-400 font-bold text-xs tracking-widest mb-4">SUPPORT</Text>
          <SettingsItem label="Help Center" icon="help-circle-outline" onPress={() => {}} />
          <SettingsItem label="About System" icon="information-circle-outline" onPress={() => {}} />
          
          <TouchableOpacity 
            className="flex-row items-center py-6 mt-4"
            onPress={() => router.replace("/(auth)/welcome")}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className="text-red-500 font-bold text-base ml-4">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
