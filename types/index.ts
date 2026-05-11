export interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "standard" | "deluxe" | "suite";
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  status: "pending" | "confirmed" | "cancelled";
}
