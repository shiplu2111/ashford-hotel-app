import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Typography } from "../constants/Typography";
import { Button } from "../components/ui/Button";
import { useTheme } from "../hooks/useTheme";
import { ENDPOINTS } from "../constants/Api";

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const [loading, setLoading] = useState(true);

  const [avatarUri, setAvatarUri] = useState<string>(
    "https://ui-avatars.com/api/?name=Admin+Ashford&background=c5a059&color=fff&size=128"
  );
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    staffId: "ASH-ADMIN",
    department: "Management",
    joinDate: "N/A",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setForm(prev => ({
          ...prev,
          fullName: user.fullname || "Admin Ashford",
          email: user.email || "",
        }));
        
        if (user.image && user.image.includes('/') && !user.image.endsWith('/')) {
            setAvatarUri(user.image);
        } else {
            // Fallback to initial using fullname
            const initialName = user.fullname ? user.fullname.replace(' ', '+') : "Admin+Ashford";
            setAvatarUri(`https://ui-avatars.com/api/?name=${initialName}&background=c5a059&color=fff&size=128`);
        }
      }
    } catch (e) {
      console.error("Load User Error:", e);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!form.fullName) {
      Alert.alert("Error", "Full Name is required");
      return;
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      const formData = new FormData();
      formData.append("id", user?.id);
      formData.append("fullname", form.fullName);

      if (avatarUri && (avatarUri.startsWith("file://") || avatarUri.startsWith("content://"))) {
        const filename = avatarUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename || "");
        const type = match ? `image/${match[1]}` : `image`;
        
        // @ts-ignore
        formData.append("image", {
          uri: avatarUri,
          name: filename || "avatar.jpg",
          type: type,
        });
      }

      const response = await fetch(ENDPOINTS.ADMIN_UPDATE_PROFILE, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Non-JSON response:", responseText);
        throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}`);
      }

      if (result.status === "success") {
        await AsyncStorage.setItem("user", JSON.stringify(result.user));
        Alert.alert("Success", "Profile updated successfully");
        router.back();
      } else {
        Alert.alert("Error", result.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Save Profile Error:", error);
      Alert.alert("Update Failed", error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

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
          <Text className={`${Typography.h3} text-primary dark:text-white mt-3 text-center`}>
            {form.fullName}
          </Text>
          <View className="bg-accent/10 px-4 py-1.5 rounded-full mt-2 border border-accent/20">
            <Text className="text-accent font-bold text-xs">ADMINISTRATOR</Text>
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
          editable={false}
          onChangeText={() => {}}
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
          editable={false}
          onChangeText={() => {}}
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
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
  secureTextEntry?: boolean;
}

const ProfileField = ({
  label,
  value,
  icon,
  onChangeText,
  editable = true,
  keyboardType = "default",
  secureTextEntry = false,
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
          secureTextEntry={secureTextEntry}
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
