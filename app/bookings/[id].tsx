import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BookingStatusBadge, PaymentStatusBadge } from "../../components/booking/StatusBadges";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";
import { ENDPOINTS } from "../../constants/Api";
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

type BookingStatus = "Pending" | "Confirmed" | "Checked In" | "Checked Out" | "Cancelled";

interface Booking {
  id: string;
  real_id: string; 
  booking_number: string;
  guest: {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    idNumber: string;
  };
  room: {
    number: string;
    type: string;
    typeId: string;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  bookingStatus: BookingStatus;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
  paymentMethod: string;
  totalAmount: number;
  paidAmount: number;
  roomRate: number;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  notes: string;
  paymentBreakdown: any[];
}

const mapStatusText = (text: string): BookingStatus => {
  const normalized = text?.toString().toLowerCase().trim();
  switch (normalized) {
    case "pending": return "Pending";
    case "success":
    case "completed": 
    case "0": return "Confirmed";
    case "check in":
    case "checked in":
    case "4": return "Checked In";
    case "checkout":
    case "checked out":
    case "5": return "Checked Out";
    case "cancel":
    case "released":
    case "1": return "Cancelled";
    default: return "Pending";
  }
};

const formatDateToAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  
  const [checkInForm, setCheckInForm] = useState({
    checkin_date: "",
    checkout_date: "",
    room_type: "",
    room_no: "",
    discount_amount: "0",
    discount_reason: "",
    payment_mode: "Cash",
    advance_amount: "0",
    paid_amount: "0",
    gift_card_code: "",
    gift_card_discount: 0,
    applied_gift_card_code: ""
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState({
    reason: "",
    charge: "0"
  });

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.ADMIN_BOOKING_DETAILS(id));
      const result = await response.json();
      
      if (result.status === "success") {
        const b = result.data;
        const totalAmount = parseFloat(b.gross_payable) || 0;
        const paidAmount = parseFloat(b.effective_paid) || 0;
        const balanceDue = totalAmount - paidAmount;
        const isPaid = Math.abs(balanceDue) < 0.1;

        const mapped: Booking = {
          id: b.booking_number,
          real_id: b.bookedid,
          booking_number: b.booking_number,
          guest: {
            name: `${b.firstname} ${b.lastname}`,
            email: b.email,
            phone: b.cust_phone,
            nationality: "N/A",
            idNumber: b.bookedid
          },
          room: {
            number: b.room_no || "N/A",
            type: b.room_names || "N/A",
            typeId: b.roomid
          },
          checkIn: b.checkindate,
          checkOut: b.checkoutdate,
          nights: parseInt(b.nights) || 1,
          adults: 1,
          children: 0,
          bookingStatus: mapStatusText(b.bookingstatus || b.bookingstatus_text),
          paymentStatus: isPaid ? "Paid" : (paidAmount > 0 ? "Partial" : "Unpaid"),
          paymentMethod: "N/A",
          totalAmount: totalAmount,
          paidAmount: paidAmount,
          roomRate: parseFloat(b.roomrate) || 0,
          subtotal: parseFloat(b.subtotal) || 0,
          taxAmount: parseFloat(b.tax_amount) || 0,
          serviceCharge: parseFloat(b.service_charge) || 0,
          notes: "",
          paymentBreakdown: b.payment_breakdown || []
        };
        setBooking(mapped);

        setCheckInForm(prev => ({
          ...prev,
          checkin_date: b.checkindate,
          checkout_date: b.checkoutdate,
          room_type: b.roomid,
          room_no: b.room_no,
          advance_amount: b.advance_amount || "0"
        }));

      } else {
        setError(result.message);
      }
    } catch (e) {
      setError("Network request failed");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const fetchAvailableRooms = async (typeId: string) => {
    try {
      const response = await fetch(`${ENDPOINTS.ADMIN_GET_AVAILABLE_ROOMS(typeId)}?checkin=${encodeURIComponent(checkInForm.checkin_date)}&checkout=${encodeURIComponent(checkInForm.checkout_date)}`);
      const result = await response.json();
      if (result.status === "success") setAvailableRooms(result.data);
    } catch (e) {}
  };

  useEffect(() => {
    if (showCheckInModal && checkInForm.room_type && booking?.bookingStatus !== "Checked In") {
      fetchAvailableRooms(checkInForm.room_type);
    }
  }, [checkInForm.room_type, checkInForm.checkin_date, checkInForm.checkout_date, showCheckInModal]);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch(ENDPOINTS.ADMIN_GET_ROOM_TYPES);
      const result = await response.json();
      if (result.status === "success") setRoomTypes(result.data);
    } catch (e) {}
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(ENDPOINTS.ADMIN_GET_PAYMENT_METHODS);
      const result = await response.json();
      if (result.status === "success") setPaymentMethods(result.data);
    } catch (e) {}
  };

  const handleApplyGiftCard = async () => {
    if (!checkInForm.gift_card_code) return;
    try {
        const response = await fetch(ENDPOINTS.ADMIN_VALIDATE_GIFT_CARD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gift_card_code: checkInForm.gift_card_code })
        });
        const result = await response.json();
        if (result.status === "success") {
            const availableBalance = parseFloat(result.balance);
            // Cap the gift card discount to the current required balance
            const currentReqBalance = (booking?.totalAmount || 0) - (booking?.paidAmount || 0);
            const appliedDiscount = Math.min(availableBalance, currentReqBalance);
            
            setCheckInForm(prev => {
                const newBalance = currentReqBalance - appliedDiscount;
                return { 
                    ...prev, 
                    gift_card_discount: appliedDiscount,
                    applied_gift_card_code: checkInForm.gift_card_code,
                    paid_amount: newBalance > 0 ? newBalance.toFixed(2) : "0"
                };
            });
            Alert.alert("Success", `Gift card applied: $${appliedDiscount.toFixed(2)} deducted.`);
        } else {
            Alert.alert("Error", result.message || "Invalid Gift Card");
        }
    } catch (e) {
        Alert.alert("Error", "Failed to validate gift card");
    }
  };

  const handleCheckIn = async () => {
    if (!checkInForm.room_no) return Alert.alert("Error", "Please select a room number");
    try {
      setFormLoading(true);
      const response = await fetch(ENDPOINTS.ADMIN_CHECK_IN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookedid: booking?.real_id,
          ...checkInForm,
          total_payable: booking?.totalAmount
        })
      });
      const result = await response.json();
      if (result.status === "success") {
        Alert.alert("Success", "Guest checked in successfully");
        setShowCheckInModal(false);
        fetchDetails();
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (e) {
      Alert.alert("Error", "Check-in failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(ENDPOINTS.ADMIN_CHECK_OUT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookedid: booking?.real_id,
          paid_amount: checkInForm.paid_amount,
          payment_mode: checkInForm.payment_mode,
          gift_card_discount: checkInForm.gift_card_discount,
          applied_gift_card_code: checkInForm.applied_gift_card_code
        })
      });
      const result = await response.json();
      if (result.status === "success") {
        Alert.alert("Success", "Guest checked out and rooms released.");
        setShowCheckInModal(false);
        fetchDetails();
      } else {
        Alert.alert("Error", result.message || "Check-out failed");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network request failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelForm.reason) return Alert.alert("Error", "Please provide a reason for cancellation");
    try {
      setFormLoading(true);
      const response = await fetch(ENDPOINTS.ADMIN_CANCEL_BOOKING, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookedid: booking?.real_id,
          cancel_reason: cancelForm.reason,
          cancellation_charge: cancelForm.charge
        })
      });
      const result = await response.json();
      if (result.status === "success") {
        Alert.alert("Success", "Booking cancelled successfully");
        setShowCancelModal(false);
        fetchDetails();
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to cancel booking");
    } finally {
      setFormLoading(false);
    }
  };

  const handleReleaseBooking = async () => {
    Alert.alert(
      "Release Booking",
      "Are you sure you want to release this booking? This will free up the room.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Release",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(ENDPOINTS.ADMIN_RELEASE_BOOKING, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookedid: booking?.real_id, release_status: 0 })
              });
              const result = await response.json();
              if (result.status === "success") {
                Alert.alert("Success", "Booking released successfully");
                fetchDetails();
              } else {
                Alert.alert("Error", result.message);
              }
            } catch (e) {
              Alert.alert("Error", "Failed to release booking");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenAction = () => {
    fetchRoomTypes();
    fetchPaymentMethods();
    const balance = (booking?.totalAmount || 0) - (booking?.paidAmount || 0);
    setCheckInForm({ 
        ...checkInForm, 
        checkin_date: booking?.checkIn || "",
        checkout_date: booking?.checkOut || "",
        room_type: booking?.room.typeId || "",
        room_no: booking?.room.number || "",
        paid_amount: balance > 0 ? balance.toFixed(2) : "0",
        payment_mode: "Cash",
        gift_card_discount: 0,
        gift_card_code: ""
    });
    setShowCheckInModal(true);
  };

  if (loading) return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
      <ActivityIndicator size="large" color="#c5a059" />
    </SafeAreaView>
  );

  if (error || !booking) return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark items-center justify-center p-5">
      <Ionicons name="alert-circle" size={48} color="#ef4444" />
      <Text className="text-rose-500 text-center mt-4 font-bold">{error || "Booking not found"}</Text>
      <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-primary px-8 py-3 rounded-xl">
        <Text className="text-white font-bold">Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const isActive = ["Pending", "Confirmed", "Checked In"].includes(booking.bookingStatus);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-5 pt-3 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary dark:text-white flex-1`}>{booking.id}</Text>
        <BookingStatusBadge status={booking.bookingStatus} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
        {/* Guest Info Card */}
        <View className="bg-primary dark:bg-surface-dark rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Guest Information</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="person" size={24} color="#c5a059" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{booking.guest.name}</Text>
              <Text className="text-white/60 text-sm">{booking.guest.email}</Text>
            </View>
          </View>
          <View className="flex-row mt-4 pt-4 border-t border-white/10">
            <View className="flex-1">
              <Text className="text-white/40 text-[10px] uppercase font-bold">Phone</Text>
              <Text className="text-white text-sm font-medium mt-0.5">{booking.guest.phone}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white/40 text-[10px] uppercase font-bold">Nationality</Text>
              <Text className="text-white text-sm font-medium mt-0.5">{booking.guest.nationality}</Text>
            </View>
          </View>
        </View>

        {/* Stay Details Card */}
        <View className="bg-gray-50 dark:bg-surface-dark rounded-3xl p-5 mb-4 border border-gray-100 dark:border-gray-800">
          <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">Stay Details</Text>
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-accent/10 rounded-lg items-center justify-center mr-2">
                    <Ionicons name="bed" size={16} color="#c5a059" />
                </View>
                <Text className="text-primary dark:text-white font-bold text-base">Room {booking.room.number}</Text>
            </View>
            <Text className="text-accent text-sm font-semibold">{booking.room.type}</Text>
          </View>
          
          <View className="flex-row justify-between items-center bg-white dark:bg-gray-800/50 p-4 rounded-2xl">
            <View className="flex-1">
              <Text className="text-gray-400 text-[10px] uppercase mb-1">Check In</Text>
              <Text className="text-primary dark:text-white font-bold text-sm">{booking.checkIn}</Text>
            </View>
            <View className="px-4 items-center">
              <View className="h-0.5 w-8 bg-accent/20 mb-1" />
              <Text className="text-accent text-[10px] font-black">{booking.nights}N</Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-gray-400 text-[10px] uppercase mb-1">Check Out</Text>
              <Text className="text-primary dark:text-white font-bold text-sm text-right">{booking.checkOut}</Text>
            </View>
          </View>
        </View>

        {/* Financials Card */}
        <View className="bg-gray-50 dark:bg-surface-dark rounded-3xl p-5 mb-4 border border-gray-100 dark:border-gray-800">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Financials</Text>
            <PaymentStatusBadge status={booking.paymentStatus} />
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">Total Amount</Text>
            <Text className="text-primary dark:text-white text-sm font-bold">${booking.totalAmount.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 text-sm">Total Paid</Text>
            <Text className="text-emerald-600 text-sm font-bold">${booking.paidAmount.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
            <Text className="text-primary dark:text-white font-black uppercase text-xs tracking-tighter">Balance Due</Text>
            <Text className="text-rose-500 font-black text-lg">${(booking.totalAmount - booking.paidAmount).toFixed(2)}</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mb-10">
          {isActive && (
            <TouchableOpacity 
              onPress={handleOpenAction}
              className="bg-accent dark:bg-accent h-16 rounded-3xl flex-row items-center justify-center mb-3 shadow-xl shadow-accent/40"
            >
              <Ionicons name={booking.bookingStatus === "Checked In" ? "log-out" : "checkmark-done-circle"} size={24} color="#fff" className="mr-2" />
              <Text className="text-white font-black text-base uppercase tracking-widest ml-2">
                {booking.bookingStatus === "Checked In" ? "Proceed to Check Out" : "Proceed to Check In"}
              </Text>
            </TouchableOpacity>
          )}
          <View className="flex-row space-x-3">
            <TouchableOpacity
                onPress={handleReleaseBooking}
                className="flex-1 h-16 rounded-2xl items-center justify-center border border-amber-200 dark:border-amber-800"
            >
                <Text className="text-amber-600 font-bold text-sm uppercase">Release</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setShowCancelModal(true)}
                className="flex-1 h-16 rounded-2xl items-center justify-center border border-rose-200 dark:border-rose-800"
            >
                <Text className="text-rose-500 font-bold text-sm uppercase">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Cancellation Modal */}
      <Modal visible={showCancelModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-background-dark rounded-t-[40px] h-[60%] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`${Typography.h2} dark:text-white`}>Cancel Booking</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close-circle" size={32} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Cancellation Reason</Text>
                <TextInput
                  value={cancelForm.reason}
                  onChangeText={(t) => setCancelForm({ ...cancelForm, reason: t })}
                  placeholder="Enter reason for cancellation"
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl dark:text-white text-sm min-h-[100px]"
                  textAlignVertical="top"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Cancellation Charge (Optional)</Text>
                <TextInput
                  value={cancelForm.charge}
                  keyboardType="numeric"
                  onChangeText={(t) => setCancelForm({ ...cancelForm, charge: t })}
                  className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl dark:text-white font-bold border border-rose-100 dark:border-rose-800"
                />
              </View>

              <TouchableOpacity
                onPress={handleCancelBooking}
                disabled={formLoading}
                className="bg-rose-500 h-16 rounded-2xl items-center justify-center shadow-lg shadow-rose-200 mb-10"
              >
                {formLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-black text-base uppercase tracking-widest">Confirm Cancellation</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Section */}
      <Modal visible={showCheckInModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-background-dark rounded-t-[40px] h-[90%] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`${Typography.h2} dark:text-white`}>
                {booking.bookingStatus === "Checked In" ? "Check-Out Process" : "Check-In Process"}
              </Text>
              <TouchableOpacity onPress={() => setShowCheckInModal(false)}>
                <Ionicons name="close-circle" size={32} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {booking.bookingStatus !== "Checked In" && (
                <View className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Room & Dates</Text>
                    <Text className="dark:text-white font-bold">{booking.room.type} - Room {booking.room.number}</Text>
                    <Text className="dark:text-gray-400 text-xs mt-1">{booking.checkIn} to {booking.checkOut}</Text>
                </View>
              )}

              <View className="mb-4">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Payment Mode</Text>
                <View className="flex-row flex-wrap">
                  {["Cash", "Gift Card", "Card Payment"].map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setCheckInForm({ ...checkInForm, payment_mode: mode })}
                      className={`mr-2 mb-2 px-6 py-2 rounded-full border ${checkInForm.payment_mode === mode ? "bg-accent border-accent" : "border-gray-200 dark:border-gray-700"}`}
                    >
                      <Text className={checkInForm.payment_mode === mode ? "text-white font-bold" : "text-gray-600 dark:text-gray-400"}>{mode}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {checkInForm.payment_mode === "Gift Card" && (
                <View className="mb-6 bg-accent/5 p-5 rounded-3xl border border-accent/10">
                    <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Gift Card Validation</Text>
                    <View className="flex-row space-x-2">
                        <TextInput
                            value={checkInForm.gift_card_code}
                            onChangeText={(t) => setCheckInForm({ ...checkInForm, gift_card_code: t })}
                            placeholder="Enter Code"
                            className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl dark:text-white"
                        />
                        <TouchableOpacity onPress={handleApplyGiftCard} className="bg-accent px-6 rounded-xl justify-center">
                            <Text className="text-white font-bold">Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
              )}

              <View className="mb-4">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Paying Now (Received Amount)</Text>
                <TextInput
                  value={checkInForm.paid_amount}
                  keyboardType="numeric"
                  onChangeText={(t) => {
                    const val = parseFloat(t) || 0;
                    const maxAllowed = (booking?.totalAmount || 0) - (booking?.paidAmount || 0) - checkInForm.gift_card_discount;
                    if (val > maxAllowed) {
                        setCheckInForm({ ...checkInForm, paid_amount: Math.max(0, maxAllowed).toFixed(2) });
                    } else {
                        setCheckInForm({ ...checkInForm, paid_amount: t });
                    }
                  }}
                  className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl dark:text-white font-bold border border-emerald-100 dark:border-emerald-800"
                />
              </View>

              {(() => {
                const subtotal = booking?.subtotal || 0;
                const tax = booking?.taxAmount || 0;
                const serviceCharge = booking?.serviceCharge || 0;
                const grossTotal = booking?.totalAmount || 0;
                const alreadyPaid = booking?.paidAmount || 0;
                const payingNow = parseFloat(checkInForm.paid_amount) || 0;
                const giftCardDisc = checkInForm.gift_card_discount || 0;
                const discount = parseFloat(checkInForm.discount_amount) || 0;

                const finalBalance = grossTotal - alreadyPaid - payingNow - giftCardDisc - discount;
                const isReady = finalBalance <= 0.01;

                return (
                  <View className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl mb-6">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400 text-xs">Room Subtotal ({booking?.nights} Nights)</Text>
                      <Text className="font-medium dark:text-white">${subtotal.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400 text-xs">Service Charge</Text>
                      <Text className="font-medium dark:text-white">${serviceCharge.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400 text-xs">Tax / VAT</Text>
                      <Text className="font-medium dark:text-white">${tax.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2 mb-2">
                      <Text className="text-gray-500 font-bold">Gross Total</Text>
                      <Text className="font-bold dark:text-white">${grossTotal.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-500">Already Paid</Text>
                      <Text className="font-bold text-emerald-600">-${alreadyPaid.toFixed(2)}</Text>
                    </View>
                    {giftCardDisc > 0 && (
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-accent font-bold">Gift Card Applied</Text>
                        <Text className="font-bold text-accent">-${giftCardDisc.toFixed(2)}</Text>
                      </View>
                    )}
                    <View className="flex-row justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <Text className="font-black dark:text-white uppercase">Outstanding Balance</Text>
                      <Text className={`font-black text-xl ${finalBalance > 0.01 ? "text-rose-500" : "text-emerald-500"}`}>
                        ${Math.max(0, finalBalance).toFixed(2)}
                      </Text>
                    </View>
                    
                    {booking.bookingStatus === "Checked In" && finalBalance > 0.01 && (
                        <View className="mt-3 bg-rose-50 dark:bg-rose-900/10 p-3 rounded-xl flex-row items-center">
                            <Ionicons name="alert-circle" size={16} color="#ef4444" />
                            <Text className="text-rose-600 text-[10px] font-bold ml-2">Please clear the full balance to complete the process.</Text>
                        </View>
                    )}
                  </View>
                );
              })()}

              <TouchableOpacity
                onPress={booking.bookingStatus === "Checked In" ? handleCheckOut : handleCheckIn}
                disabled={formLoading || (booking.bookingStatus === "Checked In" && ((booking?.totalAmount || 0) - (booking?.paidAmount || 0) - (parseFloat(checkInForm.paid_amount) || 0) - (checkInForm.gift_card_discount || 0) > 0.01))}
                className={`h-16 rounded-2xl items-center justify-center shadow-lg mb-10 ${(booking.bookingStatus === "Checked In" && ((booking?.totalAmount || 0) - (booking?.paidAmount || 0) - (parseFloat(checkInForm.paid_amount) || 0) - (checkInForm.gift_card_discount || 0) > 0.01)) ? "bg-gray-300 dark:bg-gray-800" : "bg-primary dark:bg-accent shadow-primary/20"}`}
              >
                {formLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-black text-base uppercase tracking-widest">
                    {booking.bookingStatus === "Checked In" ? "Complete Check-Out" : "Complete Check-In"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
