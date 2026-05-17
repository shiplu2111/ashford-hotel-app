import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Typography } from "../constants/Typography";
import { Button } from "../components/ui/Button";
import { useTheme } from "../hooks/useTheme";
import { ENDPOINTS } from "../constants/Api";
import { Input } from "../components/ui/Input";

export default function SecurityScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const response = await fetch(ENDPOINTS.ADMIN_UPDATE_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          current_password: passwords.current,
          new_password: passwords.new
        })
      });

      const result = await response.json();
      if (result.status === "success") {
        Alert.alert("Success", "Password updated successfully");
        router.back();
      } else {
        Alert.alert("Error", result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Update Password Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-6 pt-4 mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary dark:text-white`}>
          Security & Password
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        <View className="mt-4 mb-8">
          <Text className="text-gray-500 leading-6">
            Ensure your account is secure by using a strong password. You will need your current password to set a new one.
          </Text>
        </View>

        <View className="space-y-4">
          <View className="mb-4">
            <Text className="text-gray-400 text-xs mb-1.5 ml-1 uppercase font-bold tracking-widest">Current Password</Text>
            <View className="bg-gray-50 dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
               <Input
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChangeText={(v) => setPasswords(p => ({...p, current: v}))}
                  secureTextEntry
                  className="h-14"
               />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400 text-xs mb-1.5 ml-1 uppercase font-bold tracking-widest">New Password</Text>
            <View className="bg-gray-50 dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
               <Input
                  placeholder="Enter new password"
                  value={passwords.new}
                  onChangeText={(v) => setPasswords(p => ({...p, new: v}))}
                  secureTextEntry
                  className="h-14"
               />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-gray-400 text-xs mb-1.5 ml-1 uppercase font-bold tracking-widest">Confirm New Password</Text>
            <View className="bg-gray-50 dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800">
               <Input
                  placeholder="Confirm new password"
                  value={passwords.confirm}
                  onChangeText={(v) => setPasswords(p => ({...p, confirm: v}))}
                  secureTextEntry
                  className="h-14"
               />
            </View>
          </View>
        </View>

        <Button
          title={loading ? "Updating..." : "Update Password"}
          onPress={handleUpdatePassword}
          disabled={loading}
          className="mt-4"
        />
        
        {loading && (
          <ActivityIndicator className="mt-4" color={colors.accent} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
