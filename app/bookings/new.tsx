import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";

export default function NewBookingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [form, setForm] = useState({
    guestName: "",
    email: "",
    phone: "",
    checkIn: "2026-05-15",
    checkOut: "2026-05-18",
    adults: 2,
    children: 0,
    notes: "",
    paymentMethod: "Credit Card",
    selectedRoom: "205",
  });

  const nights = 3;
  const pricePerNight = 280;
  const total = nights * pricePerNight;

  const Section = ({ title }: { title: string }) => (
    <Text className="text-gray-400 text-xs font-bold tracking-widest mb-3 mt-5">{title}</Text>
  );

  const Field = ({ label, value, onChangeText, keyboardType = "default", placeholder }: any) => (
    <View className="mb-3">
      <Text className="text-gray-500 text-xs mb-1.5 ml-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        className="bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-primary dark:text-white text-sm"
      />
    </View>
  );

  const Counter = ({ label, value, onInc, onDec }: any) => (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800">
      <Text className="text-primary dark:text-white font-medium">{label}</Text>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onDec}
          className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center"
        >
          <Ionicons name="remove" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <Text className="text-primary dark:text-white font-bold text-base mx-4 w-5 text-center">{value}</Text>
        <TouchableOpacity
          onPress={onInc}
          className="w-9 h-9 bg-accent rounded-xl items-center justify-center"
        >
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary dark:text-white`}>New Booking</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Guest Info */}
          <Section title="GUEST INFORMATION" />
          <Field label="Full Name" value={form.guestName} onChangeText={(v: string) => setForm({ ...form, guestName: v })} placeholder="John Smith" />
          <Field label="Email" value={form.email} onChangeText={(v: string) => setForm({ ...form, email: v })} keyboardType="email-address" placeholder="john@email.com" />
          <Field label="Phone" value={form.phone} onChangeText={(v: string) => setForm({ ...form, phone: v })} keyboardType="phone-pad" placeholder="+1 234 567 8900" />

          {/* Room Selection */}
          <Section title="ROOM SELECTION" />
          <TouchableOpacity
            onPress={() => router.push("/bookings/rooms")}
            className="flex-row items-center bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-4 mb-3"
          >
            <Ionicons name="bed-outline" size={20} color="#c5a059" />
            <View className="flex-1 ml-3">
              <Text className="text-primary dark:text-white font-semibold">Room {form.selectedRoom} — Deluxe</Text>
              <Text className="text-gray-400 text-xs">Floor 2 · 2 Guests · $280/night</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Dates */}
          <Section title="DATES" />
          <View className="flex-row mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-gray-500 text-xs mb-1.5 ml-1">Check In</Text>
              <TouchableOpacity className="bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#c5a059" />
                <Text className="text-primary dark:text-white text-sm ml-2 font-medium">{form.checkIn}</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-500 text-xs mb-1.5 ml-1">Check Out</Text>
              <TouchableOpacity className="bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#c5a059" />
                <Text className="text-primary dark:text-white text-sm ml-2 font-medium">{form.checkOut}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guests */}
          <Section title="GUEST COUNT" />
          <View className="bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl px-4 mb-3">
            <Counter
              label="Adults"
              value={form.adults}
              onInc={() => setForm({ ...form, adults: form.adults + 1 })}
              onDec={() => form.adults > 1 && setForm({ ...form, adults: form.adults - 1 })}
            />
            <Counter
              label="Children"
              value={form.children}
              onInc={() => setForm({ ...form, children: form.children + 1 })}
              onDec={() => form.children > 0 && setForm({ ...form, children: form.children - 1 })}
            />
          </View>

          {/* Payment */}
          <Section title="PAYMENT METHOD" />
          <View className="flex-row mb-3">
            {["Credit Card", "Cash", "Bank Transfer"].map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setForm({ ...form, paymentMethod: m })}
                className={`flex-1 py-3 rounded-2xl items-center mr-2 border ${
                  form.paymentMethod === m
                    ? "bg-accent border-accent"
                    : "bg-gray-50 dark:bg-surface-dark border-gray-100 dark:border-gray-800"
                }`}
              >
                <Text className={`text-xs font-bold ${form.paymentMethod === m ? "text-white" : "text-gray-500"}`}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <Section title="NOTES" />
          <TextInput
            value={form.notes}
            onChangeText={(v) => setForm({ ...form, notes: v })}
            placeholder="Special requests or notes..."
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            multiline
            numberOfLines={3}
            className="bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 text-primary dark:text-white text-sm mb-4"
            style={{ textAlignVertical: "top", minHeight: 80 }}
          />

          {/* Summary Card */}
          <View className="bg-primary dark:bg-surface-dark rounded-3xl p-5 mb-4">
            <Text className="text-gray-400 text-xs font-bold mb-4">BOOKING SUMMARY</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400 text-sm">Room {form.selectedRoom}</Text>
              <Text className="text-white text-sm">${pricePerNight}/night</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400 text-sm">Duration</Text>
              <Text className="text-white text-sm">{nights} nights</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400 text-sm">Guests</Text>
              <Text className="text-white text-sm">{form.adults + form.children} total</Text>
            </View>
            <View className="flex-row justify-between pt-3 border-t border-white/10 mt-2">
              <Text className="text-white font-bold text-base">Total Amount</Text>
              <Text className="text-accent font-bold text-xl">${total}</Text>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-accent h-14 rounded-2xl items-center justify-center mb-12"
          >
            <Text className="text-white font-bold text-base">Create Booking</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
