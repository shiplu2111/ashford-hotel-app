import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Typography } from "../../constants/Typography";
import { ENDPOINTS } from "../../constants/Api";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.ADMIN_RESET_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (data.status === "success" || data.status === "ok") {
        Alert.alert("Success", "Your password has been reset successfully. Please login with your new password.");
        router.replace("/(auth)/login");
      } else {
        Alert.alert("Error", data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView className="px-6 mt-2" showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mt-4 w-10 h-10 items-center justify-center bg-gray-100 dark:bg-surface-dark rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#c5a059" />
        </TouchableOpacity>

        <View className="mt-8 mb-10">
          <Image
            source={require("../../assets/images/T.png")}
            style={{ width: 150, height: 50, marginBottom: 20 }}
            resizeMode="contain"
          />
          <Text className={`${Typography.h1} text-primary dark:text-white`}>Reset Password</Text>
          <Text className="text-gray-500 mt-2">
            Create a new strong password for your account.
          </Text>
        </View>

        <Input
          label="New Password"
          placeholder="Enter new password"
          icon="lock-closed-outline"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter new password"
          icon="lock-closed-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button 
          title={loading ? "Resetting..." : "Reset Password"} 
          onPress={handleResetPassword} 
          disabled={loading}
          className="mt-6 mb-10"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
