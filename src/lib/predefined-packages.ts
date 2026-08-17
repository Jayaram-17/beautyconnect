export type PredefinedPackage = { id: string; name: string; category: "Bridal" | "Party" | "HD" | "Airbrush"; included: string; price: number; durationMinutes: number };
export const predefinedPackages: PredefinedPackage[] = [
  { id: "bridal-glossy", name: "Bridal Glossy", category: "Bridal", included: "Glow base, lashes, drape setting", price: 18000, durationMinutes: 180 },
  { id: "bridal-matte-royal", name: "Bridal Matte Royal", category: "Bridal", included: "Matte finish, eyes, lashes, drape setting", price: 20000, durationMinutes: 210 },
  { id: "reception-glam", name: "Reception Glam", category: "Party", included: "Soft glam, lashes, hairstyle touch-up", price: 9500, durationMinutes: 120 },
  { id: "hd-glow-party", name: "HD Glow Party", category: "HD", included: "HD base, glow finish, lashes", price: 6500, durationMinutes: 90 },
  { id: "airbrush-party-ready", name: "Airbrush Party Ready", category: "Airbrush", included: "Airbrush base, eye makeup, lashes", price: 8500, durationMinutes: 105 },
  { id: "engagement-bliss", name: "Engagement Bliss", category: "Bridal", included: "Fresh glam, hairstyle, drape setting", price: 12000, durationMinutes: 150 },
  { id: "basic-everyday", name: "Basic Everyday", category: "Party", included: "Base makeup, eyes, lip colour", price: 2500, durationMinutes: 45 },
  { id: "saree-style", name: "Saree & Style", category: "Party", included: "Party makeup, saree drape, hairstyle", price: 5000, durationMinutes: 75 },
];
