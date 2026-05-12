import React, { useState, useCallback, useEffect } from "react";
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
  customerPhone?: string;
  invoiceNumber?: string;
  tableNumber: string;
  items: OrderItem[];
  time: string;
  billingDate?: string;
  total: string;
  status: OrderStatus;
  subtotal?: string;
  vat?: string;
  serviceCharge?: string;
  discount?: string;
  billingAddress?: string;
  customerPaid?: string;
  changeDue?: string;
  timeAgo?: string;
}

// Reusable real-time "Time Ago" component
export const TimeAgoText = ({ date, time, style }: { date: string; time: string; style?: string }) => {
    const [timeAgo, setTimeAgo] = useState("");

    const calculateTimeAgo = useCallback(() => {
        try {
            if (!date || !time) return "---";
            const orderDateTime = new Date(`${date}T${time}`);
            const now = new Date();
            const diff = now.getTime() - orderDateTime.getTime();
            
            const seconds = Math.floor(Math.abs(diff) / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            const dS = seconds % 60;
            const dM = minutes % 60;
            const dH = hours % 24;
            
            if (days > 0) {
                return `${days}d ${dH}h ${dM}m ago`;
            }
            if (hours > 0) {
                return `${hours}h ${dM}m ${dS}s ago`;
            }
            return `${dM}:${dS.toString().padStart(2, '0')} sec ago`;
        } catch (e) {
            return "---";
        }
    }, [date, time]);

    useEffect(() => {
        setTimeAgo(calculateTimeAgo());
        const timer = setInterval(() => {
            setTimeAgo(calculateTimeAgo());
        }, 1000);
        return () => clearInterval(timer);
    }, [calculateTimeAgo]);

    return <Text className={style}>{timeAgo}</Text>;
};

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
        {order.items.length > 0 ? (
            order.items.map((item, idx) => (
                <View key={idx} className="flex-row justify-between items-center mb-1">
                  <Text className="text-gray-500 text-sm">
                    {item.quantity}x {item.name}
                  </Text>
                </View>
              ))
        ) : (
            <Text className="text-gray-400 text-xs italic">Tap to view items</Text>
        )}
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={15} color="#9CA3AF" />
          <TimeAgoText 
            date={order.billingDate || ""} 
            time={order.time} 
            style="text-gray-400 text-sm ml-1" 
          />
        </View>
        <Text className="text-primary dark:text-white font-bold text-lg">{order.total}</Text>
      </View>
    </TouchableOpacity>
  );
};
