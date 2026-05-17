import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen() {
  const router = useRouter();
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.2)),
    });
    logoOpacity.value = withTiming(1, { 
      duration: 600 
    }, (finished) => {
      if (finished) {
        runOnJS(navigateToNext)();
      }
    });
  }, []);

  const navigateToNext = async () => {
    try {
      const hasViewedOnboarding = await AsyncStorage.getItem("hasViewedOnboarding");
      setTimeout(() => {
        if (hasViewedOnboarding === "true") {
          router.replace("/(auth)/login");
        } else {
          router.replace("/onboarding");
        }
      }, 500);
    } catch (error) {
      setTimeout(() => {
        router.replace("/onboarding");
      }, 500);
    }
  };

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center">
        <Animated.View style={logoStyle} className="items-center">
          <Image
            source={require("../assets/images/T.png")}
            style={{ width: 300, height: 100 }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
