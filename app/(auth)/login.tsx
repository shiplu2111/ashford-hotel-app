import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Typography } from "../../constants/Typography";

export default function LoginScreen() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false} className="px-6 mt-2">
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
          <Text className={`${Typography.h1} text-primary dark:text-white`}>Welcome Back</Text>
          <Text className="text-gray-500 mt-2">Sign in to continue your journey</Text>
        </View>

        <View>
          <Input
            label="Email Address"
            placeholder="example@mail.com"
            icon="mail-outline"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            icon="lock-closed-outline"
            isPassword
          />

          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity 
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center"
            >
              <View className={`w-5 h-5 rounded border ${rememberMe ? 'bg-accent border-accent' : 'border-gray-300'} items-center justify-center mr-2`}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text className="text-gray-600 dark:text-gray-400">Remember me</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
              <Text className="text-accent font-semibold">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button title="Login" onPress={() => router.replace("/(tabs)")} />
        </View>

        <View className="flex-row items-center my-8">
          <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
          <Text className="mx-4 text-gray-400">Or continue with</Text>
          <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
        </View>

        <View className="flex-row justify-between mb-10">
          <TouchableOpacity className="flex-1 h-14 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl flex-row items-center justify-center mr-4">
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text className="ml-2 font-semibold dark:text-white">Google</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 h-14 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl flex-row items-center justify-center">
            <Ionicons name="logo-apple" size={24} color="#000" />
            <Text className="ml-2 font-semibold dark:text-white">Apple</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
