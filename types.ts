// src/types.ts

export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/* =========================
   FIREBASE USER (IMPORTANT)
========================= */
export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: number;
}

/* =========================
   REGISTRATION
========================= */
export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: RequestStatus;
  timestamp: number;
  rollNo?: string;
  section?: string;
}

/* =========================
   STUDENTS & TEACHERS
========================= */
export interface Student {
  id: string;
  name: string;
  rollNo: string;
  section: string;
  coins: number;
  email?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  joinDate: number;
}

/* =========================
   ATTENDANCE
========================= */
export interface AttendanceRecord {
  id: string;
  userId: string;          // Firebase UID
  role: UserRole;
  date: string;            // YYYY-MM-DD
  timestamp: number;
  markedBy: string;        // Firebase UID (teacher/admin)
}

/* =========================
   COINS
========================= */
export interface CoinTransaction {
  id: string;
  studentId: string;
  amount: number;
  timestamp: number;
  awardedBy: string;       // Firebase UID
  reason?: string;
}

/* =========================
   GIFTS
========================= */
export interface Gift {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
  image?: string;
}

export interface RedemptionRequest {
  id: string;
  studentId: string;
  giftId: string;
  cost: number;
  timestamp: number;
  status: RequestStatus;
}

/* =========================
   COIN CONSTANTS
========================= */
export type CoinValue = 100 | 200 | 300 | 500;
export const COIN_VALUES: CoinValue[] = [100, 200, 300, 500];
