import React, { useState } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_BOOKINGS, Booking, BookingStatus } from "../../constants/BookingData";
import { BookingCard } from "../../components/booking/BookingCard";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";

import { ENDPOINTS } from "../../constants/Api";
import { ActivityIndicator } from "react-native";

const TABS: Array<BookingStatus | "All"> = ["All", "Pending", "Confirmed", "Checked In", "Checked Out", "Cancelled"];

export default function BookingsScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<BookingStatus | "All">("All");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await fetch(ENDPOINTS.ADMIN_BOOKINGS);
      const json = await response.json();
      if (json.status === "success") {
        const mapped: Booking[] = json.data.map((b: any) => {
          // Map API status to App status
          let bStatus: BookingStatus = "Pending";
          if (b.status_text === "Success" || b.status_text === "Completed") bStatus = "Confirmed";
          else if (b.status_text === "Check In") bStatus = "Checked In";
          else if (b.status_text === "Checkout") bStatus = "Checked Out";
          else if (b.status_text === "Cancel" || b.status_text === "Released") bStatus = "Cancelled";
          
          const totalAmount = parseFloat(b.gross_payable || "0");
          const paidAmount = parseFloat(b.effective_paid || "0");
          const isPaid = Math.abs(totalAmount - paidAmount) < 0.1;
          
          return {
            id: b.bookedid.toString(),
            bookingNumber: b.booking_number,
            guestId: b.cutomerid,
            guest: {
              id: b.cutomerid,
              name: `${b.firstname || "Guest"} ${b.lastname || ""}`.trim(),
              email: "", // Not in basic join
              phone: b.cust_phone,
              nationality: "",
              idType: "",
              idNumber: "",
              avatar: `https://i.pravatar.cc/150?u=${b.cutomerid}`,
            },
            roomId: b.roomid,
            room: {
              id: b.roomid,
              number: b.room_no,
              type: b.room_names || "Standard",
              floor: 0,
              capacity: 0,
              pricePerNight: parseFloat(b.roomrate),
              amenities: [],
              isAvailable: false,
              image: "",
            },
            checkIn: b.checkindate,
            checkOut: b.checkoutdate,
            nights: Math.ceil((new Date(b.checkoutdate).getTime() - new Date(b.checkindate).getTime()) / (1000 * 3600 * 24)) || 1,
            adults: parseInt(b.nuofpeople || "0"),
            children: parseInt(b.children || "0"),
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            paymentStatus: isPaid ? "Paid" : (paidAmount > 0 ? "Partial" : "Unpaid"),
            bookingStatus: bStatus,
            notes: "",
            createdAt: b.date_time,
            paymentMethod: "",
          };
        });
        setBookings(mapped);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
      
      // Real-time update every 30 seconds
      const interval = setInterval(fetchBookings, 30000);
      
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.guest.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.room.number.includes(search);
    const matchTab = activeTab === "All" || b.bookingStatus === activeTab;
    return matchSearch && matchTab;
  });

  const stats = {
    total: bookings.length,
    checkedIn: bookings.filter((b) => b.bookingStatus === "Checked In").length,
    pending: bookings.filter((b) => b.bookingStatus === "Pending").length,
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      {/* Header */}
      <View className="px-5 pt-3 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-400 text-sm">Ashford Hotel</Text>
          <Text className={`${Typography.h3} text-primary dark:text-white`}>Bookings</Text>
        </View>
        {/* <TouchableOpacity
          onPress={() => router.push("/bookings/new")}
          className="flex-row items-center bg-accent px-4 py-2.5 rounded-2xl"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white font-bold text-sm ml-1">Add New</Text>
        </TouchableOpacity> */}
      </View>

      {/* Stats Row */}
      <View className="flex-row px-5 mb-3 mt-1">
        <View className="flex-1 bg-primary dark:bg-surface-dark rounded-2xl p-3 mr-2 items-center">
          <Text className="text-white font-bold text-xl">{stats.total}</Text>
          <Text className="text-gray-400 text-xs mt-0.5">Total</Text>
        </View>
        <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-3 mr-2 items-center">
          <Text className="text-emerald-600 font-bold text-xl">{stats.checkedIn}</Text>
          <Text className="text-emerald-600 text-xs mt-0.5">In-House</Text>
        </View>
        <View className="flex-1 bg-amber-50 dark:bg-amber-900/30 rounded-2xl p-3 items-center">
          <Text className="text-amber-600 font-bold text-xl">{stats.pending}</Text>
          <Text className="text-amber-600 text-xs mt-0.5">Pending</Text>
        </View>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl px-4 h-11 mx-5 mt-1 mb-2">
        <Ionicons name="search" size={18} color={isDark ? "#4B5563" : "#9CA3AF"} />
        <TextInput
          className="flex-1 ml-2 text-primary dark:text-white text-sm"
          placeholder="Search by name, ID or room..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />
        {search !== "" && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={{ height: 42 }} className="mb-1">
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(t) => t}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: 16, paddingRight: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveTab(item)}
              className={`px-4 py-2 rounded-full mr-2 ${activeTab === item ? "bg-accent" : "bg-gray-100 dark:bg-surface-dark"}`}
            >
              <Text className={`font-semibold text-xs ${activeTab === item ? "text-white" : "text-gray-500"}`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Booking List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => b.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={(b) => router.push(`/bookings/${b.id}`)} />
          )}
          ListEmptyComponent={() => (
            <View className="items-center mt-20">
              <Ionicons name="calendar-outline" size={64} color="#E5E7EB" />
              <Text className="text-gray-400 text-base font-medium mt-4">No bookings found</Text>
              <Text className="text-gray-300 text-sm mt-1">Try adjusting your search or filters</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
