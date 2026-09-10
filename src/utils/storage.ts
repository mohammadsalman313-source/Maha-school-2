import {
  Student,
  AttendanceRecord,
  PoshanAaharEntry,
  StockItem,
  SchoolNotice,
  SchoolProfile,
  SyncInfo,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SCHOOL_PROFILE,
  INITIAL_STOCK,
  INITIAL_NOTICES,
} from './sampleData';
import { calculatePoshanAahar, MAHA_WEEKLY_MENU } from './poshanRules';

const STORAGE_KEYS = {
  STUDENTS: 'mahaschool_students_v1',
  ATTENDANCE: 'mahaschool_attendance_v1',
  POSHAN: 'mahaschool_poshan_v1',
  STOCK: 'mahaschool_stock_v1',
  NOTICES: 'mahaschool_notices_v1',
  PROFILE: 'mahaschool_profile_v1',
  LANG: 'mahaschool_lang_v1',
  SYNC_INFO: 'mahaschool_sync_info_v1',
  SYNC_BACKUP_CACHE: 'mahaschool_sync_backup_cache_v1',
};

export const Storage = {
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (data) return JSON.parse(data);
      // Generate realistic initial attendance for today
      const today = new Date().toISOString().split('T')[0];
      const initial: AttendanceRecord[] = [];
      const students = INITIAL_STUDENTS;

      // Group by class 1 to 8
      for (let std = 1; std <= 8; std++) {
        const classStudents = students.filter((s) => s.standard === std);
        if (classStudents.length === 0) continue;
        // Make 1 student absent in class 1, 2, 5, 6 as sample
        const absents = std % 2 === 1 ? [classStudents[0].id] : [];
        const presents = classStudents
          .filter((s) => !absents.includes(s.id))
          .map((s) => s.id);

        const boysPresent = classStudents.filter(
          (s) => presents.includes(s.id) && s.gender === 'boy'
        ).length;
        const girlsPresent = classStudents.filter(
          (s) => presents.includes(s.id) && s.gender === 'girl'
        ).length;

        initial.push({
          id: `att-${today}-std${std}`,
          date: today,
          standard: std,
          division: 'A',
          totalEnrolled: classStudents.length,
          presentStudentIds: presents,
          absentStudentIds: absents,
          boysPresent,
          girlsPresent,
          totalPresent: presents.length,
          markedAt: new Date().toLocaleTimeString(),
          markedBy: 'वर्गशिक्षक',
        });
      }
      return initial;
    } catch {
      return [];
    }
  },

  saveAttendance(records: AttendanceRecord[]) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  },

  getPoshanEntries(): PoshanAaharEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSHAN);
      if (data) return JSON.parse(data);

      // Create a default entry for today
      const today = new Date().toISOString().split('T')[0];
      const dayIdx = new Date().getDay();
      const menu = MAHA_WEEKLY_MENU.find((m) => m.dayIndex === dayIdx) || MAHA_WEEKLY_MENU[1];

      const calc = calculatePoshanAahar({
        primaryPresent: 11,
        upperPrimaryPresent: 5,
        primaryRate: 5.45,
        upperPrimaryRate: 8.17,
      });

      const initial: PoshanAaharEntry[] = [
        {
          id: `poshan-${today}`,
          date: today,
          dayOfWeek: menu.dayNameMr,
          menuItem: menu.menuMr,
          primaryEnrolled: 14,
          primaryPresent: 11,
          upperPrimaryEnrolled: 6,
          upperPrimaryPresent: 5,
          totalPresent: 16,
          riceKg: calc.riceKg,
          pulsesKg: calc.pulsesKg,
          oilKg: calc.oilKg,
          veggiesKg: calc.veggiesKg,
          spicesKg: calc.spicesKg,
          cookingCostRs: calc.cookingCostRs,
          supplementaryDistributed: dayIdx === 6,
          supplementaryItem: menu.supplementaryMr,
          supplementaryCount: 16,
          tastedBy: 'श्री. सुनील डी. गायकवाड (मुख्याध्यापक)',
          qualityRemark: 'excellent',
          notes: 'अन्न चवदार व उत्कृष्ट, स्वच्छता समाधानकारक आढळली.',
        },
      ];
      return initial;
    } catch {
      return [];
    }
  },

  savePoshanEntries(entries: PoshanAaharEntry[]) {
    localStorage.setItem(STORAGE_KEYS.POSHAN, JSON.stringify(entries));
  },

  getStock(): StockItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STOCK);
      return data ? JSON.parse(data) : INITIAL_STOCK;
    } catch {
      return INITIAL_STOCK;
    }
  },

  saveStock(stock: StockItem[]) {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  },

  getNotices(): SchoolNotice[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
      return data ? JSON.parse(data) : INITIAL_NOTICES;
    } catch {
      return INITIAL_NOTICES;
    }
  },

  saveNotices(notices: SchoolNotice[]) {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
  },

  getProfile(): SchoolProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : INITIAL_SCHOOL_PROFILE;
    } catch {
      return INITIAL_SCHOOL_PROFILE;
    }
  },

  saveProfile(profile: SchoolProfile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getSyncInfo(): SyncInfo {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_INFO);
      if (data) return JSON.parse(data);
      return {
        lastSyncTime: null,
        autoSync: true,
      };
    } catch {
      return {
        lastSyncTime: null,
        autoSync: true,
      };
    }
  },

  saveSyncInfo(info: SyncInfo) {
    localStorage.setItem(STORAGE_KEYS.SYNC_INFO, JSON.stringify(info));
  },

  performDataSync(): {
    success: boolean;
    timestamp: string;
    counts: {
      students: number;
      attendance: number;
      poshan: number;
      stock: number;
      notices: number;
    };
    snapshotJson: string;
  } {
    const students = this.getStudents();
    const attendance = this.getAttendance();
    const poshan = this.getPoshanEntries();
    const stock = this.getStock();
    const notices = this.getNotices();
    const profile = this.getProfile();

    const timestamp = new Date().toISOString();
    const counts = {
      students: students.length,
      attendance: attendance.length,
      poshan: poshan.length,
      stock: stock.length,
      notices: notices.length,
    };

    const snapshot = {
      profile,
      students,
      attendance,
      poshan,
      stock,
      notices,
      syncedAt: timestamp,
      version: '1.0',
      app: 'MahaSchool Android PWA',
    };

    const snapshotJson = JSON.stringify(snapshot, null, 2);
    localStorage.setItem(STORAGE_KEYS.SYNC_BACKUP_CACHE, snapshotJson);

    const currentInfo = this.getSyncInfo();
    this.saveSyncInfo({
      ...currentInfo,
      lastSyncTime: timestamp,
      lastSyncedCounts: counts,
    });

    return {
      success: true,
      timestamp,
      counts,
      snapshotJson,
    };
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.POSHAN);
    localStorage.removeItem(STORAGE_KEYS.STOCK);
    localStorage.removeItem(STORAGE_KEYS.NOTICES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SYNC_INFO);
    localStorage.removeItem(STORAGE_KEYS.SYNC_BACKUP_CACHE);
  },
};
