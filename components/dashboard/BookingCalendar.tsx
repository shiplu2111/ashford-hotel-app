import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TouchableWithoutFeedback, 
  ScrollView, 
  StyleSheet 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Typography } from "../../constants/Typography";

interface RoomDetail {
  room_no: string;
  room_type: string;
  guest_name?: string;
  bookedid?: string;
  booking_number?: string;
}

interface DailyDetails {
  booked: RoomDetail[];
  free: RoomDetail[];
}

interface BookingCalendarProps {
  bookingsData: Record<string, number> | null;
  calendarDetails: Record<string, DailyDetails> | null;
}

export const BookingCalendar = ({ bookingsData, calendarDetails }: BookingCalendarProps) => {
  const router = useRouter();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[month];

  // Calendar logic
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 6 = Sat
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create grid items
  const daysArray: (number | null)[] = [];
  
  // Empty cells for padding before the 1st of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push(null);
  }

  // Actual day numbers
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  // Calculate monthly total rooms booked
  let totalBookedRooms = 0;
  if (bookingsData) {
    Object.keys(bookingsData).forEach(dateStr => {
      const dateParts = dateStr.split("-");
      if (
        parseInt(dateParts[0]) === year &&
        parseInt(dateParts[1]) === month + 1
      ) {
        totalBookedRooms += bookingsData[dateStr] || 0;
      }
    });
  }

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Click handler for a date cell
  const handleDatePress = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(formattedDate);
    setModalVisible(true);
  };

  // Get details for currently selected date
  const selectedDetails = selectedDate && calendarDetails ? calendarDetails[selectedDate] : null;
  const bookedCount = selectedDetails?.booked?.length || 0;
  const freeCount = selectedDetails?.free?.length || 0;

  // Format date readable e.g., "18 May 2026"
  const getReadableDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    const d = parseInt(parts[2]);
    const mIdx = parseInt(parts[1]) - 1;
    const y = parts[0];
    return `${d} ${monthNames[mIdx]} ${y}`;
  };

  return (
    <View className="px-6 my-2">
      <View className="p-5 rounded-3xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm">
        {/* Header section with Month and Year */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Occupancy Tracker</Text>
            <Text className="text-primary dark:text-white font-bold text-xl mt-0.5">
              {currentMonthName} {year}
            </Text>
          </View>
          
          <View className="flex-row items-center bg-accent/10 px-3 py-1.5 rounded-full">
            <Ionicons name="calendar" size={15} color="#c5a059" />
            <Text className="text-accent font-bold text-xs ml-1.5">
              {totalBookedRooms} Booked
            </Text>
          </View>
        </View>

        {/* Weekday Names Header */}
        <View className="flex-row justify-between mb-2">
          {weekdays.map((day, idx) => (
            <View key={`wk-${idx}`} className="w-[14%] items-center">
              <Text className="text-gray-400 dark:text-gray-500 font-semibold text-xs">{day}</Text>
            </View>
          ))}
        </View>

        {/* Days Grid */}
        <View className="flex-row flex-wrap">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return (
                <View key={`empty-${idx}`} className="w-[14%] aspect-square items-center justify-center my-0.5" />
              );
            }

            const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const count = bookingsData ? bookingsData[formattedDate] || 0 : 0;
            
            const isToday =
              now.getDate() === day &&
              now.getMonth() === month &&
              now.getFullYear() === year;

            return (
              <TouchableOpacity 
                key={`day-${day}`} 
                className="w-[14%] aspect-square items-center justify-center my-0.5 relative"
                onPress={() => handleDatePress(day)}
                activeOpacity={0.7}
              >
                <View 
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    isToday 
                      ? 'border-2 border-accent bg-accent/5' 
                      : count > 0 
                        ? 'bg-accent/10' 
                        : ''
                  }`}
                >
                  {/* Day Number */}
                  <Text 
                    className={`text-xs font-semibold ${
                      isToday 
                        ? 'text-accent font-bold' 
                        : count > 0 
                          ? 'text-primary dark:text-white font-bold' 
                          : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {day}
                  </Text>

                  {/* Booking count badge */}
                  {count > 0 && (
                    <View className="absolute -top-1 -right-1 bg-accent rounded-full min-w-[15px] h-[15px] px-1 items-center justify-center shadow-xs">
                      <Text className="text-white text-[8px] font-bold text-center">
                        {count}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend / Footnote */}
        <View className="flex-row justify-center items-center mt-3 pt-3 border-t border-gray-50 dark:border-gray-800/40">
          <View className="flex-row items-center mr-4">
            <View className="w-2.5 h-2.5 rounded-md bg-accent/15 border border-accent/20 mr-1.5" />
            <Text className="text-gray-400 text-[10px] font-medium">Booked Day</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-md border border-accent bg-accent/5 mr-1.5" />
            <Text className="text-gray-400 text-[10px] font-medium">Today</Text>
          </View>
        </View>
      </View>

      {/* Date Details Modal Popup (Bottom Sheet Styled) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 justify-end bg-black/60">
            <TouchableWithoutFeedback>
              <View className="bg-white dark:bg-surface-dark rounded-t-[40px] px-6 pt-4 pb-8 max-h-[80%] border-t border-gray-100 dark:border-gray-800 shadow-2xl">
                {/* Drag Handle Indicator */}
                <View className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full self-center mb-4" />

                {/* Header */}
                <View className="flex-row justify-between items-start mb-5">
                  <View>
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Room Status For</Text>
                    <Text className="text-xl font-bold text-primary dark:text-white mt-0.5">
                      {getReadableDate(selectedDate)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                  >
                    <Ionicons name="close" size={22} color="#9BA1A6" />
                  </TouchableOpacity>
                </View>

                {/* Summary Info */}
                <View className="flex-row mb-6">
                  <View className="flex-row items-center bg-red-500/10 px-3 py-1.5 rounded-full mr-3 border border-red-500/15">
                    <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                    <Text className="text-red-600 dark:text-red-400 font-bold text-xs">
                      {bookedCount} Booked
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/15">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    <Text className="text-green-600 dark:text-green-400 font-bold text-xs">
                      {freeCount} Free
                    </Text>
                  </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-grow-0">
                  {/* Booked Rooms Section */}
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Booked Rooms ({bookedCount})</Text>
                  {bookedCount === 0 ? (
                    <Text className="text-gray-400 dark:text-gray-500 text-xs italic mb-5 pl-2">No rooms booked on this day</Text>
                  ) : (
                    <View className="mb-5">
                      {selectedDetails?.booked.map((room, idx) => (
                        <TouchableOpacity
                          key={`booked-rm-${idx}`}
                          activeOpacity={0.7}
                          onPress={() => {
                            setModalVisible(false);
                            if (room.bookedid) {
                              router.push(`/bookings/${room.bookedid}`);
                            }
                          }}
                          className="flex-row items-center bg-red-500/5 dark:bg-red-500/5 border border-red-500/10 px-4 py-3 rounded-2xl mb-2"
                        >
                          <View className="px-3 py-1.5 rounded-xl bg-accent/15 items-center justify-center mr-3">
                            <Text className="text-accent font-bold text-xs">Room {room.room_no}</Text>
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center">
                              <Text className="text-primary dark:text-white font-semibold text-sm mr-2">{room.guest_name}</Text>
                              {room.booking_number && (
                                <Text className="text-[10px] text-gray-400 font-medium">#{room.booking_number}</Text>
                              )}
                            </View>
                            <Text className="text-gray-500 text-xs mt-0.5">{room.room_type}</Text>
                          </View>
                          <View className="flex-row items-center">
                            <Text className="text-[10px] font-bold text-accent mr-1">View Info</Text>
                            <Ionicons name="chevron-forward" size={14} color="#c5a059" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Free Rooms Section */}
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Available Rooms ({freeCount})</Text>
                  {freeCount === 0 ? (
                    <Text className="text-gray-400 dark:text-gray-500 text-xs italic mb-2 pl-2">No rooms free on this day</Text>
                  ) : (
                    <View className="mb-4">
                      {selectedDetails?.free.map((room, idx) => (
                        <View
                          key={`free-rm-${idx}`}
                          className="flex-row items-center bg-green-500/5 border border-green-500/10 px-4 py-3 rounded-2xl mb-2"
                        >
                          <View className="px-3 py-1.5 rounded-xl bg-green-500/15 items-center justify-center mr-3">
                            <Text className="text-green-600 dark:text-green-400 font-bold text-xs">Room {room.room_no}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-primary dark:text-white font-semibold text-sm">Available</Text>
                            <Text className="text-gray-500 text-xs mt-0.5">{room.room_type}</Text>
                          </View>
                          <View className="p-1 bg-green-500/20 rounded-full">
                            <Ionicons name="checkmark" size={16} color="#10b981" />
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
