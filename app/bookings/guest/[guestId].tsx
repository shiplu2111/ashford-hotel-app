import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_GUESTS, MOCK_BOOKINGS } from "../../../constants/BookingData";
import { BookingStatusBadge, PaymentStatusBadge } from "../../../components/booking/StatusBadges";
import { Typography } from "../../../constants/Typography";
import { useTheme } from "../../../hooks/useTheme";

export default function GuestDetailsScreen() {
  const { guestId } = useLocalSearchParams<{ guestId: string }>();
  const router = useRouter();
  const { isDark } = useTheme();

  const guest = MOCK_GUESTS.find((g) => g.id === guestId);
  const guestBookings = MOCK_BOOKINGS.filter((b) => b.guestId === guestId);
  const totalSpent = guestBookings.reduce((s, b) => s + b.paidAmount, 0);

  if (!guest) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <Text className="text-gray-400">Guest not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary dark:text-white`}>Guest Profile</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-primary dark:bg-surface-dark rounded-3xl p-6 mb-5 items-center">
          <Image
            source={{ uri: guest.avatar }}
            className="w-24 h-24 rounded-[28px] border-4 border-accent mb-4"
          />
          <Text className="text-white text-xl font-bold">{guest.name}</Text>
          <Text className="text-gray-400 text-sm mt-1">{guest.nationality}</Text>
          <View className="flex-row mt-4 pt-4 border-t border-white/10 w-full justify-around">
            <View className="items-center">
              <Text className="text-accent text-xl font-bold">{guestBookings.length}</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Bookings</Text>
            </View>
            <View className="w-px bg-white/10" />
            <View className="items-center">
              <Text className="text-accent text-xl font-bold">${totalSpent.toLocaleString()}</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Total Spent</Text>
            </View>
            <View className="w-px bg-white/10" />
            <View className="items-center">
              <Text className="text-accent text-xl font-bold">VIP</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Status</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <Text className="text-gray-400 text-xs font-bold tracking-widest mb-3">CONTACT INFORMATION</Text>
        <View className="bg-gray-50 dark:bg-surface-dark rounded-3xl p-5 mb-5">
          {[
            { icon: "mail-outline", label: "Email", value: guest.email },
            { icon: "call-outline", label: "Phone", value: guest.phone },
            { icon: "card-outline", label: guest.idType, value: guest.idNumber },
            { icon: "globe-outline", label: "Nationality", value: guest.nationality },
          ].map((row, i) => (
            <View key={i} className={`flex-row items-center py-3 ${i > 0 ? "border-t border-gray-100 dark:border-gray-700" : ""}`}>
              <View className="w-9 h-9 bg-accent/10 rounded-xl items-center justify-center mr-4">
                <Ionicons name={row.icon as any} size={18} color="#c5a059" />
              </View>
              <View>
                <Text className="text-gray-400 text-[10px] font-bold">{row.label.toUpperCase()}</Text>
                <Text className="text-primary dark:text-white font-medium text-sm mt-0.5">{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Booking History */}
        <Text className="text-gray-400 text-xs font-bold tracking-widest mb-3">BOOKING HISTORY</Text>
        {guestBookings.length === 0 ? (
          <View className="items-center py-10">
            <Text className="text-gray-300">No bookings found</Text>
          </View>
        ) : (
          guestBookings.map((booking, i) => (
            <TouchableOpacity
              key={booking.id}
              onPress={() => router.push(`/bookings/${booking.id}`)}
              className="bg-gray-50 dark:bg-surface-dark rounded-2xl p-4 mb-3 flex-row items-center"
            >
              <View className="flex-1">
                <Text className="text-gray-400 text-[10px] font-bold">{booking.id}</Text>
                <Text className="text-primary dark:text-white font-semibold mt-0.5">
                  Room {booking.room.number} · {booking.nights} nights
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {booking.checkIn} → {booking.checkOut}
                </Text>
              </View>
              <View className="items-end">
                <BookingStatusBadge status={booking.bookingStatus} />
                <Text className="text-primary dark:text-white font-bold mt-2">
                  ${booking.totalAmount.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View className="mb-12" />
      </ScrollView>
    </SafeAreaView>
  );
}
