
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

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: RequestStatus;
  timestamp: number;
  // specific to students
  rollNo?: string;
  section?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  section: string;
  coins: number;
  email?: string; // Link to registration
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  joinDate: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string; // Acts as userId for both students and teachers
  userRole?: UserRole; // Differentiates the record type
  date: string; // ISO Date string YYYY-MM-DD
  timestamp: number;
  markedBy: string;
}

export interface CoinTransaction {
  id: string;
  studentId: string;
  amount: number;
  timestamp: number;
  awardedBy: string;
  reason?: string;
}

export interface Gift {
  id: string;
  name: string;
  cost: number;
  icon: string; // Emoji or lucide icon name identifier
  description: string;
  image?: string; // Base64 or URL
}

export interface RedemptionRequest {
  id: string;
  studentId: string;
  giftId: string;
  cost: number;
  timestamp: number;
  status: RequestStatus;
}

export interface AppState {
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  transactions: CoinTransaction[];
  requests: RegistrationRequest[];
  currentUserRole: UserRole;
}

export type CoinValue = 100 | 200 | 300 | 500;

export const COIN_VALUES: CoinValue[] = [100, 200, 300, 500];
