import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Order, OrderCard } from "../../components/restaurant/OrderCard";
import {
  FilterTabs,
  SearchInput,
} from "../../components/restaurant/SharedRestaurant";
import { Button } from "../../components/ui/Button";
import { Typography } from "../../constants/Typography";

const MOCK_ORDERS: Order[] = [
  {
    id: "2401",
    customerName: "James Wilson",
    tableNumber: "14",
    items: [
      { name: "Truffle Pasta", quantity: 2 },
      { name: "Red Wine", quantity: 1 },
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
];

export default function OrdersTab() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const tabs = ["All", "Pending", "Preparing", "Completed", "Cancelled"];

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.id.includes(search);
    const matchesTab = activeTab === "All" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="px-6 pt-3 mb-1">
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
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={setSelectedOrder} />
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
        ListEmptyComponent={() => (
          <View className="items-start px-6 mt-4">
            <Text className="text-gray-400">No orders found.</Text>
          </View>
        )}
      />

      <Modal
        visible={!!selectedOrder}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-surface-dark rounded-t-[40px] p-8">
            <View className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full self-center mb-6" />
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="text-gray-400 text-xs font-bold mb-1">
                  ORDER #{selectedOrder?.id}
                </Text>
                <Text
                  className={`${Typography.h2} text-primary dark:text-white`}
                >
                  {selectedOrder?.customerName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close-circle" size={32} color="#E5E7EB" />
              </TouchableOpacity>
            </View>
            <View className="flex-row mt-6">
              <Button
                title="Update Status"
                onPress={() => setSelectedOrder(null)}
                className="flex-1 mr-4"
              />
              <Button
                title="Close"
                variant="outline"
                onPress={() => setSelectedOrder(null)}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
