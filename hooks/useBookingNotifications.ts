import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter, Platform } from 'react-native';
import { ENDPOINTS } from '../constants/Api';

const BACKGROUND_BOOKING_TASK = 'background-booking-check';

export function useBookingNotifications() {
  const lastBookingIdRef = useRef<number | null>(null);

  const checkBookings = async () => {
    try {
      const response = await fetch(ENDPOINTS.ADMIN_CHECK_NEW_BOOKINGS);
      const text = await response.text();
      let json;
      try {
          json = JSON.parse(text);
      } catch (e) {
          console.log("JSON Parse Error in Notifications:", text.substring(0, 50));
          return;
      }
      
      if (json.status === 'success' && json.latest) {
        const latestId = parseInt(json.latest.bookedid);

        if (lastBookingIdRef.current === null) {
          lastBookingIdRef.current = latestId;
          await AsyncStorage.setItem('last_seen_booking_id', latestId.toString());
          return;
        }

        if (latestId > lastBookingIdRef.current) {
          lastBookingIdRef.current = latestId;
          await AsyncStorage.setItem('last_seen_booking_id', latestId.toString());
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "New Room Reservation! 🏨",
              body: `Guest: ${json.latest.firstname} ${json.latest.lastname} booked Room ${json.latest.room_no || 'TBA'}`,
              data: { bookedid: json.latest.bookedid },
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
          });
        }
      }
    } catch (error) {
      console.error('Error checking bookings:', error);
    }
  };

  useEffect(() => {
    // 1. Initial check
    checkBookings();
    
    // 2. Poll every 15s when app is open
    const interval = setInterval(checkBookings, 15000);

    // 3. TEST NOTIFICATION: Trigger once after 5s to verify system works
    const testTimeout = setTimeout(async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
              title: "Hotel System Active! ✅",
              body: "Notifications are ready to receive new bookings.",
              sound: 'default',
            },
            trigger: null,
        });
    }, 5000);
    
    return () => {
        clearInterval(interval);
        clearTimeout(testTimeout);
    };
  }, []);

  useEffect(() => {
    // Listener for when user clicks on a notification
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const bookedid = response.notification.request.content.data.bookedid;
      if (bookedid) {
        DeviceEventEmitter.emit('OPEN_BOOKING_DETAILS', bookedid);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    async function setupChannel() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('booking-alerts', {
          name: 'Booking Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          sound: 'default',
        });
      }
    }
    setupChannel();
  }, []);

  return {};
}

// Background Task Definition
TaskManager.defineTask(BACKGROUND_BOOKING_TASK, async () => {
  try {
    const response = await fetch(ENDPOINTS.ADMIN_CHECK_NEW_BOOKINGS);
    const json = await response.json();
    
    if (json.status === 'success' && json.latest) {
        const lastId = await AsyncStorage.getItem('last_seen_booking_id');
        const latestId = json.latest.bookedid.toString();

        if (lastId !== latestId) {
            await AsyncStorage.setItem('last_seen_booking_id', latestId);
            
            await Notifications.scheduleNotificationAsync({
                content: {
                  title: "NEW BOOKING! 🏨",
                  body: `${json.latest.firstname} booked Room ${json.latest.room_no || 'TBA'}. Check details now.`,
                  data: { bookedid: json.latest.bookedid },
                  sound: 'default',
                  priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: null,
                identifier: `booking-${latestId}`,
            });
            return BackgroundTask.BackgroundFetchResult.NewData;
        }
    }
    return BackgroundTask.BackgroundFetchResult.NoData;
  } catch (error) {
    return BackgroundTask.BackgroundFetchResult.Failed;
  }
});

export async function registerBookingBackgroundFetch() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_BOOKING_TASK);
    if (!isRegistered) {
        await BackgroundTask.registerTaskAsync(BACKGROUND_BOOKING_TASK, {
            minimumInterval: 15 * 60, // 15 minutes (Android minimum for BackgroundFetch)
            stopOnTerminate: false,
            startOnBoot: true,
        });
    }
  } catch (e) {
    console.error('Booking Task registration failed', e);
  }
}
