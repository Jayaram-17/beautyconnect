import { neon } from "@neondatabase/serverless";

export type AccountRole = "USER" | "ARTIST";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: AccountRole;
  artistProfileComplete: boolean;
  phone: string | null;
  city: string | null;
  artistryName: string | null;
  emailNotifications: boolean;
  bookingUpdates: boolean;
};

type UserRecord = SessionUser & { password_hash: string };

const SESSION_COOKIE = "glowlist_session";
const SESSION_DAYS = 30;
const encoder = new TextEncoder();

export function database() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Add your Neon connection string to .env.local.");
  }
  return neon(connectionString);
}

function base64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

async function digest(value: string) {
  const result = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function passwordHash(password: string, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 210_000 },
    material,
    256,
  );
  return `${base64(salt)}:${base64(new Uint8Array(bits))}`;
}

async function verifyPassword(password: string, stored: string) {
  const [saltValue] = stored.split(":");
  if (!saltValue) return false;
  const salt = Uint8Array.from(atob(saltValue), (char) => char.charCodeAt(0));
  return (await passwordHash(password, salt)) === stored;
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function publicUser(user: UserRecord): SessionUser {
  const { password_hash: _password, ...safeUser } = user;
  return safeUser;
}

export function sessionCookie(token: string) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env["NODE_ENV"] === "production" ? "; Secure" : ""}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env["NODE_ENV"] === "production" ? "; Secure" : ""}`;
}

function cookieValue(request: Request, name: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)?.[1];
}

async function createSession(userId: string) {
  const token = randomToken();
  const sql = database();
  await sql`INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (${userId}, ${await digest(token)}, now() + interval '30 days')`;
  return token;
}

export async function registerAccount(input: { name: string; email: string; password: string; role: AccountRole; city: string; artistryName?: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) throw new Error("Please enter your full name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  if (input.password.length < 8) throw new Error("Use at least 8 characters for your password.");
  const city = input.city.trim();
  if (city.length < 2) throw new Error("Please add your location.");
  const artistryName = input.artistryName?.trim() ?? "";
  if (input.role === "ARTIST" && artistryName.length < 2) throw new Error("Please enter your artistry name.");

  const sql = database();
  const existing = await sql`SELECT id FROM auth_users WHERE email = ${email}`;
  if (existing.length) throw new Error("An account with this email already exists.");

  const rows = await sql`INSERT INTO auth_users (name, email, password_hash, role, city)
    VALUES (${name}, ${email}, ${await passwordHash(input.password)}, ${input.role}, ${city})
    RETURNING id, name, email, role, artist_profile_complete AS "artistProfileComplete", phone, city,
      NULL::text AS "artistryName",
      email_notifications AS "emailNotifications", booking_updates AS "bookingUpdates", password_hash`;
  const user = rows[0] as UserRecord | undefined;
  if (!user) throw new Error("Could not create your account.");
  if (input.role === "ARTIST") {
    await sql`INSERT INTO artist_profiles (user_id, artistry_name) VALUES (${user.id}, ${artistryName})`;
    user.artistryName = artistryName;
  }
  const token = await createSession(user.id);
  return { user: publicUser(user), token };
}

export async function loginAccount(input: { email: string; password: string }) {
  const sql = database();
  const rows = await sql`SELECT u.id, u.name, u.email, u.role, u.artist_profile_complete AS "artistProfileComplete", u.phone, u.city, to_jsonb(p)->>'artistry_name' AS "artistryName",
    email_notifications AS "emailNotifications", booking_updates AS "bookingUpdates", password_hash
    FROM auth_users u LEFT JOIN artist_profiles p ON p.user_id = u.id WHERE email = ${input.email.trim().toLowerCase()}`;
  const user = rows[0] as UserRecord | undefined;
  if (!user || !(await verifyPassword(input.password, user.password_hash))) {
    throw new Error("Incorrect email or password.");
  }
  const token = await createSession(user.id);
  return { user: publicUser(user), token };
}

export async function currentUser(request: Request): Promise<SessionUser | null> {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  const sql = database();
  const rows = await sql`SELECT u.id, u.name, u.email, u.role, u.artist_profile_complete AS "artistProfileComplete", u.phone, u.city, to_jsonb(p)->>'artistry_name' AS "artistryName",
    u.email_notifications AS "emailNotifications", u.booking_updates AS "bookingUpdates"
    FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id LEFT JOIN artist_profiles p ON p.user_id = u.id
    WHERE s.token_hash = ${await digest(token)} AND s.expires_at > now()`;
  return (rows[0] as SessionUser | undefined) ?? null;
}

export async function updateCurrentUser(
  request: Request,
  input: { name?: string; phone?: string; city?: string; artistryName?: string; emailNotifications?: boolean; bookingUpdates?: boolean },
) {
  const user = await currentUser(request);
  if (!user) throw new Error("Please sign in again.");

  const name = input.name?.trim() || user.name;
  if (name.length < 2) throw new Error("Please enter your full name.");
  const phone = input.phone?.trim() || null;
  const city = input.city?.trim() || null;
  const artistryName = input.artistryName?.trim() || null;
  if (user.role === "ARTIST" && input.artistryName !== undefined && (!artistryName || artistryName.length < 2)) throw new Error("Please enter your artistry name.");
  const emailNotifications = input.emailNotifications ?? user.emailNotifications;
  const bookingUpdates = input.bookingUpdates ?? user.bookingUpdates;
  const rows = await database()`UPDATE auth_users
    SET name = ${name}, phone = ${phone}, city = ${city}, email_notifications = ${emailNotifications}, booking_updates = ${bookingUpdates}, updated_at = now()
    WHERE id = ${user.id}
    RETURNING id, name, email, role, artist_profile_complete AS "artistProfileComplete", phone, city,
      (SELECT to_jsonb(profile)->>'artistry_name' FROM artist_profiles profile WHERE user_id = ${user.id}) AS "artistryName",
      email_notifications AS "emailNotifications", booking_updates AS "bookingUpdates"`;
  if (user.role === "ARTIST" && input.artistryName !== undefined) {
    await database()`UPDATE artist_profiles SET artistry_name = ${artistryName}, updated_at = now() WHERE user_id = ${user.id}`;
    (rows[0] as SessionUser).artistryName = artistryName;
  }
  return rows[0] as SessionUser;
}

export async function revokeSession(request: Request) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (token) await database()`DELETE FROM auth_sessions WHERE token_hash = ${await digest(token)}`;
}
