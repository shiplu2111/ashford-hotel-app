export const BASE_URL = "http://192.168.0.106"; // Reverted to local IP for physical device testing
export const API_BASE = `${BASE_URL}/ashford-marge`;

export const ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE}/admin-api/login`,
  ADMIN_FORGOT_PASSWORD: `${API_BASE}/admin-api/forgot-password`,
  ADMIN_OTP_LOGIN: `${API_BASE}/admin-api/otp-login`,
  ADMIN_ORDERS: `${API_BASE}/admin-api/orders`,
  ADMIN_ORDER_DETAILS: (id: string) => `${API_BASE}/admin-api/order-details/${id}`,
  ADMIN_CHECK_NEW_ORDERS: `${API_BASE}/admin-api/check-new-orders`,
};
