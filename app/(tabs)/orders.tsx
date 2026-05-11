import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import {
  SearchInput,
  FilterTabs,
} from "../../components/restaurant/SharedRestaurant";
import { OrderCard, Order } from "../../components/restaurant/OrderCard";
import { StatusBadge } from "../../components/restaurant/SharedRestaurant";
import { Typography } from "../../constants/Typography";
import { Button } from "../../components/ui/Button";
import { useTheme } from "../../hooks/useTheme";

const MOCK_ORDERS: Order[] = [
  {
    id: "2401",
    customerName: "James Wilson",
    tableNumber: "14",
    items: [
      { name: "Truffle Pasta", quantity: 2 },
      { name: "Red Wine", quantity: 1 },
      { name: "Caesar Salad", quantity: 2 },
    ],
    time: "10m ago",
    total: "$145.00",
    status: "Preparing",
  },
  {
    id: "2402",
    customerName: "Sarah Connor",
    tableNumber: "08",
    items: [
      { name: "Grilled Salmon", quantity: 1 },
      { name: "Greek Salad", quantity: 1 },
    ],
    time: "2m ago",
    total: "$82.00",
    status: "Pending",
  },
  {
    id: "2405",
    customerName: "Michael Scott",
    tableNumber: "03",
    items: [{ name: "Pepperoni Pizza", quantity: 2 }],
    time: "Just now",
    total: "$42.00",
    status: "Pending",
  },
  {
    id: "2403",
    customerName: "Robert Fox",
    tableNumber: "22",
    items: [{ name: "Margherita Pizza", quantity: 3 }],
    time: "15m ago",
    total: "$64.00",
    status: "Completed",
  },
  {
    id: "2406",
    customerName: "Emily Chen",
    tableNumber: "06",
    items: [
      { name: "Beef Steak", quantity: 2 },
      { name: "Mocktail", quantity: 2 },
      { name: "Cheesecake", quantity: 2 },
    ],
    time: "25m ago",
    total: "$198.00",
    status: "Preparing",
  },
];

const ITEM_PRICES: Record<string, number> = {
  "Truffle Pasta": 38,
  "Red Wine": 32,
  "Caesar Salad": 18,
  "Grilled Salmon": 45,
  "Greek Salad": 14,
  "Pepperoni Pizza": 21,
  "Margherita Pizza": 21,
  "Beef Steak": 65,
  Mocktail: 14,
  Cheesecake: 14,
};

export default function OrdersTab() {
  const { isDark, colors } = useTheme();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["45%", "90%"];

  const tabs = ["All", "Pending", "Preparing", "Completed", "Cancelled"];

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.id.includes(search);
    const matchesTab = activeTab === "All" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleOpenSheet = useCallback((order: Order) => {
    setSelectedOrder(order);
    sheetRef.current?.snapToIndex(0);
  }, []);

  const handleCloseSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const itemTotal = (order: Order) =>
    order.items.reduce((sum, item) => {
      const price = ITEM_PRICES[item.name] ?? 0;
      return sum + price * item.quantity;
    }, 0);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white dark:bg-background-dark">
      {/* Header */}
      <View className="px-5 pt-3 mb-1">
        <Text className={`${Typography.h3} text-primary dark:text-white`}>
          Live Orders
        </Text>
      </View>

      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search Order ID..."
      />

      <FilterTabs tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleOpenSheet} />
        )}
        ListEmptyComponent={() => (
          <View className="items-start px-6 mt-4">
            <Text className="text-gray-400">No orders found.</Text>
          </View>
        )}
      />

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#4B5563" : "#D1D5DB",
          width: 48,
        }}
        backgroundStyle={{
          backgroundColor: isDark ? "#1e2530" : "#ffffff",
          borderRadius: 32,
        }}
      >
        {selectedOrder && (
          <BottomSheetScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
          >
            {/* Handle bar area / top header */}
            <View className="flex-row justify-between items-center mb-5 mt-2">
              <View>
                <Text className="text-gray-400 text-xs font-bold tracking-widest">
                  ORDER #{selectedOrder.id}
                </Text>
                <Text className="text-primary dark:text-white text-2xl font-bold mt-1">
                  {selectedOrder.customerName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="restaurant-outline" size={13} color="#c5a059" />
                  <Text className="text-accent text-sm font-bold ml-1">
                    Table {selectedOrder.tableNumber}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <StatusBadge status={selectedOrder.status} />
                <View className="flex-row items-center mt-2">
                  <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs ml-1">
                    {selectedOrder.time}
                  </Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-100 dark:bg-gray-800 mb-5" />

            {/* Order Items */}
            <Text className="text-gray-400 text-xs font-bold tracking-widest mb-4">
              ORDER ITEMS
            </Text>
            {selectedOrder.items.map((item, idx) => {
              const price = ITEM_PRICES[item.name] ?? 0;
              return (
                <View
                  key={idx}
                  className="flex-row justify-between items-center mb-3 bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 bg-accent/10 rounded-xl items-center justify-center mr-3">
                      <Text className="text-accent font-bold text-sm">
                        {item.quantity}x
                      </Text>
                    </View>
                    <Text className="text-primary dark:text-white font-medium text-base flex-1">
                      {item.name}
                    </Text>
                  </View>
                  <Text className="text-primary dark:text-white font-bold">
                    ${(price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              );
            })}

            {/* Total */}
            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 mb-6">
              <Text className="text-gray-500 font-medium">Subtotal</Text>
              <Text className="text-primary dark:text-white font-bold text-xl">
                {selectedOrder.total}
              </Text>
            </View>

            {/* Swipe up hint (only shows at first snap) */}
            <View className="bg-accent/10 rounded-2xl p-4 mb-6 flex-row items-center">
              <Ionicons name="arrow-up" size={16} color="#c5a059" />
              <Text className="text-accent text-sm ml-2 font-medium">
                Pull up for full details
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleCloseSheet}
                className="flex-1 mr-3 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center justify-center"
              >
                <Text className="text-gray-600 dark:text-gray-300 font-bold">
                  Close
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-14 bg-primary rounded-2xl items-center justify-center"
              >
                <Text className="text-white font-bold">Mark Ready</Text>
              </TouchableOpacity>
            </View>

            {/* Extra buttons visible when pulled to full */}
            <View className="mt-3">
              <TouchableOpacity className="h-14 bg-accent/10 border border-accent/30 rounded-2xl items-center justify-center mb-3">
                <Text className="text-accent font-bold">Print Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity className="h-14 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl items-center justify-center">
                <Text className="text-rose-500 font-bold">Cancel Order</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}
