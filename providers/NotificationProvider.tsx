import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "order" | "booking" | "payment" | "alert" | "system";

interface Toast {
  id: string;
  title: string;
  body: string;
  type: ToastType;
}

interface NotificationContextType {
  showToast: (title: string, body: string, type?: ToastType) => void;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const TOAST_META: Record<ToastType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  order:   { icon: "restaurant",   color: "#3b82f6", bg: "#EFF6FF" },
  booking: { icon: "calendar",     color: "#c5a059", bg: "#FFFBEB" },
  payment: { icon: "card",         color: "#8b5cf6", bg: "#F5F3FF" },
  alert:   { icon: "warning",      color: "#ef4444", bg: "#FEF2F2" },
  system:  { icon: "settings",     color: "#6b7280", bg: "#F9FAFB" },
};

function ToastBanner({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const meta = TOAST_META[toast.type];

  React.useEffect(() => {
    translateY.value = withSpring(insets.top + 8, { damping: 18, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 250 });

    const timer = setTimeout(() => {
      translateY.value = withTiming(-120, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDismiss)();
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.toastContainer, animStyle]}>
      <View style={[styles.toastInner, { backgroundColor: meta.bg }]}>
        <View style={[styles.iconBox, { backgroundColor: meta.color + "20" }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>
        <View style={styles.toastText}>
          <Text style={styles.toastTitle} numberOfLines={1}>{toast.title}</Text>
          <Text style={styles.toastBody} numberOfLines={2}>{toast.body}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, body: string, type: ToastType = "alert") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, body, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Matches old API so notifications screen doesn't need changes
  const sendLocalNotification = useCallback(async (title: string, body: string, data: any = {}) => {
    const type: ToastType = data?.notifType ?? "alert";
    showToast(title, body, type);
  }, [showToast]);

  return (
    <NotificationContext.Provider value={{ showToast, sendLocalNotification }}>
      {children}
      {toasts.map((toast) => (
        <ToastBanner
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    zIndex: 9999,
    elevation: 20,
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  toastText: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1f2c",
    marginBottom: 2,
  },
  toastBody: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
