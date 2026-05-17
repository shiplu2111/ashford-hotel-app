import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../../constants/Typography";

interface RevenueCardProps {
  amount: string;
  percentage: string;
  isUp: boolean;
}

export const RevenueCard = ({ amount, percentage, isUp }: RevenueCardProps) => {
  return (
    <View className="px-6 my-4">
      <View className="p-6 rounded-3xl bg-[#1a1f2c] shadow-lg">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-400 font-medium">Total Revenue</Text>
          <View className="p-2 bg-white/10 rounded-xl">
            <Ionicons name="wallet-outline" size={20} color="#c5a059" />
          </View>
        </View>
        
        <Text className="text-white text-3xl font-bold mb-2">{amount}</Text>
        
        <View className="flex-row items-center">
          <View className={`flex-row items-center px-2 py-1 rounded-lg ${isUp ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <Ionicons name={isUp ? "trending-up" : "trending-down"} size={16} color={isUp ? "#4ade80" : "#f87171"} />
            <Text className={`ml-1 text-xs font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {percentage}
            </Text>
          </View>
          <Text className="text-gray-400 text-xs ml-2">Total Accumulated</Text>
        </View>
      </View>
    </View>
  );
};
