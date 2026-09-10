/**
 * Maharashtra School Attendance & Poshan Aahar System
 * Types and Data Contracts
 */

export type Language = 'mr' | 'en';

export interface Student {
  id: string;
  rollNo: number;
  nameMr: string;
  nameEn: string;
  gender: 'boy' | 'girl';
  standard: number; // 1 to 8
  division: string; // 'A', 'B', 'C'
  parentNameMr: string;
  parentNameEn: string;
  parentPhone: string;
  address?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  standard: number;
  division: string;
  totalEnrolled: number;
  presentStudentIds: string[];
  absentStudentIds: string[];
  boysPresent: number;
  girlsPresent: number;
  totalPresent: number;
  markedAt: string;
  markedBy: string;
}

export interface PoshanMenuItem {
  dayNameMr: string;
  dayNameEn: string;
  menuMr: string;
  menuEn: string;
  supplementaryMr: string;
  supplementaryEn: string;
}

export interface PoshanAaharEntry {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  menuItem: string;
  // Student counts
  primaryEnrolled: number;
  primaryPresent: number;
  upperPrimaryEnrolled: number;
  upperPrimaryPresent: number;
  totalPresent: number;
  // Ingredients consumed (Calculated per Maharashtra norms)
  riceKg: number; // Primary: 100g, Upper: 150g
  pulsesKg: number; // Primary: 20g, Upper: 30g
  oilKg: number; // Primary: 5g, Upper: 7.5g
  veggiesKg: number; // Primary: 50g, Upper: 75g
  spicesKg: number; // Primary: 2g, Upper: 3g
  cookingCostRs: number; // Primary: ₹5.45, Upper: ₹8.17
  // Supplementary Diet
  supplementaryDistributed: boolean;
  supplementaryItem: string;
  supplementaryCount: number;
  // Inspection & Remarks (Govt compliance)
  tastedBy: string; // Food tasting teacher/HM
  qualityRemark: 'excellent' | 'good' | 'satisfactory';
  notes?: string;
}

export interface StockItem {
  id: string;
  nameMr: string;
  nameEn: string;
  unit: string;
  openingStock: number;
  receivedStock: number;
  consumedStock: number;
  currentStock: number;
  minAlertThreshold: number;
}

export interface SchoolNotice {
  id: string;
  titleMr: string;
  titleEn: string;
  date: string;
  category: 'absentee' | 'meeting' | 'holiday' | 'exam' | 'mdm' | 'general';
  targetStandard?: number | 'all';
  messageMr: string;
  messageEn: string;
  issuedBy: string;
  isUrgent: boolean;
  recipientPhone?: string;
  studentName?: string;
}

export interface SchoolProfile {
  schoolNameMr: string;
  schoolNameEn: string;
  udiseCode: string;
  center: string;
  taluka: string;
  district: string;
  headmasterName: string;
  primaryCookingRate: number; // ₹5.45
  upperPrimaryCookingRate: number; // ₹8.17
}

export interface SyncInfo {
  lastSyncTime: string | null;
  autoSync: boolean;
  lastSyncedCounts?: {
    students: number;
    attendance: number;
    poshan: number;
    stock: number;
    notices: number;
  };
}
