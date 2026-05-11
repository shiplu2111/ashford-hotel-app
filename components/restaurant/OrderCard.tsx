import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBadge, OrderStatus } from "./SharedRestaurant";
import { Typography } from "../../constants/Typography";

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  tableNumber: string;
  items: OrderItem[];
  time: string;
  total: string;
  status: OrderStatus;
}

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

export const OrderCard = ({ order, onPress }: OrderCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(order)}
      className="bg-white dark:bg-surface-dark p-5 rounded-3xl mx-6 mb-4 shadow-sm border border-gray-50 dark:border-gray-800"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-gray-400 text-xs font-bold tracking-widest mb-1">ORDER #{order.id}</Text>
          <Text className={`${Typography.h4} text-primary dark:text-white`}>{order.customerName}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="restaurant-outline" size={14} color="#c5a059" />
            <Text className="text-accent text-sm font-bold ml-1">Table {order.tableNumber}</Text>
          </View>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View className="border-t border-gray-50 dark:border-gray-800 pt-4 mb-4">
        {order.items.map((item, idx) => (
          <View key={idx} className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-500 text-sm">
              {item.quantity}x {item.name}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={15} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm ml-1">{order.time}</Text>
        </View>
        <Text className="text-primary dark:text-white font-bold text-lg">{order.total}</Text>
      </View>
    </TouchableOpacity>
  );
};
