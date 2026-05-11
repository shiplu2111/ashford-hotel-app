import React from "react";
import { View, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { RevenueCard } from "../../components/dashboard/RevenueCard";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { SectionHeader, ActivityCard } from "../../components/dashboard/SharedComponents";
import { useTheme } from "../../hooks/useTheme";

export default function DashboardScreen() {
  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <DashboardHeader userName="Alexander Ashford" />
      
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <RevenueCard amount="$124,592.00" percentage="+12.5%" isUp={true} />
        
        <View className="flex-row px-5">
          <StatsCard label="Active Bookings" value="48" icon="calendar" color="#c5a059" />
          <StatsCard label="Check-ins" value="12" icon="enter" color="#10b981" />
          <StatsCard label="Pending" value="05" icon="time" color="#f59e0b" />
        </View>

        <SectionHeader 
          title="Restaurant Orders" 
          actionLabel="View Live" 
          onAction={() => {}} // Now handled in tab
        />
        <View className="flex-row px-5">
          <StatsCard label="Active" value="18" icon="restaurant" color="#3b82f6" />
          <StatsCard label="Kitchen" value="07" icon="flame" color="#ef4444" />
          <StatsCard label="Ready" value="03" icon="checkmark-circle" color="#10b981" />
        </View>

        <SectionHeader title="Recent Activities" actionLabel="History" />
        <ActivityCard 
          title="New Booking - Presidential Suite" 
          subtitle="Mr. James Bond • 4 Nights" 
          time="2m ago" 
          icon="add-circle" 
          color="#c5a059" 
        />
        <ActivityCard 
          title="Dinner Order - Table 12" 
          subtitle="Steak Tartare • Red Wine" 
          time="15m ago" 
          icon="restaurant" 
          color="#3b82f6" 
        />
        <ActivityCard 
          title="Checkout - Room 402" 
          subtitle="Mrs. Smith • Fully Paid" 
          time="1h ago" 
          icon="exit" 
          color="#ef4444" 
        />
        <ActivityCard 
          title="Maintenance - Pool Area" 
          subtitle="Chlorine check completed" 
          time="3h ago" 
          icon="build" 
          color="#6b7280" 
        />
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
