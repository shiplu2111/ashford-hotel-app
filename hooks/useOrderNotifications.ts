import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { useAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { ENDPOINTS } from '../constants/Api';

const BACKGROUND_ORDER_TASK = 'background-order-check';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useOrderNotifications() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [user, setUser] = useState<any>(null);
  const lastOrderIdRef = useRef<number | null>(null);

  // Initialize sound player using modern expo-audio
  const player = useAudioPlayer(require('../assets/sounds/notification.mp3'));

  useEffect(() => {
    if (player) {
        player.looping = true;
    }
  }, [player]);

  // Load user from storage
  useEffect(() => {
    async function loadUser() {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    loadUser();
  }, []);

  // Request permissions and handle response
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    }
    requestPermissions();

    // Listener for when user clicks on a notification
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const orderId = response.notification.request.content.data.orderId;
      if (orderId) {
        // Emit event to be caught by OrdersTab
        DeviceEventEmitter.emit('OPEN_ORDER_DETAILS', orderId);
      }
    });

    return () => subscription.remove();
  }, []);

  const checkOrders = async () => {
    // Only check if user is admin
    if (!user || user.is_admin != 1) return;

    try {
      const response = await fetch(ENDPOINTS.ADMIN_CHECK_NEW_ORDERS);
      const text = await response.text();
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        return;
      }
      
      if (json.status === 'success') {
        const newCount = json.count;
        const latestOrder = json.latest_order;

        setPendingCount(newCount);

        // Trigger notification if there's a NEW order
        if (latestOrder && latestOrder.order_id !== lastOrderIdRef.current) {
          lastOrderIdRef.current = latestOrder.order_id;
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "New Order Received! 🍔",
              body: `Invoice: ${latestOrder.saleinvoice} - $${latestOrder.totalamount}`,
              data: { orderId: latestOrder.order_id },
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
          });

          // Trigger refresh in OrdersTab
          DeviceEventEmitter.emit('REFRESH_ORDERS');
        }

        // Alarm logic: Play sound if there are pending orders
        if (newCount > 0) {
          if (!isAlarmActive) {
            setIsAlarmActive(true);
            player.play();
          }
        } else {
          if (isAlarmActive) {
            setIsAlarmActive(false);
            player.pause();
          }
        }
      }
    } catch (error) {
      console.error('Error checking orders:', error);
    }
  };

  // Foreground Polling (every 5 seconds)
  useEffect(() => {
    if (!user) return;
    
    checkOrders(); // Initial check
    const interval = setInterval(checkOrders, 5000);
    return () => clearInterval(interval);
  }, [user, isAlarmActive]);

  return { pendingCount, isAlarmActive };
}

// Background Task Definition
TaskManager.defineTask(BACKGROUND_ORDER_TASK, async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return BackgroundTask.BackgroundFetchResult.NoData;
    
    const user = JSON.parse(userData);
    if (user.is_admin != 1) return BackgroundTask.BackgroundFetchResult.NoData;

    const response = await fetch(ENDPOINTS.ADMIN_CHECK_NEW_ORDERS);
    const json = await response.json();
    
    if (json.status === 'success' && json.count > 0) {
        const latestOrder = json.latest_order;
        await Notifications.scheduleNotificationAsync({
            content: {
              title: "PENDING ORDERS! 🚨",
              body: `You have ${json.count} orders waiting for acceptance.`,
              data: { orderId: latestOrder?.order_id },
              sound: true,
            },
            trigger: null,
        });
        return BackgroundTask.BackgroundTaskResult.Success;
    }
    return BackgroundTask.BackgroundTaskResult.Success; // Even if no data, we succeeded in checking
  } catch (error) {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// Register background task
export async function registerBackgroundFetch() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_ORDER_TASK);
    if (!isRegistered) {
        await BackgroundTask.registerTaskAsync(BACKGROUND_ORDER_TASK, {
            minimumInterval: 15,
        });
    }
  } catch (e) {
    console.error('Task registration failed', e);
  }
}
