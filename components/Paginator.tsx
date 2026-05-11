import React from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Colors } from "../constants/Colors";
import { useTheme } from "../hooks/useTheme";

interface PaginatorProps {
  data: any[];
  scrollX: Animated.SharedValue<number>;
}

export const Paginator = ({ data, scrollX }: PaginatorProps) => {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  return (
    <View className="flex-row h-16 items-center justify-center">
      {data.map((_, i) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = interpolate(
            scrollX.value,
            inputRange,
            [10, 20, 10],
            Extrapolation.CLAMP
          );

          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.3, 1, 0.3],
            Extrapolation.CLAMP
          );

          return {
            width: dotWidth,
            opacity,
          };
        });

        return (
          <Animated.View
            key={i.toString()}
            className="h-2.5 rounded-full mx-1.5"
            style={[
              { backgroundColor: colors.accent },
              animatedStyle,
            ]}
          />
        );
      })}
    </View>
  );
};
