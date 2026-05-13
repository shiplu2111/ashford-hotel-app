export const BASE_URL = "http://192.168.0.107"; // Updated to current local IP for physical device testing
export const API_BASE = `${BASE_URL}/ashford-marge`;

export const ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE}/admin-api/login`,
  ADMIN_FORGOT_PASSWORD: `${API_BASE}/admin-api/forgot-password`,
  ADMIN_OTP_LOGIN: `${API_BASE}/admin-api/otp-login`,
  ADMIN_ORDERS: `${API_BASE}/admin-api/orders`,
  ADMIN_ORDER_DETAILS: (id: string) => `${API_BASE}/admin-api/order-details/${id}`,
  ADMIN_CHECK_NEW_ORDERS: `${API_BASE}/admin-api/check-new-orders`,
  ADMIN_ACCEPT_ORDER: `${API_BASE}/admin-api/accept-order`,
  ADMIN_CANCEL_ORDER: `${API_BASE}/admin-api/cancel-order`,
  ADMIN_COMPLETE_ORDER: `${API_BASE}/admin-api/complete-order`,
  ADMIN_MAKE_PAYMENT: `${API_BASE}/admin-api/make-payment`,
  ADMIN_POS_INVOICE: (id: string) => `${API_BASE}/admin-api/pos-invoice/${id}`,
   ADMIN_BOOKINGS: `${API_BASE}/admin-api/bookings`,
   ADMIN_BOOKING_DETAILS: (id: string) => `${API_BASE}/admin-api/booking-details/${id}`,
   ADMIN_GET_ROOM_TYPES: `${API_BASE}/admin-api/get-room-types`,
   ADMIN_GET_AVAILABLE_ROOMS: (typeId: string) => `${API_BASE}/admin-api/get-available-rooms?room_type=${typeId}`,
   ADMIN_GET_PAYMENT_METHODS: `${API_BASE}/admin-api/get-payment-methods`,
   ADMIN_CHECK_IN: `${API_BASE}/admin-api/check-in`,
   ADMIN_CHECK_OUT: `${API_BASE}/admin-api/check-out`,
   ADMIN_VALIDATE_GIFT_CARD: `${API_BASE}/admin-api/validate-gift-card`,
   ADMIN_CANCEL_BOOKING: `${API_BASE}/admin-api/cancel-booking`,
   ADMIN_RELEASE_BOOKING: `${API_BASE}/admin-api/release-booking`,
 };
