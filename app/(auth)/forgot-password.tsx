import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Typography } from "../../constants/Typography";
import { ENDPOINTS } from "../../constants/Api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.ADMIN_FORGOT_PASSWORD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.status === "success" || data.status === "ok") {
        Alert.alert("OTP Sent", "A 4-digit verification code has been sent to your email.");
        router.push({
          pathname: "/(auth)/otp",
          params: { email }
        });
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
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
      <View className="px-6 mt-2">
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
          <Text className={`${Typography.h1} text-primary dark:text-white`}>Forgot Password</Text>
          <Text className="text-gray-500 mt-2">
            Enter your email address to receive a 4-digit verification code.
          </Text>
        </View>

        <Input
          label="Email Address"
          placeholder="example@mail.com"
          icon="mail-outline"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Button 
          title={loading ? "Sending..." : "Send OTP"} 
          onPress={handleSendOTP} 
          disabled={loading}
          className="mt-6"
        />
      </View>
    </SafeAreaView>
  );
}
