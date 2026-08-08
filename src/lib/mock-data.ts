export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

/** Valid transitions — mirrors the service-layer state machine lookup table. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export type Artist = {
  id: string;
  name: string;
  tagline: string;
  city: string;
  area: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  distanceKm: number;
  premium: boolean;
  verified: boolean;
  specialties: string[];
  initials: string;
  hue: number;
};

export const artists: Artist[] = [
  {
    id: "a1",
    name: "Meher Kapoor",
    tagline: "Bridal & HD glam specialist",
    city: "Mumbai",
    area: "Bandra West",
    rating: 4.9,
    reviews: 214,
    startingPrice: 8500,
    distanceKm: 2.4,
    premium: true,
    verified: true,
    specialties: ["Bridal", "HD Glam", "Airbrush"],
    initials: "MK",
    hue: 12,
  },
  {
    id: "a2",
    name: "Riya Sethi",
    tagline: "Soft glam, natural finishes",
    city: "Mumbai",
    area: "Andheri",
    rating: 4.7,
    reviews: 132,
    startingPrice: 4200,
    distanceKm: 5.1,
    premium: true,
    verified: true,
    specialties: ["Party", "Engagement"],
    initials: "RS",
    hue: 330,
  },
  {
    id: "a3",
    name: "Anaya Rao",
    tagline: "Editorial & photoshoot looks",
    city: "Mumbai",
    area: "Lower Parel",
    rating: 4.8,
    reviews: 88,
    startingPrice: 6000,
    distanceKm: 7.8,
    premium: false,
    verified: true,
    specialties: ["Editorial", "Photoshoot"],
    initials: "AR",
    hue: 42,
  },
  {
    id: "a4",
    name: "Tanvi Menon",
    tagline: "Everyday glow, on demand",
    city: "Mumbai",
    area: "Powai",
    rating: 4.5,
    reviews: 47,
    startingPrice: 2500,
    distanceKm: 11.2,
    premium: false,
    verified: false,
    specialties: ["Party", "Hairstyling"],
    initials: "TM",
    hue: 268,
  },
  {
    id: "a5",
    name: "Sana Qureshi",
    tagline: "Nikah & reception artistry",
    city: "Mumbai",
    area: "Mahim",
    rating: 5.0,
    reviews: 61,
    startingPrice: 9800,
    distanceKm: 3.9,
    premium: true,
    verified: true,
    specialties: ["Bridal", "Hairstyling"],
    initials: "SQ",
    hue: 160,
  },
];

export const serviceCategories = [
  "Bridal",
  "Party",
  "Engagement",
  "HD Glam",
  "Editorial",
  "Hairstyling",
];

export type Booking = {
  id: string;
  artistId: string;
  customerName: string;
  customerInitials: string;
  service: string;
  date: string;
  time: string;
  location: string;
  total: number;
  advance: number;
  status: BookingStatus;
};

export const bookings: Booking[] = [
  {
    id: "b1",
    artistId: "a1",
    customerName: "Ishita Verma",
    customerInitials: "IV",
    service: "Bridal HD Package",
    date: "Sat, 22 Aug",
    time: "06:30 AM",
    location: "Taj Lands End, Bandra",
    total: 24000,
    advance: 4800,
    status: "CONFIRMED",
  },
  {
    id: "b2",
    artistId: "a2",
    customerName: "Neha Sharma",
    customerInitials: "NS",
    service: "Party Makeup + Hair",
    date: "Tue, 25 Aug",
    time: "05:00 PM",
    location: "Andheri East",
    total: 6500,
    advance: 1300,
    status: "PENDING",
  },
  {
    id: "b3",
    artistId: "a3",
    customerName: "Aditi Nair",
    customerInitials: "AN",
    service: "Editorial Shoot (4 hrs)",
    date: "Fri, 28 Aug",
    time: "09:00 AM",
    location: "Studio 42, Lower Parel",
    total: 18000,
    advance: 3600,
    status: "ACCEPTED",
  },
  {
    id: "b4",
    artistId: "a5",
    customerName: "Fatima Shaikh",
    customerInitials: "FS",
    service: "Engagement Glam",
    date: "Sun, 2 Aug",
    time: "04:00 PM",
    location: "Mahim",
    total: 9800,
    advance: 1960,
    status: "COMPLETED",
  },
  {
    id: "b5",
    artistId: "a4",
    customerName: "Pooja Iyer",
    customerInitials: "PI",
    service: "Everyday Glow",
    date: "Wed, 30 Jul",
    time: "11:00 AM",
    location: "Powai",
    total: 2500,
    advance: 500,
    status: "CANCELLED",
  },
];

export const artistServices = [
  { id: "s1", name: "Bridal HD Makeup", duration: "3 hrs", price: 18000, active: true },
  { id: "s2", name: "Engagement Glam", duration: "2 hrs", price: 9000, active: true },
  { id: "s3", name: "Party Makeup", duration: "90 min", price: 5500, active: true },
  { id: "s4", name: "Hairstyling Add-on", duration: "45 min", price: 2500, active: false },
];

export const artistPackages = [
  {
    id: "p1",
    name: "Bridal Complete",
    includes: ["HD Bridal Makeup", "Hairstyling", "Draping", "Trial session"],
    price: 32000,
  },
  {
    id: "p2",
    name: "Sangeet + Mehendi",
    includes: ["2 looks", "Hairstyling", "Touch-up kit"],
    price: 21000,
  },
];

export const daySlots = [
  { time: "07:00", state: "booked" as const },
  { time: "09:00", state: "available" as const },
  { time: "11:00", state: "available" as const },
  { time: "13:00", state: "blocked" as const },
  { time: "15:00", state: "available" as const },
  { time: "17:00", state: "booked" as const },
  { time: "19:00", state: "available" as const },
];

export const earnings = [
  { month: "Mar", value: 42000 },
  { month: "Apr", value: 58000 },
  { month: "May", value: 51000 },
  { month: "Jun", value: 76000 },
  { month: "Jul", value: 69000 },
  { month: "Aug", value: 91000 },
];

export const notifications = [
  {
    id: "n1",
    title: "New booking request",
    body: "Neha Sharma requested Party Makeup on 25 Aug.",
    time: "12m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Payment received",
    body: "₹4,800 advance received for Ishita Verma's booking.",
    time: "3h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Reminder",
    body: "Editorial shoot tomorrow at 9:00 AM, Lower Parel.",
    time: "1d ago",
    unread: false,
  },
];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
