import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../constants/Typography";
import { useTheme } from "../hooks/useTheme";

type ActivityType = "booking" | "order" | "checkout" | "maintenance" | "payment" | "system";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  time: string;
  date: string;
  amount?: string;
}

const ALL_ACTIVITIES: Activity[] = [
  // Today
  { id: "a1",  type: "order",       title: "New Order — Table 14",             subtitle: "James Wilson · Truffle Pasta, Red Wine",        time: "2m ago",   date: "Today" },
  { id: "a2",  type: "booking",     title: "New Booking — Room 205",            subtitle: "Sarah Mitchell · Check-in May 13",              time: "18m ago",  date: "Today" },
  { id: "a3",  type: "order",       title: "Order Completed — Table 08",        subtitle: "Sarah Connor · Grilled Salmon, Salad",          time: "35m ago",  date: "Today" },
  { id: "a4",  type: "payment",     title: "Payment Received — BK-2401",        subtitle: "James Wilson · $720.00 via Credit Card",        time: "1h ago",   date: "Today",  amount: "$720.00" },
  { id: "a5",  type: "checkout",    title: "Check-in — Room 310",               subtitle: "Sarah Mitchell · Suite · 3 nights",             time: "2h ago",   date: "Today" },
  { id: "a6",  type: "maintenance", title: "Maintenance — Pool Area",           subtitle: "Chlorine level check completed",                time: "3h ago",   date: "Today" },
  { id: "a7",  type: "order",       title: "New Order — Table 03",              subtitle: "Michael Scott · Pepperoni Pizza ×2",            time: "4h ago",   date: "Today" },
  { id: "a8",  type: "system",      title: "System Backup Completed",           subtitle: "Daily database backup successful",              time: "6h ago",   date: "Today" },
  // Yesterday
  { id: "b1",  type: "checkout",    title: "Check-out — Room 401",              subtitle: "Marco Rossi · Presidential Suite · Paid",       time: "9:10 AM",  date: "Yesterday" },
  { id: "b2",  type: "payment",     title: "Partial Payment — BK-2402",         subtitle: "Sarah Mitchell · $780.00 of $1,560.00",         time: "10:30 AM", date: "Yesterday", amount: "$780.00" },
  { id: "b3",  type: "booking",     title: "Booking Cancelled — BK-2405",       subtitle: "Emma Larsson · Room 112 · Travel changes",      time: "11:15 AM", date: "Yesterday" },
  { id: "b4",  type: "order",       title: "Order Cancelled — Table 22",        subtitle: "Robert Fox · Margherita Pizza",                 time: "1:00 PM",  date: "Yesterday" },
  { id: "b5",  type: "maintenance", title: "HVAC Service — Floor 3",            subtitle: "Routine AC unit maintenance completed",         time: "2:30 PM",  date: "Yesterday" },
  { id: "b6",  type: "booking",     title: "Booking Confirmed — BK-2401",       subtitle: "James Wilson · Room 101 · 4 nights",            time: "4:45 PM",  date: "Yesterday" },
  { id: "b7",  type: "payment",     title: "Payment Received — BK-2404",        subtitle: "Marco Rossi · $3,600.00 via Credit Card",       time: "6:00 PM",  date: "Yesterday", amount: "$3,600.00" },
  // Earlier
  { id: "c1",  type: "booking",     title: "New Booking — Room 401",            subtitle: "Marco Rossi · Presidential Suite · 3 nights",  time: "May 9",    date: "Earlier" },
  { id: "c2",  type: "system",      title: "Monthly Revenue Report Generated",  subtitle: "$124,592.00 total for April 2026",              time: "May 9",    date: "Earlier" },
  { id: "c3",  type: "booking",     title: "New Booking — Room 112",            subtitle: "Emma Larsson · Standard · 3 nights",            time: "May 5",    date: "Earlier" },
  { id: "c4",  type: "maintenance", title: "Deep Cleaning — Rooms 101-115",     subtitle: "Floor 1 deep clean scheduled and completed",    time: "May 4",    date: "Earlier" },
  { id: "c5",  type: "payment",     title: "Deposit Received — BK-2403",        subtitle: "Yuki Tanaka · $560.00 pending",                 time: "May 3",    date: "Earlier" },
];

