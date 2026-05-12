import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ENDPOINTS } from "../../constants/Api";
import { Typography } from "../../constants/Typography";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@cmsnagro.com.au");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(false); // Reset loading state if needed
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(ENDPOINTS.ADMIN_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Non-JSON response:", responseText);
        Alert.alert("Server Error", "The server returned an invalid response.");
        setLoading(false);
        return;
      }

      if (data.status === "success" || data.status === "ok") {
        if (data.user) {
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
        }
        Alert.alert(
          "Success",
          `Welcome back, ${data.user?.fullname || "Admin"}!`,
        );
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === "AbortError") {
        Alert.alert(
          "Timeout",
          "The server is taking too long to respond. Please check your connection.",
        );
      } else {
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your API URL and internet.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          <Text className={`${Typography.h1} text-primary dark:text-white`}>
            Welcome Back
          </Text>
          <Text className="text-gray-500 mt-2">
            Sign in to continue your journey
          </Text>
        </View>

        <View>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              className="flex-row items-center"
            >
              <View
                className={`w-5 h-5 rounded border ${rememberMe ? "bg-accent border-accent" : "border-gray-300"} items-center justify-center mr-2`}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="text-gray-600 dark:text-gray-400">
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text className="text-accent font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={loading ? "Verifying..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
