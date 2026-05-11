import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MOCK_BOOKINGS } from "../../constants/BookingData";
import { BookingStatusBadge, PaymentStatusBadge } from "../../components/booking/StatusBadges";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";

const TIMELINE = [
  { label: "Booking Created", icon: "add-circle", done: true },
  { label: "Confirmed", icon: "checkmark-circle", done: true },
  { label: "Checked In", icon: "enter", done: false },
  { label: "Checked Out", icon: "exit", done: false },
];

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();

  const booking = MOCK_BOOKINGS.find((b) => b.id === id);

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <Text className="text-gray-400 text-base">Booking not found</Text>
      </SafeAreaView>
    );
  }

  const isActive = ["Confirmed", "Checked In"].includes(booking.bookingStatus);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      {/* Navbar */}
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary dark:text-white flex-1`}>{booking.id}</Text>
        <BookingStatusBadge status={booking.bookingStatus} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
        {/* Guest Info */}
        <View className="bg-primary dark:bg-surface-dark rounded-3xl p-5 mb-4">
          <Text className="text-gray-400 text-xs font-bold mb-3">GUEST</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-accent/20 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="person" size={24} color="#c5a059" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{booking.guest.name}</Text>
              <Text className="text-gray-400 text-sm">{booking.guest.email}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/bookings/guest/${booking.guestId}`)}>
              <Ionicons name="chevron-forward" size={20} color="#c5a059" />
            </TouchableOpacity>
          </View>
          <View className="flex-row mt-4 pt-4 border-t border-white/10">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">Phone</Text>
              <Text className="text-white text-sm font-medium mt-0.5">{booking.guest.phone}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">Nationality</Text>
              <Text className="text-white text-sm font-medium mt-0.5">{booking.guest.nationality}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">ID</Text>
              <Text className="text-white text-sm font-medium mt-0.5">{booking.guest.idNumber}</Text>
            </View>
          </View>
        </View>

        {/* Room + Dates */}
        <View className="bg-gray-50 dark:bg-surface-dark rounded-3xl p-5 mb-4">
          <Text className="text-gray-400 text-xs font-bold mb-3">ROOM & DATES</Text>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-primary dark:text-white font-bold text-base">
              Room {booking.room.number} — {booking.room.type}
            </Text>
            <TouchableOpacity onPress={() => router.push("/bookings/rooms")}>
              <Text className="text-accent text-sm font-semibold">Change</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-1">Check In</Text>
              <Text className="text-primary dark:text-white font-semibold">{booking.checkIn}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs mb-1">Duration</Text>
              <Text className="text-accent font-bold">{booking.nights} Nights</Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-gray-400 text-xs mb-1">Check Out</Text>
              <Text className="text-primary dark:text-white font-semibold">{booking.checkOut}</Text>
            </View>
          </View>
          <View className="flex-row mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Ionicons name="people-outline" size={15} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm ml-1">
              {booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ""}
            </Text>
            <Text className="text-gray-300 mx-2">·</Text>
            <Ionicons name="card-outline" size={15} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm ml-1">{booking.paymentMethod}</Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View className="bg-gray-50 dark:bg-surface-dark rounded-3xl p-5 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-400 text-xs font-bold">PAYMENT SUMMARY</Text>
            <PaymentStatusBadge status={booking.paymentStatus} />
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">${booking.room.pricePerNight} × {booking.nights} nights</Text>
            <Text className="text-primary dark:text-white text-sm font-medium">${booking.totalAmount}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">Amount Paid</Text>
            <Text className="text-emerald-600 text-sm font-medium">${booking.paidAmount}</Text>
          </View>
          <View className="flex-row justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <Text className="text-primary dark:text-white font-bold">Balance Due</Text>
            <Text className="text-rose-500 font-bold text-base">
              ${booking.totalAmount - booking.paidAmount}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View className="bg-gray-50 dark:bg-surface-dark rounded-3xl p-5 mb-4">
          <Text className="text-gray-400 text-xs font-bold mb-4">BOOKING TIMELINE</Text>
          {TIMELINE.map((step, idx) => (
            <View key={idx} className="flex-row items-start mb-3">
              <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${step.done ? "bg-accent" : "bg-gray-100 dark:bg-gray-800"}`}>
                <Ionicons name={step.icon as any} size={16} color={step.done ? "#fff" : "#9CA3AF"} />
              </View>
              <View className="flex-1 pt-1">
                <Text className={`text-sm font-semibold ${step.done ? "text-primary dark:text-white" : "text-gray-400"}`}>
                  {step.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Notes */}
        {booking.notes !== "" && (
          <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-3xl p-4 mb-4">
            <Text className="text-amber-700 text-xs font-bold mb-1">NOTES</Text>
            <Text className="text-amber-800 dark:text-amber-300 text-sm">{booking.notes}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="mb-10">
          {isActive && (
            <TouchableOpacity className="bg-primary dark:bg-accent h-14 rounded-2xl items-center justify-center mb-3">
              <Text className="text-white font-bold text-base">
                {booking.bookingStatus === "Confirmed" ? "Check In Guest" : "Check Out Guest"}
              </Text>
            </TouchableOpacity>
          )}
          {booking.bookingStatus === "Pending" && (
            <TouchableOpacity className="bg-accent h-14 rounded-2xl items-center justify-center mb-3">
              <Text className="text-white font-bold text-base">Confirm Booking</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => Alert.alert("Cancel Booking", "Are you sure?", [{ text: "No" }, { text: "Yes, Cancel", style: "destructive" }])}
            className="h-14 rounded-2xl items-center justify-center border border-rose-200 dark:border-rose-800"
          >
            <Text className="text-rose-500 font-bold text-base">Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
