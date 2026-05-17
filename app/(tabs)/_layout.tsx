import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, BackHandler, Platform, Text, View } from "react-native";
import {
  registerBackgroundFetch,
  useOrderNotifications,
} from "../../hooks/useOrderNotifications";
import { 
  registerBookingBackgroundFetch, 
  useBookingNotifications 
} from "../../hooks/useBookingNotifications";
import { useTheme } from "../../hooks/useTheme";
import { BookingNotification } from "../../components/BookingNotification";
import { DeviceEventEmitter } from "react-native";
import { useAlertStatus } from "../../hooks/useAlertStatus";

export default function TabLayout() {
  const { colors } = useTheme();
  const { pendingCount } = useOrderNotifications();
  const { hasUnread } = useAlertStatus();
  useBookingNotifications(); // Initialize foreground listener
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "web") {
      registerBackgroundFetch();
      registerBookingBackgroundFetch();
    }
  }, []);

  useEffect(() => {
    // Listener for opening booking details from notification
    const sub = DeviceEventEmitter.addListener('OPEN_BOOKING_DETAILS', (id) => {
        router.push(`/bookings/${id}`);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const backAction = () => {
      // Only show exit alert if we are on the Home tab
      if (pathname === "/" || pathname === "/index") {
        Alert.alert("Exit App", "Are you sure you want to exit the app?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
      
      // For all other pages, let the default back behavior happen
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [pathname]);

  return (
    <View className="flex-1">
      <BookingNotification />
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.icon,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons
                name={focused ? "restaurant" : "restaurant-outline"}
                size={22}
                color={color}
              />
              {pendingCount > 0 && (
                <View className="absolute -top-1 -right-2 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center px-1 border-2 border-white dark:border-surface-dark">
                  <Text className="text-[8px] text-white font-bold">
                    {pendingCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons
                name={hasUnread || focused ? "notifications" : "notifications-outline"}
                size={22}
                color={color}
              />
              {hasUnread && (
                <View className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark" />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
