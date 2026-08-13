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

export type TransactionStatus = "COMPLETED" | "HELD_IN_ESCROW" | "REFUNDED" | "PROCESSING";

export type PlatformTransaction = {
  id: string;
  bookingId: string;
  customerName: string;
  artistName: string;
  service: string;
  amount: number;
  advance: number;
  platformFee: number;
  artistPayout: number;
  paymentMethod: string;
  status: TransactionStatus;
  date: string;
  time: string;
};

export const platformStats = {
  totalGmv: 428500,
  platformRevenue: 64275, // 15% commission
  totalBookings: 142,
  activeArtists: 38,
  pendingVerifications: 3,
  completedPayouts: 342000,
};

export const platformRevenueHistory = [
  { month: "Mar", gmv: 320000, commission: 48000 },
  { month: "Apr", gmv: 380000, commission: 57000 },
  { month: "May", gmv: 350000, commission: 52500 },
  { month: "Jun", gmv: 410000, commission: 61500 },
  { month: "Jul", gmv: 460000, commission: 69000 },
  { month: "Aug", gmv: 510000, commission: 76500 },
];

export const platformTransactions: PlatformTransaction[] = [
  {
    id: "TXN-9021",
    bookingId: "b1",
    customerName: "Ishita Verma",
    artistName: "Meher Kapoor",
    service: "Bridal HD Package",
    amount: 24000,
    advance: 4800,
    platformFee: 3600,
    artistPayout: 20400,
    paymentMethod: "UPI (Google Pay)",
    status: "HELD_IN_ESCROW",
    date: "10 Aug 2026",
    time: "11:42 AM",
  },
  {
    id: "TXN-9020",
    bookingId: "b4",
    customerName: "Fatima Shaikh",
    artistName: "Sana Qureshi",
    service: "Engagement Glam",
    amount: 9800,
    advance: 1960,
    platformFee: 1470,
    artistPayout: 8330,
    paymentMethod: "Credit Card (HDFC)",
    status: "COMPLETED",
    date: "02 Aug 2026",
    time: "05:15 PM",
  },
  {
    id: "TXN-9019",
    bookingId: "b3",
    customerName: "Aditi Nair",
    artistName: "Anaya Rao",
    service: "Editorial Shoot (4 hrs)",
    amount: 18000,
    advance: 3600,
    platformFee: 2700,
    artistPayout: 15300,
    paymentMethod: "NetBanking (ICICI)",
    status: "HELD_IN_ESCROW",
    date: "08 Aug 2026",
    time: "02:20 PM",
  },
  {
    id: "TXN-9018",
    bookingId: "b5",
    customerName: "Pooja Iyer",
    artistName: "Tanvi Menon",
    service: "Everyday Glow",
    amount: 2500,
    advance: 500,
    platformFee: 375,
    artistPayout: 0,
    paymentMethod: "UPI (PhonePe)",
    status: "REFUNDED",
    date: "30 Jul 2026",
    time: "10:05 AM",
  },
  {
    id: "TXN-9017",
    bookingId: "b2",
    customerName: "Neha Sharma",
    artistName: "Riya Sethi",
    service: "Party Makeup + Hair",
    amount: 6500,
    advance: 1300,
    platformFee: 975,
    artistPayout: 5525,
    paymentMethod: "UPI (Paytm)",
    status: "PROCESSING",
    date: "10 Aug 2026",
    time: "12:01 PM",
  },
];

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type FraudAlert = {
  id: string;
  targetType: "ARTIST" | "USER" | "TRANSACTION";
  targetId: string;
  name: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  reason: string;
  details: string;
  ipAddress: string;
  flaggedAt: string;
  status: "PENDING_REVIEW" | "SUSPENDED" | "DISMISSED";
};

export const fraudAlerts: FraudAlert[] = [
  {
    id: "FRD-1092",
    targetType: "ARTIST",
    targetId: "a4",
    name: "Tanvi Menon (Unverified Artist)",
    riskScore: 88,
    riskLevel: "HIGH",
    reason: "Duplicate Portfolio Photos & Price Anomaly",
    details: "Reverse image search detected portfolio photos matched another salon website. Unusually low pricing ₹2,500.",
    ipAddress: "103.22.18.91 (VPN Detected)",
    flaggedAt: "10 Aug 2026, 09:14 AM",
    status: "PENDING_REVIEW",
  },
  {
    id: "FRD-1091",
    targetType: "USER",
    targetId: "u-9912",
    name: "Karan Malhotra (Suspicious Client)",
    riskScore: 94,
    riskLevel: "CRITICAL",
    reason: "Rapid Booking Creation & Payment Decline Velocity",
    details: "Created 5 high-value booking requests within 10 minutes with 4 failed credit card attempts.",
    ipAddress: "45.112.90.12 (Tor Exit Node)",
    flaggedAt: "10 Aug 2026, 11:02 AM",
    status: "SUSPENDED",
  },
  {
    id: "FRD-1090",
    targetType: "TRANSACTION",
    targetId: "TXN-9021",
    name: "Transaction TXN-9021 (Ishita Verma)",
    riskScore: 45,
    riskLevel: "MEDIUM",
    reason: "Advance Deposit Escrow Hold Verification",
    details: "High-value booking ₹24,000. Escrow locked safely pending artist arrival verification.",
    ipAddress: "157.33.120.4",
    flaggedAt: "10 Aug 2026, 11:42 AM",
    status: "PENDING_REVIEW",
  },
];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;


