import React, { useState, useCallback, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";
import { ENDPOINTS } from "../../constants/Api";
import { useAlertStatus } from "../../hooks/useAlertStatus";

type NotifType = "order" | "booking" | "system" | "alert";

interface NotifItem {
  id: string;
  title: string;
  description: string;
  time: string;
  timestamp: number;
  type: NotifType;
  isRead: boolean;
  rawId?: string;
}

const CATEGORIES = ["All", "Orders", "Bookings"];

const ICON_MAP: Record<NotifType, string> = {
  order: "restaurant",
  booking: "calendar",
  system: "settings",
  alert: "notifications",
};

const COLOR_MAP: Record<NotifType, string> = {
  order: "#3b82f6",
  booking: "#c5a059",
  system: "#6b7280",
  alert: "#10b981",
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { markAsRead, lastSeenTime } = useAlertStatus();
  
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isPollingRef = useRef(false);

  const fetchActivity = async (isBackground = false) => {
    if (isPollingRef.current && isBackground) return;
    if (isBackground) isPollingRef.current = true;
    else if (!refreshing) setLoading(true);

    try {
      const fetchJson = async (url: string) => {
        try {
          const res = await fetch(url);
          const text = await res.text();
          return JSON.parse(text);
        } catch (e) {
          return { status: "error" };
        }
      };

      const [bookRes, orderRes] = await Promise.all([
        fetchJson(ENDPOINTS.ADMIN_BOOKINGS),
        fetchJson(ENDPOINTS.ADMIN_ORDERS)
      ]);

      let allItems: NotifItem[] = [];

      if (bookRes && bookRes.status === "success" && bookRes.data) {
        const bookings = bookRes.data.map((b: any) => ({
          id: `b-${b.bookedid}`,
          rawId: b.bookedid.toString(),
          title: `New Booking — Room ${b.room_no || 'TBA'}`,
          description: `${b.firstname} ${b.lastname} · ${b.room_names} · Check-in ${b.checkindate}`,
          time: new Date(b.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(b.date_time).getTime(),
          type: "booking" as NotifType,
          isRead: true,
        }));
        allItems = [...allItems, ...bookings];
      }

      if (orderRes && orderRes.status === "success" && orderRes.data) {
        const orders = orderRes.data.map((o: any) => ({
          id: `o-${o.order_id}`,
          rawId: o.order_id.toString(),
          title: `Restaurant Order — ${o.customer_name || 'Guest'}`,
          description: `Invoice: ${o.saleinvoice} · Total: $${o.totalamount}`,
          time: new Date(o.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(o.order_date).getTime(),
          type: "order" as NotifType,
          isRead: true,
        }));
        allItems = [...allItems, ...orders];
      }

      allItems.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(allItems);
    } catch (error) {
      console.error("Activity Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isPollingRef.current = false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivity();
      
      const interval = setInterval(() => {
        fetchActivity(true);
      }, 15000);

      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivity();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Orders") return n.type === "order";
    if (activeCategory === "Bookings") return n.type === "booking";
    return true;
  });

  const hasAnyUnread = notifications.some(n => n.timestamp > lastSeenTime);

  const handleMarkAllAsRead = async () => {
    if (notifications.length > 0) {
      const maxTimestamp = Math.max(...notifications.map(n => n.timestamp));
      await markAsRead(maxTimestamp);
    } else {
      await markAsRead();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="px-5 pt-3 pb-3 flex-row justify-between items-center">
        <View>
          <Text className={`${Typography.h3} text-primary dark:text-white`}>Activity Log</Text>
          <Text className="text-gray-400 text-xs mt-0.5">Real-time hotel & restaurant updates</Text>
        </View>
        <View className="flex-row items-center">
           {hasAnyUnread && (
             <TouchableOpacity 
               onPress={handleMarkAllAsRead}
               className="mr-3 bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20"
             >
               <Text className="text-accent text-[10px] font-bold">Mark all as read</Text>
             </TouchableOpacity>
           )}
          <TouchableOpacity onPress={onRefresh} className="bg-accent/10 px-3 py-1.5 rounded-xl">
            <Ionicons name="refresh" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 mb-4 mt-2">
        <View className="flex-row">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className={`mr-3 px-4 py-2 rounded-full border ${
                activeCategory === cat
                  ? "bg-primary border-primary dark:bg-accent dark:border-accent"
                  : "bg-transparent border-gray-200 dark:border-gray-800"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeCategory === cat ? "text-white" : "text-gray-500"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
           <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          extraData={lastSeenTime}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          renderItem={({ item }) => {
            const isUnread = item.timestamp > lastSeenTime;
            
            return (
              <TouchableOpacity
                onPress={async () => {
                  if (isUnread) {
                    await markAsRead(item.timestamp);
                  }
                  if (item.type === 'booking') {
                    router.push(`/bookings/${item.rawId}`);
                  }
                }}
                onLongPress={() => {
                  Alert.alert(
                    "Mark as Unread?",
                    "This will highlight this notification and newer ones again.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Unread", 
                        onPress: async () => {
                          // Mark as unread by setting lastSeenTime to just before this item
                          await markAsRead(item.timestamp - 1);
                        }
                      }
                    ]
                  );
                }}
                delayLongPress={500}
                className={`flex-row items-start p-4 mx-5 mb-3 rounded-2xl border ${
                  isUnread 
                    ? "bg-accent/5 dark:bg-accent/10 border-accent/30" 
                    : "bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800"
                }`}
              >
                {isUnread && (
                  <View className="absolute left-0 top-4 bottom-4 w-1 bg-accent rounded-r-full" />
                )}
                
                <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3 bg-gray-50 dark:bg-gray-800">
                  <Ionicons
                    name={ICON_MAP[item.type] as any}
                    size={20}
                    color={COLOR_MAP[item.type]}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <View className="flex-row items-center flex-1">
                      <Text className={`text-sm mr-2 text-primary dark:text-white ${isUnread ? 'font-black' : 'font-bold'}`}>
                        {item.title}
                      </Text>
                      {isUnread && (
                        <View className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </View>
                    <Text className="text-gray-400 text-[10px]">{item.time}</Text>
                  </View>
                  <Text className={`text-xs leading-4 ${isUnread ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#D1D5DB" style={{ marginTop: 4, marginLeft: 4 }} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() => (
            <View className="items-center mt-20 px-10">
              <Ionicons name="notifications-off-outline" size={64} color="#E5E7EB" />
              <Text className="text-gray-400 text-base font-medium mt-4 text-center">No recent activity</Text>
              <Text className="text-gray-300 text-sm mt-1 text-center">Check back later for new bookings and orders</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
