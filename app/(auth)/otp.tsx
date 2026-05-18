import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";
import { ENDPOINTS } from "../../constants/Api";

export default function OTPScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length !== 0 && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 4) {
      Alert.alert("Error", "Please enter the full 4-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.ADMIN_VERIFY_OTP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            email: email,
            otp: otpCode 
        }),
      });

      const data = await response.json();

      if (data.status === "success" || data.status === "ok") {
        router.push({
            pathname: "/(auth)/reset-password",
            params: { email, otp: otpCode }
        });
      } else {
        Alert.alert("Failed", data.message || "Invalid OTP code");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      {/* Top Navigation Row */}
      <View className="px-6 pt-2">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mt-4 w-10 h-10 items-center justify-center bg-gray-100 dark:bg-surface-dark rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#c5a059" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 60 }}
        className="px-6"
      >
        <View className="mb-10 items-center">
          <Image
            source={require("../../assets/images/T.png")}
            style={{ width: 220, height: 88, marginBottom: 24 }}
            resizeMode="contain"
          />
          <Text className={`${Typography.h1} text-primary dark:text-white text-center`}>Verification</Text>
          <Text className="text-gray-500 mt-2 text-center px-4">
            Enter the 4-digit code sent to {email || "your email"}.
          </Text>
        </View>

        <View className="flex-row justify-center mb-10">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              className="w-16 h-16 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl text-center text-2xl font-bold text-primary dark:text-white mx-1.5"
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            />
          ))}
        </View>

        <Button 
          title={loading ? "Verifying..." : "Verify Code"} 
          onPress={handleVerifyOTP} 
          disabled={loading}
        />

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500">Didn't receive the code? </Text>
          <TouchableOpacity>
            <Text className="text-accent font-bold">Resend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
