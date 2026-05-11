import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../../constants/Typography";
import { useTheme } from "../../hooks/useTheme";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "New Restaurant Order",
    description: "Table 14 has placed a new order for Truffle Pasta.",
    time: "2m ago",
    type: "order",
    isRead: false,
  },
  {
    id: "2",
    title: "Room Booking Confirmed",
    description: "Presidential Suite booking for James Bond is now confirmed.",
    time: "15m ago",
    type: "booking",
    isRead: false,
  },
  {
    id: "3",
    title: "System Update",
    description: "The Ashford management system will undergo maintenance tonight.",
    time: "1h ago",
    type: "system",
    isRead: true,
  },
  {
    id: "4",
    title: "Revenue Milestone",
    description: "Congratulations! You have reached your daily revenue goal.",
    time: "3h ago",
    type: "alert",
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return "restaurant";
      case "booking": return "calendar";
      case "system": return "settings";
      default: return "notifications";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="px-6 pt-4 mb-4 flex-row justify-between items-center">
        <Text className={`${Typography.h3} text-primary dark:text-white`}>Notifications</Text>
        <TouchableOpacity>
          <Text className="text-accent font-semibold">Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className={`flex-row items-center p-4 mx-6 mb-3 rounded-2xl border ${
              item.isRead ? "bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800" : "bg-accent/5 border-accent/20"
            }`}
          >
            <View className={`p-3 rounded-xl mr-4 ${item.isRead ? "bg-gray-50 dark:bg-gray-800" : "bg-accent/10"}`}>
              <Ionicons name={getIcon(item.type) as any} size={22} color={item.isRead ? colors.icon : colors.accent} />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className={`text-sm ${item.isRead ? "text-gray-500 font-medium" : "text-primary dark:text-white font-bold"}`}>
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-[10px]">{item.time}</Text>
              </View>
              <Text className="text-gray-400 text-xs leading-4" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            {!item.isRead && (
              <View className="w-2 h-2 bg-accent rounded-full ml-2" />
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
