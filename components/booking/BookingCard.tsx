import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Booking } from "../../constants/BookingData";
import { BookingStatusBadge, PaymentStatusBadge } from "./StatusBadges";

interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
}

export const BookingCard = ({ booking, onPress }: BookingCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(booking)}
      className="bg-white dark:bg-surface-dark rounded-3xl mx-5 mb-4 p-5 border border-gray-50 dark:border-gray-800 shadow-sm"
    >
      {/* Top row */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-3">
          <Text className="text-gray-400 text-[10px] font-bold tracking-widest mb-1">
            {booking.id}
          </Text>
          <Text className="text-primary dark:text-white text-base font-bold">
            {booking.guest.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="bed-outline" size={13} color="#c5a059" />
            <Text className="text-accent text-xs font-bold ml-1">
              Room {booking.room.number} · {booking.room.type}
            </Text>
          </View>
        </View>
        <BookingStatusBadge status={booking.bookingStatus} />
      </View>

      {/* Dates */}
      <View className="flex-row bg-gray-50 dark:bg-gray-900 rounded-2xl p-3 mb-4">
        <View className="flex-1 items-center">
          <Text className="text-gray-400 text-[10px] font-bold mb-1">CHECK IN</Text>
          <Text className="text-primary dark:text-white font-bold text-sm">{booking.checkIn}</Text>
        </View>
        <View className="w-px bg-gray-200 dark:bg-gray-700 mx-2" />
        <View className="flex-1 items-center">
          <Text className="text-gray-400 text-[10px] font-bold mb-1">NIGHTS</Text>
          <Text className="text-accent font-bold text-sm">{booking.nights}N</Text>
        </View>
        <View className="w-px bg-gray-200 dark:bg-gray-700 mx-2" />
        <View className="flex-1 items-center">
          <Text className="text-gray-400 text-[10px] font-bold mb-1">CHECK OUT</Text>
          <Text className="text-primary dark:text-white font-bold text-sm">{booking.checkOut}</Text>
        </View>
      </View>

      {/* Bottom row */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={15} color="#9CA3AF" />
          <Text className="text-gray-500 text-sm ml-1">
            {booking.adults + booking.children} Guests
          </Text>
        </View>
        <View className="flex-row items-center">
          <PaymentStatusBadge status={booking.paymentStatus} />
          <Text className="text-primary dark:text-white font-bold text-base ml-2">
            ${booking.totalAmount.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
