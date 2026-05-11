import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";
import { useNotifications } from "../../providers/NotificationProvider";

type NotifType = "order" | "booking" | "system" | "alert";

interface NotifItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotifType;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotifItem[] = [
  { id: "1", title: "New Restaurant Order", description: "Table 14 has placed a new order for 2x Truffle Pasta and 1x Red Wine.", time: "2m ago", type: "order", isRead: false },
  { id: "2", title: "Room Booking Confirmed", description: "Presidential Suite booking for James Bond is now confirmed for May 20-25.", time: "15m ago", type: "booking", isRead: false },
  { id: "3", title: "System Update", description: "The Ashford management system will undergo maintenance tonight at 2:00 AM.", time: "1h ago", type: "system", isRead: true },
  { id: "4", title: "Revenue Milestone", description: "Congratulations! You have reached your daily revenue goal of $5,000.", time: "3h ago", type: "alert", isRead: true },
  { id: "5", title: "Maintenance Request", description: "Room 405 reported a leak in the bathroom. Assigned to John.", time: "5h ago", type: "system", isRead: true },
];

// Dummy notification templates to test
const DUMMY_TEMPLATES = [
  { title: "🍽️ New Order — Table 07", body: "2x Grilled Salmon, 1x Red Wine received.", type: "order" as NotifType },
  { title: "📅 New Booking — Room 310", body: "Emma Larsson · Suite · Check-in May 20.", type: "booking" as NotifType },
  { title: "💰 Payment Received", body: "BK-2406 · $1,200.00 paid via Credit Card.", type: "alert" as NotifType },
];

const CATEGORIES = ["All", "Orders", "Bookings", "System"];

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
  const { colors } = useTheme();
  const { showToast } = useNotifications();
  const [notifications, setNotifications] = useState<NotifItem[]>(INITIAL_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState<number | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

  const fireTestNotification = async (idx: number) => {
    setLoading(idx);
    const t = DUMMY_TEMPLATES[idx];

    // Show in-app toast
    showToast(t.title, t.body, t.type as any);

    // Also add it to the in-app list
    const newItem: NotifItem = {
      id: Date.now().toString(),
      title: t.title,
      description: t.body,
      time: "Just now",
      type: t.type,
      isRead: false,
    };
    
    setTimeout(() => {
      setNotifications((prev) => [newItem, ...prev]);
      setLoading(null);
    }, 600);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Orders") return n.type === "order";
    if (activeCategory === "Bookings") return n.type === "booking";
    if (activeCategory === "System") return n.type === "system" || n.type === "alert";
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row justify-between items-center">
        <View>
          <Text className={`${Typography.h3} text-primary dark:text-white`}>Notifications</Text>
          {unreadCount > 0 && (
            <Text className="text-accent text-xs font-semibold mt-0.5">{unreadCount} unread</Text>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead} className="bg-accent/10 px-3 py-1.5 rounded-xl">
          <Text className="text-accent font-semibold text-sm">Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
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

      {/* Test Notification Panel */}
      <View className="mx-5 mb-4 bg-primary dark:bg-surface-dark rounded-3xl p-4 shadow-lg shadow-primary/20">
        <View className="flex-row items-center mb-3">
          <Ionicons name="flask" size={16} color="#c5a059" />
          <Text className="text-white font-bold text-sm ml-2">Simulate Activity</Text>
          <View className="flex-1" />
          <Text className="text-gray-400 text-[10px]">Development Tool</Text>
        </View>
        <View className="flex-row justify-between">
          {DUMMY_TEMPLATES.map((t, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => fireTestNotification(idx)}
              disabled={loading === idx}
              className="w-[31%] items-center justify-center bg-white/10 rounded-2xl py-3"
            >
              <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center mb-1.5">
                <Ionicons
                  name={ICON_MAP[t.type] as any}
                  size={16}
                  color={loading === idx ? "#6b7280" : "#c5a059"}
                />
              </View>
              <Text className="text-white text-[10px] font-bold text-center" numberOfLines={1}>
                {t.type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markRead(item.id)}
            className={`flex-row items-start p-4 mx-5 mb-3 rounded-2xl border ${
              item.isRead
                ? "bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800"
                : "bg-accent/5 border-accent/20"
            }`}
          >
            <View
              className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${
                item.isRead ? "bg-gray-50 dark:bg-gray-800" : "bg-accent/10"
              }`}
            >
              <Ionicons
                name={ICON_MAP[item.type] as any}
                size={20}
                color={item.isRead ? "#9CA3AF" : COLOR_MAP[item.type]}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text
                  className={`text-sm flex-1 mr-2 ${
                    item.isRead
                      ? "text-gray-500 font-medium"
                      : "text-primary dark:text-white font-bold"
                  }`}
                >
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-[10px]">{item.time}</Text>
              </View>
              <Text className="text-gray-400 text-xs leading-4" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            {!item.isRead && (
              <View className="w-2 h-2 bg-accent rounded-full ml-2 mt-1" />
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
