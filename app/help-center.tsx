import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../constants/Typography";
import { useTheme } from "../hooks/useTheme";

export default function HelpCenterScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const faqs = [
    {
      question: "How to manage new bookings?",
      answer: "Go to the Bookings tab. New bookings will appear at the top. Click on any booking to see details and process check-in."
    },
    {
      question: "How to process room check-out?",
      answer: "Locate the active booking in the Bookings tab, click on it, and scroll to the bottom to find the Check-Out button. Ensure all payments are settled."
    },
    {
      question: "Can I cancel a confirmed booking?",
      answer: "Yes, you can cancel a booking from the booking details page. Please note that cancellation policies may apply depending on the hotel rules."
    },
    {
      question: "Where can I see today's revenue?",
      answer: "The Dashboard (Home) provides a summary of today's total bookings and revenue at the top of the page."
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-6 pt-4 mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary dark:text-white`}>
          Help Center
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        <View className="bg-accent/10 p-6 rounded-[30px] mb-8 border border-accent/20">
          <Text className="text-accent font-bold text-lg mb-2">Need direct support?</Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-4">
            Our technical team is available 24/7 to assist you with any system issues.
          </Text>
          <TouchableOpacity 
            onPress={() => Linking.openURL('mailto:support@ashfordhotel.com')}
            className="bg-accent py-3 rounded-2xl items-center"
          >
            <Text className="text-primary font-bold">Contact Support</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-400 font-bold text-xs tracking-widest mb-4">FREQUENTLY ASKED QUESTIONS</Text>
        
        {faqs.map((faq, index) => (
          <View key={index} className="mb-6 bg-gray-50 dark:bg-surface-dark p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
            <Text className="text-primary dark:text-white font-bold text-base mb-2">{faq.question}</Text>
            <Text className="text-gray-500 dark:text-gray-400 leading-5">{faq.answer}</Text>
          </View>
        ))}

        <View className="mt-4 mb-10 items-center">
          <Text className="text-gray-400 text-xs">Ashford Hotel Management System v1.0.2</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
