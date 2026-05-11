import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_ROOMS, Room, RoomType } from "../../constants/BookingData";
import { RoomCard } from "../../components/booking/RoomCard";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";

const ROOM_TYPES: Array<RoomType | "All"> = ["All", "Standard", "Deluxe", "Suite", "Presidential"];

export default function RoomsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeType, setActiveType] = useState<RoomType | "All">("All");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showAvailable, setShowAvailable] = useState(false);

  const filtered = MOCK_ROOMS.filter((r) => {
    const matchType = activeType === "All" || r.type === activeType;
    const matchAvail = !showAvailable || r.isAvailable;
    return matchType && matchAvail;
  });

  const available = MOCK_ROOMS.filter((r) => r.isAvailable).length;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`${Typography.h3} text-primary dark:text-white`}>Room Availability</Text>
          <Text className="text-gray-400 text-xs">{available} of {MOCK_ROOMS.length} rooms available</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAvailable(!showAvailable)}
          className={`flex-row items-center px-3 py-2 rounded-xl ${showAvailable ? "bg-accent" : "bg-gray-100 dark:bg-surface-dark"}`}
        >
          <Ionicons name="filter" size={15} color={showAvailable ? "#fff" : "#9CA3AF"} />
          <Text className={`text-xs font-bold ml-1 ${showAvailable ? "text-white" : "text-gray-500"}`}>
            Available
          </Text>
        </TouchableOpacity>
      </View>

      {/* Type Filter */}
      <View style={{ height: 42 }} className="mb-2">
        <FlatList
          data={ROOM_TYPES}
          horizontal
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: 16, paddingRight: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveType(item)}
              className={`px-4 py-2 rounded-full mr-2 ${activeType === item ? "bg-accent" : "bg-gray-100 dark:bg-surface-dark"}`}
            >
              <Text className={`text-xs font-bold ${activeType === item ? "text-white" : "text-gray-500"}`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            selected={selectedRoom === item.id}
            onPress={(r) => setSelectedRoom(r.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <Ionicons name="bed-outline" size={64} color="#E5E7EB" />
            <Text className="text-gray-400 mt-4 text-base">No rooms match your filters</Text>
          </View>
        )}
      />

      {selectedRoom && (
        <View className="px-5 pb-8 pt-3 border-t border-gray-100 dark:border-gray-800">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-accent h-14 rounded-2xl items-center justify-center"
          >
            <Text className="text-white font-bold text-base">Select This Room</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
