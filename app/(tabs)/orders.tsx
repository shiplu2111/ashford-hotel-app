import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  DeviceEventEmitter,
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
import { OrderCard, Order, TimeAgoText } from "../../components/restaurant/OrderCard";
import { StatusBadge } from "../../components/restaurant/SharedRestaurant";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";
import { ENDPOINTS } from "../../constants/Api";

export default function OrdersTab() {
  const { isDark, colors } = useTheme();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["45%", "95%"]; 

  const tabs = ["All", "Pending", "Preparing", "Completed", "Cancelled"];

  const mapStatus = (status: string) => {
    switch (status) {
      case "1": return "Pending";
      case "2": return "Preparing";
      case "4": return "Completed";
      case "5": return "Cancelled";
      default: return "Pending";
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(ENDPOINTS.ADMIN_ORDERS);
      const json = await response.json();
      if (json.status === "success") {
        const mappedOrders: Order[] = json.data.map((item: any) => {
            const total = parseFloat(item.bill_amount || item.totalamount || "0");
            const paid = parseFloat(item.customerpaid || "0");
            const change = paid > 0 ? paid - total : 0;

            return {
              id: item.order_id.toString(),
              customerName: `${item.firstname || "Guest"} ${item.lastname || ""}`.trim(),
              customerPhone: item.cust_phone,
              billingAddress: item.address,
              billingDate: item.order_date,
              invoiceNumber: item.saleinvoice,
              tableNumber: item.table_no?.toString() || "0",
              items: (item.items || []).map((i: any) => ({
                  name: i.ProductName,
                  quantity: i.menuqty
              })), 
              time: `${item.order_time}`,
              total: `$${total.toFixed(2)}`,
              status: mapStatus(item.order_status),
              subtotal: `$${parseFloat(item.totalamount || "0").toFixed(2)}`,
              vat: `$${parseFloat(item.VAT || "0").toFixed(2)}`,
              serviceCharge: `$${parseFloat(item.service_charge || "0").toFixed(2)}`,
              discount: `$${parseFloat(item.discount || "0").toFixed(2)}`,
              customerPaid: `$${paid.toFixed(2)}`,
              changeDue: `$${change.toFixed(2)}`,
            };
        });
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error(error);
      // Alert.alert("Error", "Failed to fetch orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setItemsLoading(true);
    setSelectedOrderItems([]);
    try {
      const response = await fetch(ENDPOINTS.ADMIN_ORDER_DETAILS(orderId));
      const json = await response.json();
      if (json.status === "success") {
        setSelectedOrderItems(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Listen for notification clicks
    const sub = DeviceEventEmitter.addListener('OPEN_ORDER_DETAILS', (orderId) => {
        // Find order in list and open
        const order = orders.find(o => o.id === orderId.toString());
        if (order) {
            handleOpenSheet(order);
        } else {
            // If not in list, fetch list then open
            fetchOrders().then(() => {
                DeviceEventEmitter.emit('OPEN_ORDER_DETAILS', orderId);
            });
        }
    });

    const refreshSub = DeviceEventEmitter.addListener('REFRESH_ORDERS', () => {
        fetchOrders();
    });

    return () => {
        sub.remove();
        refreshSub.remove();
    };
  }, [orders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.id.includes(search) ||
      (order.invoiceNumber && order.invoiceNumber.includes(search));
    const matchesTab = activeTab === "All" || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleOpenSheet = useCallback((order: Order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.id);
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
        placeholder="Search Order ID or Invoice..."
      />

      <FilterTabs tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#c5a059" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#c5a059"]} />
          }
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={handleOpenSheet} />
          )}
          ListEmptyComponent={() => (
            <View className="items-start px-6 mt-4">
              <Text className="text-gray-400">No orders found.</Text>
            </View>
          )}
        />
      )}

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
            {/* Header */}
            <View className="flex-row justify-between items-center mb-5 mt-2">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                    <Text className="text-gray-400 text-xs font-bold tracking-widest mr-2">
                    ORDER #{selectedOrder.id}
                    </Text>
                    {selectedOrder.invoiceNumber && (
                        <Text className="text-accent text-[10px] font-bold bg-accent/10 px-2 py-0.5 rounded-full mr-2">
                            INV: {selectedOrder.invoiceNumber}
                        </Text>
                    )}
                </View>
                <Text className="text-primary dark:text-white text-2xl font-bold">
                  {selectedOrder.customerName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="flex-row items-center mr-4">
                    <Ionicons name="restaurant-outline" size={13} color="#c5a059" />
                    <Text className="text-accent text-sm font-bold ml-1">
                        Table {selectedOrder.tableNumber}
                    </Text>
                  </View>
                  {selectedOrder.customerPhone && (
                      <TouchableOpacity 
                        onPress={() => Linking.openURL(`tel:${selectedOrder.customerPhone}`)}
                        className="flex-row items-center"
                      >
                        <Ionicons name="call-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-400 text-sm ml-1">
                            {selectedOrder.customerPhone}
                        </Text>
                      </TouchableOpacity>
                  )}
                </View>
                {selectedOrder.billingAddress && (
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs ml-1 flex-1" numberOfLines={1}>
                            {selectedOrder.billingAddress}
                        </Text>
                    </View>
                )}
                {selectedOrder.billingDate && (
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                        <Text className="text-gray-400 text-[10px] ml-1">
                            Billing Date: {selectedOrder.billingDate}
                        </Text>
                    </View>
                )}
              </View>
              <View className="items-end">
                <StatusBadge status={selectedOrder.status} />
                <View className="flex-row items-center mt-2">
                  <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                  <TimeAgoText 
                    date={selectedOrder.billingDate || ""} 
                    time={selectedOrder.time} 
                    style="text-rose-500 font-bold text-xs ml-1"
                  />
                </View>
              </View>
            </View>

            <View className="h-px bg-gray-100 dark:bg-gray-800 mb-5" />

            {/* Order Items */}
            <Text className="text-gray-400 text-xs font-bold tracking-widest mb-4">
              ORDER ITEMS
            </Text>
            
            {itemsLoading ? (
                <ActivityIndicator color="#c5a059" className="my-10" />
            ) : selectedOrderItems.length > 0 ? (
                selectedOrderItems.map((item, idx) => (
                    <View
                      key={idx}
                      className="flex-row justify-between items-center mb-3 bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-8 h-8 bg-accent/10 rounded-xl items-center justify-center mr-3">
                          <Text className="text-accent font-bold text-sm">
                            {item.menuqty}x
                          </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-primary dark:text-white font-medium text-base">
                            {item.ProductName}
                            </Text>
                            {item.variantName && (
                                <Text className="text-gray-400 text-xs">
                                    {item.variantName}
                                </Text>
                            )}
                            {item.notes && (
                                <Text className="text-rose-500 text-[10px] font-bold mt-0.5">
                                    Note: {item.notes}
                                </Text>
                            )}
                            {item.addons && item.addons.length > 0 && (
                                <View className="mt-1 flex-row flex-wrap">
                                    {item.addons.map((addon: any, aIdx: number) => (
                                        <View key={aIdx} className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-md mr-1 mb-1">
                                            <Text className="text-[10px] text-gray-600 dark:text-gray-400">
                                                +{addon.quantity} {addon.name}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                      </View>
                      <Text className="text-primary dark:text-white font-bold">
                        ${(parseFloat(item.price) * parseFloat(item.menuqty)).toFixed(2)}
                      </Text>
                    </View>
                  ))
            ) : (
                <Text className="text-gray-400 mb-10 text-center">No items found for this order.</Text>
            )}

            {/* Billing Summary */}
            <View className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-5 mb-6">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-500 text-sm">Subtotal</Text>
                    <Text className="text-primary dark:text-white font-medium">{selectedOrder.subtotal}</Text>
                </View>
                {parseFloat(selectedOrder.vat?.replace('$', '') || '0') > 0 && (
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-500 text-sm">VAT</Text>
                        <Text className="text-primary dark:text-white font-medium">{selectedOrder.vat}</Text>
                    </View>
                )}
                {parseFloat(selectedOrder.serviceCharge?.replace('$', '') || '0') > 0 && (
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-500 text-sm">Service Charge</Text>
                        <Text className="text-primary dark:text-white font-medium">{selectedOrder.serviceCharge}</Text>
                    </View>
                )}
                {parseFloat(selectedOrder.discount?.replace('$', '') || '0') > 0 && (
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-rose-500 text-sm">Discount</Text>
                        <Text className="text-rose-500 font-medium">-{selectedOrder.discount}</Text>
                    </View>
                )}
                <View className="h-px bg-gray-200 dark:bg-gray-800 my-3" />
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-primary dark:text-white font-bold text-lg">Grand Total</Text>
                    <Text className="text-accent font-bold text-2xl">{selectedOrder.total}</Text>
                </View>
                
                <View className="h-px bg-gray-200 dark:bg-gray-800 my-3" />
                
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-500 text-sm">Customer Paid Amount</Text>
                    <Text className="text-primary dark:text-white font-medium">{selectedOrder.customerPaid}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500 text-sm">Change Due</Text>
                    <Text className="text-primary dark:text-white font-medium">{selectedOrder.changeDue}</Text>
                </View>
            </View>

            {/* Action Buttons Grid */}
            <View className="flex-row flex-wrap justify-between">
              <TouchableOpacity
                className="w-[48%] h-14 bg-emerald-500 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg shadow-emerald-500/20"
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2 text-xs">Accept Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-[48%] h-14 bg-rose-500 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg shadow-rose-500/20"
              >
                <Ionicons name="close-circle-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2 text-xs">Cancel Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-[48%] h-14 bg-indigo-500 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg shadow-indigo-500/20"
              >
                <Ionicons name="card-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2 text-xs">Make Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-[48%] h-14 bg-amber-500 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg shadow-amber-500/20"
              >
                <Ionicons name="print-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2 text-xs">POS Invoice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full h-14 bg-purple-600 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg shadow-purple-600/20"
              >
                <Ionicons name="gift-outline" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Payment with Gift Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCloseSheet}
                className="w-full h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center justify-center mt-2"
              >
                <Text className="text-gray-600 dark:text-gray-300 font-bold">
                  Close Details
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}
