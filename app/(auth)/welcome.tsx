import React from "react";
import { View, Text, Image, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View className="flex-1 px-6 justify-between pb-10">
        <View className="items-center mt-20">
          <Image
            source={require("../../assets/images/T.png")}
            style={{ width: 280, height: 100 }}
            resizeMode="contain"
          />
          <Text className={`${Typography.h3} text-gray-500 mt-4 text-center px-4`}>
            Experience world-class hospitality and luxury at your fingertips.
          </Text>
        </View>

        <View>
          <Button
            title="Log In"
            onPress={() => router.push("/(auth)/login")}
            className="mb-6"
          />
          <Button
            title="Create Account"
            variant="outline"
            onPress={() => {}} // Placeholder
          />
          
          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-gray-500">Already a member? </Text>
            <Text className="text-accent font-bold">Sign In</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
