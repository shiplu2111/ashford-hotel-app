import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  className?: string;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
  icon,
  className,
}: ButtonProps) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-primary dark:bg-accent";
      case "secondary":
        return "bg-accent";
      case "outline":
        return "bg-transparent border border-gray-200 dark:border-gray-800";
      case "ghost":
        return "bg-transparent";
      default:
        return "bg-primary";
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case "outline":
        return "text-primary dark:text-white";
      case "ghost":
        return "text-primary dark:text-accent";
      default:
        return "text-white";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${getVariantStyles()} h-14 rounded-xl items-center justify-center flex-row px-6 ${
        disabled ? "opacity-50" : ""
      } ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : "#fff"} />
      ) : (
        <>
          {icon}
          <Text className={`${getTextStyles()} font-bold text-base ${icon ? "ml-2" : ""}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
