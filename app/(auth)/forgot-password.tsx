import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Typography } from "../../constants/Typography";

export default function ForgotPasswordScreen() {
  const router = useRouter();

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
            Enter your email address and we'll send you an OTP to reset your password.
          </Text>
        </View>

        <Input
          label="Email Address"
          placeholder="example@mail.com"
          icon="mail-outline"
          keyboardType="email-address"
        />

        <Button 
          title="Send OTP" 
          onPress={() => router.push("/(auth)/otp")} 
          className="mt-6"
        />
      </View>
    </SafeAreaView>
  );
}
