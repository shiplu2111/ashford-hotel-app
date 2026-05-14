import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { ENDPOINTS } from '../constants/Api';

export function useAlertStatus() {
  const [hasUnread, setHasUnread] = useState(false);
  const [lastSeenTime, setLastSeenTime] = useState(0);

  const checkUnread = async () => {
    try {
      const lastSeenStr = await AsyncStorage.getItem('last_seen_alerts_time');
      const time = lastSeenStr ? parseInt(lastSeenStr) : 0;
      setLastSeenTime(time);

      // Fetch both Bookings and Orders with individual error handling
      const fetchJson = async (url: string) => {
        try {
          const res = await fetch(url);
          return await res.json();
        } catch (e) {
          return { status: "error" };
        }
      };

      const [bookRes, orderRes] = await Promise.all([
        fetchJson(ENDPOINTS.ADMIN_BOOKINGS),
        fetchJson(ENDPOINTS.ADMIN_ORDERS)
      ]);

      let latestTimestamp = 0;

      if (bookRes && bookRes.status === "success" && bookRes.data && bookRes.data.length > 0) {
        const latestBookingTime = new Date(bookRes.data[0].date_time).getTime();
        if (latestBookingTime > latestTimestamp) latestTimestamp = latestBookingTime;
      }

      if (orderRes && orderRes.status === "success" && orderRes.data && orderRes.data.length > 0) {
        const latestOrderTime = new Date(orderRes.data[0].order_date).getTime();
        if (latestOrderTime > latestTimestamp) latestTimestamp = latestOrderTime;
      }

      // If there is activity newer than our last visit, mark as unread
      if (latestTimestamp > time) {
        setHasUnread(true);
      } else {
        setHasUnread(false);
      }
    } catch (error) {
      console.error('Error checking unread status:', error);
    }
  };

  const markAsRead = async (timestamp?: number) => {
    const timeToSet = timestamp || Date.now();
    await AsyncStorage.setItem('last_seen_alerts_time', timeToSet.toString());
    setLastSeenTime(timeToSet);
    setHasUnread(false);
    // Notify all instances to refresh their status
    DeviceEventEmitter.emit('REFRESH_ALERTS_STATUS');
  };

  useEffect(() => {
    checkUnread();
    
    // Poll every 10 seconds for new activity
    const interval = setInterval(checkUnread, 10000);

    // Listen for manual refresh or new activity events
    const sub = DeviceEventEmitter.addListener('REFRESH_ALERTS_STATUS', checkUnread);

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  return { hasUnread, lastSeenTime, markAsRead, refreshStatus: checkUnread };
}
