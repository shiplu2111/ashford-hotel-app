import React from "react";
import { View, Text, useWindowDimensions, Image } from "react-native";
import { OnboardingSlide } from "../constants/OnboardingData";
import { Typography } from "../constants/Typography";

interface OnboardingItemProps {
  item: OnboardingSlide;
}

export const OnboardingItem = ({ item }: OnboardingItemProps) => {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width }} className="flex-1 items-center justify-center p-8">
      <Image
        source={{ uri: item.image }}
        style={{ width: width * 0.8, height: width * 0.8, borderRadius: 30 }}
        resizeMode="cover"
        className="mb-10 shadow-xl"
      />
      <View className="items-center">
        <Text className={`${Typography.h1} text-primary dark:text-accent text-center mb-4`}>
          {item.title}
        </Text>
        <Text className={`${Typography.p} text-gray-500 text-center px-4 leading-6`}>
          {item.description}
        </Text>
      </View>
    </View>
  );
};
