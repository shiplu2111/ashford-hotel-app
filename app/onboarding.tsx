import React, { useRef, useState } from "react";
import { View, FlatList, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { ONBOARDING_DATA } from "../constants/OnboardingData";
import { OnboardingItem } from "../components/OnboardingItem";
import { Paginator } from "../components/Paginator";
import { Typography } from "../constants/Typography";

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const slidesRef = useRef<FlatList>(null);
  const router = useRouter();

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const skip = () => {
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-background-dark">
      <View className="flex-1">
        <View className="flex-row justify-end px-6 pt-4">
          <TouchableOpacity onPress={skip}>
            <Text className="text-gray-400 font-medium text-base">Skip</Text>
          </TouchableOpacity>
        </View>

        <Animated.FlatList
          data={ONBOARDING_DATA}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={onScroll}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
          ref={slidesRef as any}
        />

        <View className="pb-12 items-center">
          <Paginator data={ONBOARDING_DATA} scrollX={scrollX} />
          
          <TouchableOpacity
            onPress={scrollToNext}
            className="bg-primary dark:bg-accent w-4/5 h-14 rounded-2xl items-center justify-center shadow-lg mt-4"
          >
            <Text className="text-white font-bold text-lg">
              {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
