import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Typography } from "../constants/Typography";
import { Button } from "../components/ui/Button";
import { useTheme } from "../hooks/useTheme";

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [avatarUri, setAvatarUri] = useState<string>(
    "https://i.pravatar.cc/150?u=ashford"
  );
  const [form, setForm] = useState({
    fullName: "Alexander Ashford",
    email: "a.ashford@luxury-stay.com",
    phone: "+44 20 7123 4567",
    staffId: "ASH-GM-001",
    department: "Administration",
    joinDate: "Jan 12, 2022",
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to change your avatar."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleChange = (key: keyof typeof form, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-row items-center px-6 pt-4 mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#1a1f2c"} />
        </TouchableOpacity>
        <Text className={`${Typography.h3} text-primary dark:text-white`}>
          Personal Info
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="relative">
            <Image
              source={{ uri: avatarUri }}
              className="w-28 h-28 rounded-[36px] border-4 border-accent"
            />
            <TouchableOpacity
              onPress={pickImage}
              className="absolute bottom-0 right-0 bg-primary p-2 rounded-2xl border-4 border-white dark:border-background-dark"
            >
              <Ionicons name="camera" size={18} color="#c5a059" />
            </TouchableOpacity>
          </View>
          <Text className={`${Typography.h3} text-primary dark:text-white mt-3`}>
            {form.fullName}
          </Text>
          <View className="bg-accent/10 px-4 py-1.5 rounded-full mt-2 border border-accent/20">
            <Text className="text-accent font-bold text-xs">GENERAL MANAGER</Text>
          </View>
        </View>

        {/* Contact Info */}
        <Text className="text-gray-400 font-bold text-xs tracking-widest mb-4">
          CONTACT INFORMATION
        </Text>
        <ProfileField
          label="Full Name"
          value={form.fullName}
          icon="person-outline"
          onChangeText={(v) => handleChange("fullName", v)}
        />
        <ProfileField
          label="Email Address"
          value={form.email}
          icon="mail-outline"
          keyboardType="email-address"
          onChangeText={(v) => handleChange("email", v)}
        />
        <ProfileField
          label="Phone Number"
          value={form.phone}
          icon="call-outline"
          keyboardType="phone-pad"
          onChangeText={(v) => handleChange("phone", v)}
        />

        {/* Hotel Details */}
        <Text className="text-gray-400 font-bold text-xs tracking-widest mt-4 mb-4">
          HOTEL DETAILS
        </Text>
        <ProfileField
          label="Staff ID"
          value={form.staffId}
          icon="card-outline"
          editable={false}
          onChangeText={() => {}}
        />
        <ProfileField
          label="Department"
          value={form.department}
          icon="business-outline"
          onChangeText={(v) => handleChange("department", v)}
        />
        <ProfileField
          label="Join Date"
          value={form.joinDate}
          icon="calendar-outline"
          editable={false}
          onChangeText={() => {}}
        />

        <Button
          title="Save Changes"
          onPress={() => router.back()}
          className="mt-6 mb-12"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onChangeText: (val: string) => void;
  editable?: boolean;
  keyboardType?: any;
}

const ProfileField = ({
  label,
  value,
  icon,
  onChangeText,
  editable = true,
  keyboardType = "default",
}: ProfileFieldProps) => {
  const { isDark } = useTheme();

  return (
    <View className="mb-4">
      <Text className="text-gray-400 text-xs mb-1.5 ml-1">{label}</Text>
      <View
        className={`flex-row items-center border rounded-2xl px-4 h-14 ${
          editable
            ? "bg-gray-50 dark:bg-surface-dark border-gray-100 dark:border-gray-800"
            : "bg-gray-100 dark:bg-gray-800 border-gray-100 dark:border-gray-800"
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={editable ? "#c5a059" : "#9CA3AF"}
          style={{ marginRight: 12 }}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          className="flex-1 text-primary dark:text-white font-medium text-base"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
        />
        {!editable && (
          <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
        )}
      </View>
    </View>
  );
};
