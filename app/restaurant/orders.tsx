import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SearchInput, FilterTabs, OrderStatus } from "../../components/restaurant/SharedRestaurant";
import { OrderCard, Order } from "../../components/restaurant/OrderCard";
import { Typography } from "../../constants/Typography";
import { Button } from "../../components/ui/Button";

const MOCK_ORDERS: Order[] = [
  {
    id: "2401",
    customerName: "James Wilson",
    tableNumber: "14",
    items: [{ name: "Truffle Pasta", quantity: 2 }, { name: "Red Wine", quantity: 1 }],
    time: "10m ago",
    total: "$145.00",
    status: "Preparing",
  },
  {
    id: "2402",
    customerName: "Sarah Connor",
    tableNumber: "08",
    items: [{ name: "Grilled Salmon", quantity: 1 }, { name: "Greek Salad", quantity: 1 }],
    time: "2m ago",
    total: "$82.00",
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
    id: "2404",
    customerName: "Emily Blunt",
    tableNumber: "05",
    items: [{ name: "Beef Steak", quantity: 1 }],
    time: "45m ago",
    total: "$55.00",
    status: "Cancelled",
  },
];

export default function RestaurantOrdersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const tabs = ["All", "Pending", "Preparing", "Completed", "Cancelled"];

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) || order.id.includes(search);
    const matchesTab = activeTab === "All" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1a1f2c" />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary`}>Restaurant Orders</Text>
      </View>

      <SearchInput 
        value={search} 
        onChangeText={setSearch} 
        placeholder="Search by ID or Customer" 
      />

      <FilterTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
      />

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={setSelectedOrder} />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <View className="items-center justify-center mt-20">
            <Text className="text-gray-400">No orders found</Text>
          </View>
        )}
      />

      {/* Order Details Modal */}
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
                <Text className="text-gray-400 text-xs font-bold mb-1">ORDER #{selectedOrder?.id}</Text>
                <Text className={`${Typography.h2} text-primary dark:text-white`}>{selectedOrder?.customerName}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close-circle" size={32} color="#E5E7EB" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-500 font-bold mb-4">ORDER ITEMS</Text>
            {selectedOrder?.items.map((item, idx) => (
              <View key={idx} className="flex-row justify-between mb-2">
                <Text className="text-primary dark:text-white text-base">{item.quantity}x {item.name}</Text>
                <Text className="text-gray-400">$XX.XX</Text>
              </View>
            ))}

            <View className="flex-row justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Text className="text-gray-500 font-bold">TOTAL AMOUNT</Text>
              <Text className="text-primary dark:text-white text-3xl font-bold">{selectedOrder?.total}</Text>
            </View>

            <View className="flex-row mt-10">
              <Button 
                title="Mark Ready" 
                onPress={() => setSelectedOrder(null)} 
                className="flex-1 mr-4"
              />
              <Button 
                title="Print Receipt" 
                variant="outline"
                onPress={() => {}} 
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
