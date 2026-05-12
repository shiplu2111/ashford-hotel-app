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
  Modal,
  ScrollView,
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
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

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

  const handleAcceptOrder = async () => {
    if (!selectedOrder || statusUpdating) return;

    setStatusUpdating(true);
    try {
      const formData = new FormData();
      formData.append('order_id', selectedOrder.id);
      
      const response = await fetch(ENDPOINTS.ADMIN_ACCEPT_ORDER, {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      
      if (json.status === 'success') {
        Alert.alert("Success", "Order accepted successfully");
        fetchOrders(); // Refresh list
        handleCloseSheet();
      } else {
        Alert.alert("Error", json.message || "Failed to accept order");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network request failed");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || statusUpdating) return;

    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            setStatusUpdating(true);
            try {
              const formData = new FormData();
              formData.append('order_id', selectedOrder.id);
              formData.append('reason', "Cancelled by Admin");
              
              const response = await fetch(ENDPOINTS.ADMIN_CANCEL_ORDER, {
                method: 'POST',
                body: formData,
              });
              const json = await response.json();
              
              if (json.status === 'success') {
                Alert.alert("Cancelled", "Order has been cancelled");
                fetchOrders();
                handleCloseSheet();
              } else {
                Alert.alert("Error", json.message || "Failed to cancel order");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Network request failed");
            } finally {
              setStatusUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder || statusUpdating) return;

    Alert.alert(
      "Complete Order",
      "Are you sure you want to mark this order as completed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Complete", 
          onPress: async () => {
            setStatusUpdating(true);
            try {
              const formData = new FormData();
              formData.append('order_id', selectedOrder.id);
              
              const response = await fetch(ENDPOINTS.ADMIN_COMPLETE_ORDER, {
                method: 'POST',
                body: formData,
              });
              const json = await response.json();
              
              if (json.status === 'success') {
                Alert.alert("Success", "Order marked as completed");
                fetchOrders();
                handleCloseSheet();
              } else {
                Alert.alert("Error", json.message || "Failed to complete order");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Network request failed");
            } finally {
              setStatusUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleMakePayment = async () => {
    if (!selectedOrder || statusUpdating) return;

    // Parse values removing '$'
    const totalVal = parseFloat(selectedOrder.total.replace('$', '')) || 0;
    const paidVal = parseFloat(selectedOrder.customerPaid?.replace('$', '') || "0");
    
    const dueAmount = totalVal - paidVal;
    
    if (dueAmount <= 0) {
      Alert.alert("Info", "Order is already fully paid");
      return;
    }

    Alert.alert(
      "Make Payment",
      `Confirm payment of $${dueAmount.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            setStatusUpdating(true);
            try {
              const formData = new FormData();
              formData.append('order_id', selectedOrder.id);
              formData.append('amount', dueAmount.toString());
              formData.append('pay_type', '4'); // Cash
              
              const response = await fetch(ENDPOINTS.ADMIN_MAKE_PAYMENT, {
                method: 'POST',
                body: formData,
              });
              const json = await response.json();
              
              if (json.status === 'success') {
                Alert.alert("Paid", "Payment recorded successfully");
                fetchOrders();
                handleCloseSheet();
              } else {
                Alert.alert("Error", json.message || "Failed to record payment");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Network request failed");
            } finally {
              setStatusUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleViewInvoice = async () => {
    if (!selectedOrder) return;
    setInvoiceLoading(true);
    try {
      const response = await fetch(ENDPOINTS.ADMIN_POS_INVOICE(selectedOrder.id));
      const json = await response.json();
      if (json.status === "success") {
        setInvoiceData(json.data);
        setShowInvoice(true);
      } else {
        Alert.alert("Error", json.message || "Failed to fetch invoice");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network request failed");
    } finally {
      setInvoiceLoading(false);
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
              {selectedOrder.status === "Pending" && (
                <>
                  <TouchableOpacity
                    onPress={handleAcceptOrder}
                    disabled={statusUpdating}
                    className={`w-[48%] h-14 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg ${
                        statusUpdating ? 'bg-gray-400' : 'bg-emerald-500 shadow-emerald-500/20'
                    }`}
                  >
                    {statusUpdating ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                            <Text className="text-white font-bold ml-2 text-xs">Accept Order</Text>
                        </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCancelOrder}
                    disabled={statusUpdating}
                    className={`w-[48%] h-14 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg ${
                        statusUpdating ? 'bg-gray-400' : 'bg-rose-500 shadow-rose-500/20'
                    }`}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="white" />
                    <Text className="text-white font-bold ml-2 text-xs">Cancel Order</Text>
                  </TouchableOpacity>
                </>
              )}

              {selectedOrder.status === "Preparing" && (
                <TouchableOpacity
                  onPress={handleCompleteOrder}
                  disabled={statusUpdating}
                  className={`w-[48%] h-14 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg ${
                      statusUpdating ? 'bg-gray-400' : 'bg-green-500 shadow-green-500/20'
                  }`}
                >
                  <Ionicons name="checkmark-done-circle-outline" size={20} color="white" />
                  <Text className="text-white font-bold ml-2 text-xs">Complete Order</Text>
                </TouchableOpacity>
              )}

              {selectedOrder.status !== "Completed" && selectedOrder.status !== "Cancelled" && (
                <TouchableOpacity
                  onPress={handleMakePayment}
                  disabled={statusUpdating}
                  className={`w-[48%] h-14 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg ${
                      statusUpdating ? 'bg-gray-400' : 'bg-indigo-500 shadow-indigo-500/20'
                  }`}
                >
                  {statusUpdating ? (
                      <ActivityIndicator color="white" size="small" />
                  ) : (
                      <>
                          <Ionicons name="card-outline" size={20} color="white" />
                          <Text className="text-white font-bold ml-2 text-xs">Make Payment</Text>
                      </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleViewInvoice}
                disabled={invoiceLoading}
                className="w-[48%] h-14 bg-violet-500 rounded-2xl flex-row items-center justify-center mb-3 shadow-lg shadow-violet-500/20"
              >
                {invoiceLoading ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <>
                        <Ionicons name="print-outline" size={20} color="white" />
                        <Text className="text-white font-bold ml-2 text-xs">POS Invoice</Text>
                    </>
                )}
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

      {/* POS Invoice Modal */}
      <Modal
        visible={showInvoice}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInvoice(false)}
      >
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-3xl overflow-hidden max-h-[90%]">
            <View className="p-4 border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
              <Text className="font-bold text-lg text-gray-800">POS Invoice</Text>
              <TouchableOpacity onPress={() => setShowInvoice(false)}>
                <Ionicons name="close-circle" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-6">
              {invoiceData && (
                <View className="items-center">
                  {/* Store Header */}
                  <View className="items-center mb-6">
                    <Text className="text-2xl font-black mb-1 text-gray-900 tracking-tighter">THE ASHFORD</Text>
                    <Text className="text-xs font-bold text-gray-600 mb-2">{invoiceData.storeinfo?.storename || "The Ashford Hotel & Restaurant"}</Text>
                    <Text className="text-[10px] text-gray-500 text-center">{invoiceData.storeinfo?.address}</Text>
                    <Text className="text-[10px] text-gray-500">Call: {invoiceData.storeinfo?.phone}</Text>
                  </View>

                  <View className="w-full h-px bg-gray-200 my-4 border-dashed border-t" />

                  {/* Order Details */}
                  <View className="w-full flex-row justify-between mb-4">
                    <View>
                      <Text className="text-xs text-gray-500 uppercase tracking-widest font-bold">Order No</Text>
                      <Text className="font-black text-lg text-gray-900">#{invoiceData.orderinfo?.saleinvoice}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-gray-500 uppercase tracking-widest font-bold">Date</Text>
                      <Text className="font-bold text-gray-800">{invoiceData.orderinfo?.order_date}</Text>
                    </View>
                  </View>

                  <View className="w-full h-px bg-gray-200 mb-4" />

                  {/* Items Table Header */}
                  <View className="w-full flex-row border-b-2 border-gray-100 pb-2 mb-2">
                    <Text className="flex-1 text-[10px] font-black text-gray-400 uppercase">Item Description</Text>
                    <Text className="w-12 text-center text-[10px] font-black text-gray-400 uppercase">Qty</Text>
                    <Text className="w-20 text-right text-[10px] font-black text-gray-400 uppercase">Total</Text>
                  </View>

                  {/* Items */}
                  {invoiceData.iteminfo?.map((item: any, idx: number) => (
                    <View key={idx} className="w-full mb-3">
                      <View className="flex-row">
                        <View className="flex-1">
                          <Text className="font-bold text-sm text-gray-800">{item.ProductName}</Text>
                          {item.variantName && <Text className="text-[10px] text-gray-400 italic">{item.variantName}</Text>}
                        </View>
                        <Text className="w-12 text-center font-medium text-gray-600">x{item.menuqty}</Text>
                        <Text className="w-20 text-right font-black text-gray-900">
                          {invoiceData.currency?.curr_icon}{parseFloat(item.price) * parseFloat(item.menuqty)}
                        </Text>
                      </View>
                      {/* Addons */}
                      {item.addons?.map((addon: any, aidx: number) => (
                        <View key={aidx} className="flex-row mt-1 pl-2 border-l-2 border-gray-50">
                          <Text className="flex-1 text-[10px] text-gray-500">+ {addon.name}</Text>
                          <Text className="w-12 text-center text-[10px] text-gray-500">x{addon.quantity}</Text>
                          <Text className="w-20 text-right text-[10px] text-gray-700">
                            {invoiceData.currency?.curr_icon}{parseFloat(addon.price) * parseFloat(addon.quantity)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}

                  <View className="w-full h-px bg-gray-200 my-4 border-dashed border-t" />

                  {/* Totals */}
                  <View className="w-full space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Sub-Total Amount</Text>
                      <Text className="font-bold text-gray-800">{invoiceData.currency?.curr_icon}{invoiceData.billinfo?.total_amount}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Discount</Text>
                      <Text className="font-bold text-rose-500">-{invoiceData.currency?.curr_icon}{invoiceData.billinfo?.discount || "0"}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Service Charge</Text>
                      <Text className="font-bold text-gray-800">{invoiceData.currency?.curr_icon}{invoiceData.billinfo?.service_charge || "0"}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">VAT/Tax ({invoiceData.storeinfo?.vat}%)</Text>
                      <Text className="font-bold text-gray-800">{invoiceData.currency?.curr_icon}{invoiceData.billinfo?.VAT || "0"}</Text>
                    </View>
                    <View className="h-px bg-gray-100 my-2" />
                    <View className="flex-row justify-between">
                      <Text className="text-lg font-black text-gray-900">Grand Total</Text>
                      <Text className="text-xl font-black text-indigo-600">
                        {invoiceData.currency?.curr_icon}{invoiceData.billinfo?.bill_amount}
                      </Text>
                    </View>
                  </View>

                  <View className="w-full h-px bg-gray-200 my-6 border-dashed border-t" />

                  {/* Footer Info */}
                  <View className="w-full items-center">
                    <Text className="text-xs font-black text-gray-800 mb-1">Thank you very much</Text>
                    <Text className="text-[10px] text-gray-400 italic">Billing To: {invoiceData.customerinfo?.firstname} {invoiceData.customerinfo?.lastname}</Text>
                    <Text className="text-[10px] text-gray-300 mt-4">Powered By: BDTASK</Text>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View className="p-4 bg-gray-50">
              <TouchableOpacity 
                onPress={() => setShowInvoice(false)}
                className="w-full h-14 bg-gray-900 rounded-2xl items-center justify-center shadow-lg"
              >
                <Text className="text-white font-black">CLOSE INVOICE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
