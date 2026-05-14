import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../constants/Typography";
import { useTheme } from "../hooks/useTheme";

export default function AboutScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-6 pt-4 mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#1a1f2c"}
          />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary dark:text-white`}>
          About System
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        <View className="items-center mt-8 mb-10">
          <View className="bg-primary p-6 rounded-[40px] mb-4 shadow-xl shadow-primary/20">
            <Ionicons name="business" size={60} color="#c5a059" />
          </View>
          <Text className={`${Typography.h2} text-primary dark:text-white`}>
            Ashford Hotel
          </Text>
          <Text className="text-accent font-bold tracking-widest mt-1">
            MANAGEMENT SYSTEM
          </Text>
          <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full mt-4">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">
              Version 1.0.2 (Build 20260514)
            </Text>
          </View>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-gray-400 font-bold text-xs tracking-widest mb-3 uppercase">
              Application Overview
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 leading-6 text-base">
              The Ashford Hotel Management System is a premium, end-to-end
              solution designed specifically for luxury hospitality management.
              This mobile application empowers administrators to manage
              bookings, room statuses, and restaurant orders in real-time.
            </Text>
          </View>

          <View>
            <Text className="text-gray-400 font-bold text-xs tracking-widest mb-3 uppercase">
              Key Features
            </Text>
            <View className="space-y-3">
              {[
                "Real-time Booking Management",
                "Mobile POS Invoice Generation",
                "Integrated Payment Processing",
                "Dynamic Operational Dashboard",
                "Admin Profile & Security Controls",
              ].map((feature, i) => (
                <View key={i} className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={18} color="#c5a059" />
                  <Text className="text-primary dark:text-white ml-3 font-medium">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-gray-50 dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 mt-4">
            <Text className="text-primary dark:text-white font-bold mb-2">
              Designed for Excellence
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm leading-5">
              Developed by the Ashford Digital Team. All rights reserved. &copy;
              2026 Ashford Hotel & Resorts.
            </Text>
          </View>
        </View>

        <View className="mt-10 mb-10 items-center">
          <Text className="text-gray-400 text-xs">Developed by CMSN</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
