import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export const Input = ({ label, error, icon, isPassword, ...props }: InputProps) => {
  const { colors, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-gray-50 dark:bg-surface-dark border ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-800"
        } rounded-xl px-4 h-14`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isDark ? "#9BA1A6" : "#687076"}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          className="flex-1 text-primary dark:text-white text-base"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={isDark ? "#9BA1A6" : "#687076"}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}
    </View>
  );
};
