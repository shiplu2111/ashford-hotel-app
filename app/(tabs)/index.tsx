import React, { useState, useCallback } from "react";
import { View, ScrollView, StatusBar, RefreshControl, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { RevenueCard } from "../../components/dashboard/RevenueCard";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { SectionHeader, ActivityCard } from "../../components/dashboard/SharedComponents";
import { useTheme } from "../../hooks/useTheme";
import { ENDPOINTS } from "../../constants/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen() {
  const { isDark, colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(ENDPOINTS.ADMIN_DASHBOARD_SUMMARY);
      const json = await response.json();
      if (json.status === "success") {
        setData(json.summary);
      }
      
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserName(user.fullname || "Admin Ashford");
        setAvatarUri(user.image);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#c5a059" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <DashboardHeader userName={String(userName)} avatarUri={avatarUri} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c5a059" />
        }
      >
        {/* Revenue Card */}
        <RevenueCard 
            amount={`$${String(data?.total_revenue || "0.00")}`} 
            percentage="Live" 
            isUp={true} 
        />
        
        {/* Booking Stats */}
        <SectionHeader title="Booking Summary" />
        <View className="flex-row px-5">
          <StatsCard label="Pending" value={String(data?.pending_bookings || "0")} icon="time" color="#f59e0b" />
          <StatsCard label="In-House" value={String(data?.active_bookings || "0")} icon="people" color="#c5a059" />
          <StatsCard label="Done" value={String(data?.completed_bookings || "0")} icon="checkmark-done-circle" color="#10b981" />
        </View>

        {/* Today's Check-ins */}
        <SectionHeader 
          title="Today's Check-ins" 
          actionLabel={`See ${data?.lists?.today_checkins?.length || 0}`} 
          onAction={() => router.push("/bookings")} 
        />
        {data?.lists?.today_checkins?.slice(0, 3).map((item: any) => (
          <ActivityCard 
            key={`today-${item.bookedid}`}
            title={`${item.firstname} ${item.lastname}`}
            subtitle={`Room: ${item.room_no || 'TBA'} · Phone: ${item.cust_phone}`}
            time="Today"
            icon="enter"
            color="#10b981"
            onPress={() => router.push(`/bookings/${item.bookedid}`)}
          />
        ))}
        {(!data?.lists?.today_checkins || data.lists.today_checkins.length === 0) && (
          <Text className="text-gray-400 text-center italic py-2">No check-ins today</Text>
        )}

        {/* Today's Check-outs */}
        <SectionHeader 
          title="Today's Departures" 
          actionLabel={`See ${data?.lists?.today_checkouts?.length || 0}`} 
        />
        {data?.lists?.today_checkouts?.slice(0, 3).map((item: any) => (
          <ActivityCard 
            key={`out-${item.bookedid}`}
            title={`${item.firstname} ${item.lastname}`}
            subtitle={`Room: ${item.room_no || 'TBA'}`}
            time="Check-out"
            icon="exit"
            color="#ef4444"
            onPress={() => router.push(`/bookings/${item.bookedid}`)}
          />
        ))}
        {(!data?.lists?.today_checkouts || data.lists.today_checkouts.length === 0) && (
          <Text className="text-gray-400 text-center italic py-2">No check-outs today</Text>
        )}

        {/* Tomorrow's Arrivals */}
        <SectionHeader 
          title="Tomorrow's Arrivals" 
          actionLabel={`See ${data?.lists?.tomorrow_checkins?.length || 0}`} 
        />
        {data?.lists?.tomorrow_checkins?.slice(0, 3).map((item: any) => (
          <ActivityCard 
            key={`tom-${item.bookedid}`}
            title={`${item.firstname} ${item.lastname}`}
            subtitle={`Room Type: ${item.room_names || 'TBA'}`}
            time="Tomorrow"
            icon="calendar"
            color="#3b82f6"
            onPress={() => router.push(`/bookings/${item.bookedid}`)}
          />
        ))}
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
