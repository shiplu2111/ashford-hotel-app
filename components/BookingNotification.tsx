import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ENDPOINTS } from '../constants/Api';
import { Typography } from '../constants/Typography';

const { width } = Dimensions.get('window');

export const BookingNotification = () => {
  const [notification, setNotification] = useState<any>(null);
  const [lastBookingId, setLastBookingId] = useState<number | null>(null);
  const translateY = useRef(new Animated.Value(-150)).current;
  const router = useRouter();

  const checkForNewBookings = async () => {
    try {
      const response = await fetch(ENDPOINTS.ADMIN_BOOKINGS);
      const json = await response.json();
      
      if (json.status === 'success' && json.data.length > 0) {
        const latest = json.data[0]; // Assuming API returns sorted by ID DESC
        const latestId = parseInt(latest.bookedid);
        
        // On first load, just set the last ID
        if (lastBookingId === null) {
          setLastBookingId(latestId);
          return;
        }
        
        // If there's a new ID
        if (latestId > lastBookingId) {
          setLastBookingId(latestId);
          showNotification(latest);
        }
      }
    } catch (error) {
      console.error('Notification Polling Error:', error);
    }
  };

  const showNotification = (booking: any) => {
    setNotification(booking);
    
    // Slide In
    Animated.spring(translateY, {
      toValue: 20,
      useNativeDriver: true,
      bounciness: 12,
    }).start();

    // Auto Hide after 8 seconds
    setTimeout(() => {
      hideNotification();
    }, 8000);
  };

  const hideNotification = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setNotification(null));
  };

  useEffect(() => {
    // Initial check
    checkForNewBookings();
    
    // Poll every 10 seconds for real-time feel
    const interval = setInterval(checkForNewBookings, 10000);
    return () => clearInterval(interval);
  }, [lastBookingId]);

  if (!notification) return null;

  return (
    <Animated.View 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 20, 
        right: 20, 
        zIndex: 9999,
        transform: [{ translateY }]
      }}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
            hideNotification();
            router.push(`/bookings/${notification.bookedid}`);
        }}
        className="bg-white/95 dark:bg-gray-900/95 rounded-[28px] p-4 flex-row items-center shadow-2xl border border-gray-100 dark:border-gray-800"
        style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
        }}
      >
        <View className="bg-amber-50 dark:bg-amber-900/20 w-12 h-12 rounded-2xl items-center justify-center mr-3">
          <Ionicons name="calendar" size={24} color="#c5a059" />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-red-500 text-xs mr-1">📅</Text>
            <Text className="text-primary dark:text-white font-bold text-sm">
                New Booking — Room {notification.room_no || 'TBA'}
            </Text>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5" numberOfLines={1}>
            {notification.firstname} {notification.lastname} • {notification.room_names} • Check-in {notification.checkindate}
          </Text>
        </View>

        <TouchableOpacity onPress={hideNotification} className="p-2">
            <Ionicons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};
