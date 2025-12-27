
export enum ShiftType {
  MORNING = 'morning',
  EVENING = 'evening',
  NIGHT = 'night',
  GENERAL = 'general',
  PRE = 'pre',
  MIDDLE = 'middle'
}

export enum LeaveType {
  EARNED = 'earned',
  CASUAL = 'casual',
  SICK = 'sick',
  LOP = 'lop',
  REST = 'rest'
}

export enum ViewMode {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  STATS = 'stats'
}

export interface DayAttendance {
  morning: boolean;
  evening: boolean;
  night: boolean;
  general: boolean;
  pre: boolean;
  middle: boolean;
  leave: LeaveType | null;
  note?: string;
  isHoliday?: boolean;
  holidayName?: string;
}

export interface LeaveQuota {
  earned: number;
  casual: number;
  sick: number;
  earnedRolloverMax: number;
  casualRolloverMax: number;
  sickRolloverMax: number;
}

export interface ShiftTimings {
  morning: string;
  evening: string;
  night: string;
  general: string;
  pre: string;
  middle: string;
}

export interface ShiftColors {
  morning: string;
  evening: string;
  night: string;
  general: string;
  pre: string;
  middle: string;
}

export interface AttendanceStore {
  attendance: { [dateKey: string]: DayAttendance };
  quotas: LeaveQuota;
  timings: ShiftTimings;
}

export interface MonthStats {
  morningCount: number;
  eveningCount: number;
  nightCount: number;
  generalCount: number;
  preCount: number;
  middleCount: number;
  earnedLeaveCount: number;
  casualLeaveCount: number;
  sickLeaveCount: number;
  lopLeaveCount: number;
  totalWorked: number;
}
