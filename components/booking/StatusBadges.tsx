import React from "react";
import { View, Text } from "react-native";
import { BookingStatus, PaymentStatus } from "../../constants/BookingData";

const BOOKING_STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
  Pending:     { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  Confirmed:   { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  "Checked In":  { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Checked Out": { bg: "bg-gray-100",    text: "text-gray-600",    dot: "bg-gray-400"    },
  Cancelled:   { bg: "bg-rose-100",    text: "text-rose-700",    dot: "bg-rose-500"    },
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  Paid:    { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Partial: { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  Unpaid:  { bg: "bg-rose-100",    text: "text-rose-700",    dot: "bg-rose-500"    },
};

export const BookingStatusBadge = ({ status }: { status: BookingStatus }) => {
  const s = BOOKING_STATUS_STYLES[status];
  return (
    <View className={`flex-row items-center px-2.5 py-1 rounded-full ${s.bg}`}>
      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${s.dot}`} />
      <Text className={`text-[10px] font-bold ${s.text}`}>{status.toUpperCase()}</Text>
    </View>
  );
};

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const s = PAYMENT_STATUS_STYLES[status];
  return (
    <View className={`flex-row items-center px-2 py-0.5 rounded-lg ${s.bg}`}>
      <Text className={`text-[10px] font-bold ${s.text}`}>{status}</Text>
    </View>
  );
};
