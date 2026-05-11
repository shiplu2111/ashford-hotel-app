import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Room } from "../../constants/BookingData";

interface RoomCardProps {
  room: Room;
  onPress?: (room: Room) => void;
  selected?: boolean;
}

export const RoomCard = ({ room, onPress, selected }: RoomCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(room)}
      className={`bg-white dark:bg-surface-dark rounded-3xl mb-4 overflow-hidden border-2 ${
        selected ? "border-accent" : "border-transparent"
      } shadow-sm`}
    >
      <Image
        source={{ uri: room.image }}
        style={{ width: "100%", height: 160 }}
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-primary dark:text-white font-bold text-base">
              Room {room.number}
            </Text>
            <Text className="text-accent text-sm font-semibold">{room.type}</Text>
          </View>
          <View>
            <View
              className={`px-2.5 py-1 rounded-full ${
                room.isAvailable ? "bg-emerald-100" : "bg-rose-100"
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  room.isAvailable ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {room.isAvailable ? "AVAILABLE" : "OCCUPIED"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <Ionicons name="people-outline" size={14} color="#9CA3AF" />
          <Text className="text-gray-500 text-sm ml-1">Up to {room.capacity} guests</Text>
          <Text className="text-gray-300 mx-2">·</Text>
          <Ionicons name="layers-outline" size={14} color="#9CA3AF" />
          <Text className="text-gray-500 text-sm ml-1">Floor {room.floor}</Text>
        </View>

        <View className="flex-row flex-wrap mb-3">
          {room.amenities.slice(0, 4).map((a) => (
            <View key={a} className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg mr-1 mb-1">
              <Text className="text-gray-500 text-[10px]">{a}</Text>
            </View>
          ))}
          {room.amenities.length > 4 && (
            <View className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg mr-1 mb-1">
              <Text className="text-gray-500 text-[10px]">+{room.amenities.length - 4}</Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-gray-50 dark:border-gray-800">
          <Text className="text-gray-400 text-sm">Per night</Text>
          <Text className="text-primary dark:text-white font-bold text-lg">
            ${room.pricePerNight}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