const TYPE_META: Record<ActivityType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }> = {
  booking:     { icon: "calendar",          color: "#c5a059", bg: "bg-amber-50 dark:bg-amber-900/20",    label: "Booking"     },
  order:       { icon: "restaurant",        color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-900/20",      label: "Order"       },
  checkout:    { icon: "enter",             color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-900/20",label: "Stay"        },
  maintenance: { icon: "build",             color: "#6b7280", bg: "bg-gray-50 dark:bg-gray-800",         label: "Maintenance" },
  payment:     { icon: "card",              color: "#8b5cf6", bg: "bg-violet-50 dark:bg-violet-900/20",  label: "Payment"     },
  system:      { icon: "settings",          color: "#64748b", bg: "bg-slate-50 dark:bg-slate-800",       label: "System"      },
};

const FILTER_TYPES: Array<ActivityType | "All"> = ["All", "booking", "order", "payment", "checkout", "maintenance", "system"];

export default function ActivitiesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<ActivityType | "All">("All");

  const filtered = ALL_ACTIVITIES.filter(
    (a) => activeFilter === "All" || a.type === activeFilter
  );

  // Group into sections
  const sections = ["Today", "Yesterday", "Earlier"]
    .map((date) => ({
      title: date,
      data: filtered.filter((a) => a.date === date),
    }))
    .filter((s) => s.data.length > 0);

  const renderActivity = ({ item }: { item: Activity }) => {
    const meta = TYPE_META[item.type];
    return (
      <View className={`flex-row items-start px-5 py-3 mb-2`}>
        {/* Icon */}
        <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 mt-0.5 ${meta.bg}`}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-primary dark:text-white font-semibold text-sm leading-5">
            {item.title}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5 leading-4">{item.subtitle}</Text>
          {item.amount && (
            <View className="mt-1.5 self-start bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-lg">
              <Text className="text-violet-600 dark:text-violet-400 text-xs font-bold">{item.amount}</Text>
            </View>
          )}
        </View>

        {/* Time */}
        <Text className="text-gray-400 text-[10px] font-medium ml-2 mt-1">{item.time}</Text>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <View className="px-5 py-2 bg-white dark:bg-background-dark">
      <Text className="text-gray-400 text-xs font-bold tracking-widest">{section.title.toUpperCase()}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-3 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`${Typography.h3} text-primary dark:text-white`}>All Activities</Text>
          <Text className="text-gray-400 text-xs">{ALL_ACTIVITIES.length} total records</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={{ height: 44 }} className="mb-2">
        <FlatList
          data={FILTER_TYPES}
          horizontal
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: 16, paddingRight: 24 }}
          renderItem={({ item }) => {
            const isAll = item === "All";
            const meta = isAll ? null : TYPE_META[item as ActivityType];
            const isActive = activeFilter === item;
            return (
              <TouchableOpacity
                onPress={() => setActiveFilter(item)}
                className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                  isActive ? "bg-accent" : "bg-gray-100 dark:bg-surface-dark"
                }`}
              >
                {meta && (
                  <Ionicons
                    name={meta.icon}
                    size={12}
                    color={isActive ? "#fff" : meta.color}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text className={`text-xs font-bold capitalize ${isActive ? "text-white" : "text-gray-500"}`}>
                  {isAll ? "All" : meta!.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Activity count */}
      <View className="px-5 mb-2">
        <Text className="text-gray-400 text-xs">
          Showing <Text className="text-primary dark:text-white font-bold">{filtered.length}</Text> activities
        </Text>
      </View>

      {/* Section List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="items-center mt-24">
            <Ionicons name="time-outline" size={64} color="#E5E7EB" />
            <Text className="text-gray-400 text-base font-medium mt-4">No activities found</Text>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View className="mx-5 h-px bg-gray-50 dark:bg-gray-800" />
        )}
      />
    </SafeAreaView>
  );
}
