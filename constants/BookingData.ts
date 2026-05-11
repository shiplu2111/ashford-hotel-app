export type BookingStatus = "Pending" | "Confirmed" | "Checked In" | "Checked Out" | "Cancelled";
export type PaymentStatus = "Paid" | "Partial" | "Unpaid";
export type RoomType = "Standard" | "Deluxe" | "Suite" | "Presidential";

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  idType: string;
  idNumber: string;
  avatar: string;
}

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
  image: string;
}

export interface Booking {
  id: string;
  guestId: string;
  guest: Guest;
  roomId: string;
  room: Room;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  notes: string;
  createdAt: string;
  paymentMethod: string;
}

export const MOCK_GUESTS: Guest[] = [
  { id: "G001", name: "James Wilson", email: "j.wilson@email.com", phone: "+44 7911 123456", nationality: "British", idType: "Passport", idNumber: "GBR123456", avatar: "https://i.pravatar.cc/150?u=g001" },
  { id: "G002", name: "Sarah Mitchell", email: "s.mitchell@email.com", phone: "+1 310 555 0199", nationality: "American", idType: "Passport", idNumber: "USA654321", avatar: "https://i.pravatar.cc/150?u=g002" },
  { id: "G003", name: "Yuki Tanaka", email: "y.tanaka@email.com", phone: "+81 3-1234-5678", nationality: "Japanese", idType: "Passport", idNumber: "JPN987654", avatar: "https://i.pravatar.cc/150?u=g003" },
  { id: "G004", name: "Marco Rossi", email: "m.rossi@email.com", phone: "+39 06 1234567", nationality: "Italian", idType: "National ID", idNumber: "ITA111222", avatar: "https://i.pravatar.cc/150?u=g004" },
  { id: "G005", name: "Emma Larsson", email: "e.larsson@email.com", phone: "+46 8-123 456", nationality: "Swedish", idType: "Passport", idNumber: "SWE333444", avatar: "https://i.pravatar.cc/150?u=g005" },
];

export const MOCK_ROOMS: Room[] = [
  { id: "R101", number: "101", type: "Standard", floor: 1, capacity: 2, pricePerNight: 180, amenities: ["WiFi", "TV", "AC", "Mini Bar"], isAvailable: false, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" },
  { id: "R205", number: "205", type: "Deluxe", floor: 2, capacity: 2, pricePerNight: 280, amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony", "City View"], isAvailable: true, image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400" },
  { id: "R310", number: "310", type: "Suite", floor: 3, capacity: 4, pricePerNight: 520, amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Ocean View", "Jacuzzi", "Kitchenette"], isAvailable: true, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400" },
  { id: "R401", number: "401", type: "Presidential", floor: 4, capacity: 6, pricePerNight: 1200, amenities: ["WiFi", "TV", "AC", "Mini Bar", "Private Pool", "Butler", "Ocean View", "Jacuzzi", "Kitchen"], isAvailable: true, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400" },
  { id: "R112", number: "112", type: "Standard", floor: 1, capacity: 2, pricePerNight: 180, amenities: ["WiFi", "TV", "AC"], isAvailable: true, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" },
  { id: "R220", number: "220", type: "Deluxe", floor: 2, capacity: 3, pricePerNight: 320, amenities: ["WiFi", "TV", "AC", "Mini Bar", "Garden View"], isAvailable: false, image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400" },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "BK-2401",
    guestId: "G001",
    guest: MOCK_GUESTS[0],
    roomId: "R101",
    room: MOCK_ROOMS[0],
    checkIn: "2026-05-12",
    checkOut: "2026-05-16",
    nights: 4,
    adults: 2,
    children: 0,
    totalAmount: 720,
    paidAmount: 720,
    paymentStatus: "Paid",
    bookingStatus: "Confirmed",
    notes: "Late check-in expected around 11 PM. Champagne welcome.",
    createdAt: "2026-05-01",
    paymentMethod: "Credit Card",
  },
  {
    id: "BK-2402",
    guestId: "G002",
    guest: MOCK_GUESTS[1],
    roomId: "R310",
    room: MOCK_ROOMS[2],
    checkIn: "2026-05-11",
    checkOut: "2026-05-14",
    nights: 3,
    adults: 2,
    children: 1,
    totalAmount: 1560,
    paidAmount: 780,
    paymentStatus: "Partial",
    bookingStatus: "Checked In",
    notes: "Family with infant. Extra crib requested.",
    createdAt: "2026-04-28",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "BK-2403",
    guestId: "G003",
    guest: MOCK_GUESTS[2],
    roomId: "R205",
    room: MOCK_ROOMS[1],
    checkIn: "2026-05-13",
    checkOut: "2026-05-15",
    nights: 2,
    adults: 1,
    children: 0,
    totalAmount: 560,
    paidAmount: 0,
    paymentStatus: "Unpaid",
    bookingStatus: "Pending",
    notes: "Business traveler. Early breakfast required.",
    createdAt: "2026-05-09",
    paymentMethod: "Cash",
  },
  {
    id: "BK-2404",
    guestId: "G004",
    guest: MOCK_GUESTS[3],
    roomId: "R401",
    room: MOCK_ROOMS[3],
    checkIn: "2026-05-08",
    checkOut: "2026-05-11",
    nights: 3,
    adults: 2,
    children: 2,
    totalAmount: 3600,
    paidAmount: 3600,
    paymentStatus: "Paid",
    bookingStatus: "Checked Out",
    notes: "VIP guest. Anniversary celebration.",
    createdAt: "2026-04-20",
    paymentMethod: "Credit Card",
  },
  {
    id: "BK-2405",
    guestId: "G005",
    guest: MOCK_GUESTS[4],
    roomId: "R112",
    room: MOCK_ROOMS[4],
    checkIn: "2026-05-20",
    checkOut: "2026-05-23",
    nights: 3,
    adults: 2,
    children: 0,
    totalAmount: 540,
    paidAmount: 0,
    paymentStatus: "Unpaid",
    bookingStatus: "Cancelled",
    notes: "Cancelled due to travel changes.",
    createdAt: "2026-05-05",
    paymentMethod: "Credit Card",
  },
];
