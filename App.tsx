
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MONTHS, DAYS_OF_WEEK, SHIFT_CONFIG, LEAVE_CONFIG } from './constants';
import { ShiftType, LeaveType, DayAttendance, LeaveQuota, ShiftTimings, ShiftColors, ViewMode } from './types';
import ShiftSelector from './components/ShiftSelector';
import SettingsModal from './components/SettingsModal';

// --- Helpers ---

const formatDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeekKey = (date: Date): string => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday as start
  return formatDate(d);
};

// --- Specialized Components for Performance ---

const MiniDayCell = React.memo(({ 
  date, attendance: dayAtt, isToday, isSelected, shiftColors, onClick
}: { 
  date: Date, attendance: DayAttendance, isToday: boolean, isSelected: boolean, shiftColors: ShiftColors, onClick: (date: Date) => void
}) => {
  const leaveConfig = dayAtt.leave ? (LEAVE_CONFIG as any)[dayAtt.leave] : null;
  const activeShifts = (Object.keys(SHIFT_CONFIG) as ShiftType[]).filter(type => dayAtt[type]);
  const hasShift = activeShifts.length > 0;
  const hasConflict = hasShift && dayAtt.leave !== null;
  const isHoliday = dayAtt.isHoliday;
  const isSunday = date.getDay() === 0;
  
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
  const isMissing = isPast && !hasShift && !dayAtt.leave && !dayAtt.isHoliday && !isSunday;

  return (
    <div 
      onClick={() => onClick(date)}
      className={`aspect-square rounded-[2px] relative flex items-center justify-center cursor-pointer transition-all hover:scale-125 hover:z-20 ${
        isSelected ? 'ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 z-10' :
        hasConflict ? 'bg-rose-500' :
        isHoliday ? 'bg-rose-200 dark:bg-rose-800' :
        leaveConfig ? (dayAtt.leave === LeaveType.REST ? 'bg-indigo-100 dark:bg-indigo-900/40' : `${leaveConfig.dotColor}`) : 
        isToday ? 'ring-1 ring-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 
        isMissing ? 'bg-amber-100/50 dark:bg-amber-900/20' : 'bg-slate-100 dark:bg-slate-800'
      }`}
    >
      {isMissing && <div className="absolute inset-0 flex items-center justify-center"><div className="w-[1.5px] h-[1.5px] bg-amber-500 rounded-full" /></div>}
      {hasShift && (
        <div className="flex gap-[0.5px]">
          {activeShifts.map(type => (
            <div key={type} className="w-[2px] h-[2px] md:w-[3px] md:h-[3px] rounded-full" style={{ backgroundColor: shiftColors[type] }} />
          ))}
        </div>
      )}
    </div>
  );
});

const InteractiveDayCell = React.memo(({ 
  date, attendance: dayAtt, isToday, isSelected, 
  shiftColors, onClick
}: {
  date: Date, attendance: DayAttendance, isToday: boolean, isSelected: boolean,
  shiftColors: ShiftColors,
  onClick: (date: Date) => void
}) => {
  const dayNum = date.getDate();
  const leaveConfig = dayAtt.leave ? (LEAVE_CONFIG as any)[dayAtt.leave] : null;
  const activeShifts = (Object.keys(SHIFT_CONFIG) as ShiftType[]).filter(type => dayAtt[type]);
  const hasShift = activeShifts.length > 0;
  const hasConflict = hasShift && dayAtt.leave !== null;
  const isHoliday = dayAtt.isHoliday;
  const isSunday = date.getDay() === 0;

  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
  const isMissing = isPast && !hasShift && !dayAtt.leave && !dayAtt.isHoliday && !isSunday;

  return (
    <button
      onClick={() => onClick(date)}
      className={`aspect-square relative group rounded-lg md:rounded-2xl border-2 transition-all duration-300 overflow-hidden hover-lift active:scale-95 ${
        isSelected ? 'border-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-900/20 scale-105 z-10 shadow-lg' :
        hasConflict ? 'border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]' :
        leaveConfig ? `${leaveConfig.color} dark:bg-opacity-10 border-opacity-60 shadow-sm` : 
        isHoliday ? 'border-rose-300 bg-rose-50/60 dark:bg-rose-900/20 shadow-[inset_0_0_10px_rgba(244,63,94,0.05)]' :
        isToday ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10' : 
        isMissing ? 'border-amber-200/50 bg-amber-50/20 dark:bg-amber-900/10' :
        'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md'
      }`}
    >
      <span className={`absolute top-1 left-1 md:top-2 md:left-2 text-[10px] md:text-sm font-black transition-colors ${
        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 
        isToday ? 'text-indigo-600 dark:text-indigo-400' : 
        hasConflict ? 'text-rose-600 dark:text-rose-400' : 
        isHoliday ? 'text-rose-600 dark:text-rose-400' : 
        isMissing ? 'text-amber-600 dark:text-amber-400' :
        'text-slate-400 dark:text-slate-600'
      }`}>{dayNum}</span>
      
      {isSelected && (
         <div className="absolute top-1 right-1 md:top-2 md:left-2">
           <i className="fa-solid fa-circle-check text-[10px] md:text-sm text-indigo-600 dark:text-indigo-400 animate-in zoom-in"></i>
         </div>
      )}

      {isMissing && !isSelected && (
        <div className="absolute top-1 right-1 md:top-2 md:right-2">
           <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full animate-pulse shadow-sm" title="Missing attendance log"></div>
        </div>
      )}
      
      {hasConflict && !isSelected && (
         <div className="absolute top-1 right-1 md:top-2 md:right-2">
           <i className="fa-solid fa-circle-exclamation text-[10px] md:text-sm text-rose-500 animate-pulse"></i>
         </div>
      )}

      {!hasShift && leaveConfig && !isSelected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2 pointer-events-none">
          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl ${leaveConfig.dotColor} bg-opacity-20 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-white/40 dark:border-white/10`}>
            <i className={`fa-solid ${leaveConfig.icon} text-lg md:text-2xl ${leaveConfig.dotColor.replace('bg-', 'text-')} drop-shadow-sm`}></i>
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex flex-row sm:flex-col items-center sm:items-stretch justify-center sm:justify-end p-1 md:p-3 gap-1">
        {activeShifts.map(type => (
          <div 
            key={type}
            className="h-1 sm:h-2 rounded-full shadow-sm" 
            style={{ width: '100%', minWidth: '4px', backgroundColor: shiftColors[type] }}
          />
        ))}
      </div>
    </button>
  );
});

// --- Main App ---

const App: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeMonthIdx, setActiveMonthIdx] = useState(new Date().getMonth());
  const [focusedDate, setFocusedDate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectionSet, setSelectionSet] = useState<Set<string>>(new Set());
  const [isBulkEditing, setIsBulkEditing] = useState(false);

  // Persistence keys
  const ATTENDANCE_KEY = 'shift_attendance_v4';
  const QUOTAS_KEY = 'shift_quotas_v4';
  const TIMINGS_KEY = 'shift_timings_v4';
  const COLORS_KEY = 'shift_colors_v4';
  const VISIBILITY_KEY = 'shift_visibility_v4';
  const DEFAULT_VIEW_KEY = 'shift_default_view_v4';
  const DARK_MODE_KEY = 'shift_dark_mode_v4';

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      return saved === 'true';
    } catch (e) { return false; }
  });

  const [defaultViewMode, setDefaultViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(DEFAULT_VIEW_KEY);
      return (saved as ViewMode) || ViewMode.MONTH;
    } catch (e) { return ViewMode.MONTH; }
  });

  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);

  const [attendance, setAttendance] = useState<{ [key: string]: DayAttendance }>(() => {
    try {
      const saved = localStorage.getItem(ATTENDANCE_KEY);
      return saved ? (JSON.parse(saved) as { [key: string]: DayAttendance }) : {};
    } catch (e) { return {}; }
  });
  
  const [quotas, setQuotas] = useState<LeaveQuota>(() => {
    try {
      const saved = localStorage.getItem(QUOTAS_KEY);
      return saved ? JSON.parse(saved) : { 
        earned: 15, casual: 11, sick: 10,
        earnedRolloverMax: 150, casualRolloverMax: 0, sickRolloverMax: 150
      };
    } catch (e) { return { earned: 15, casual: 11, sick: 10, earnedRolloverMax: 150, casualRolloverMax: 0, sickRolloverMax: 150 }; }
  });

  const [shiftTimings, setShiftTimings] = useState<ShiftTimings>(() => {
    try {
      const saved = localStorage.getItem(TIMINGS_KEY);
      return saved ? JSON.parse(saved) : {
        morning: SHIFT_CONFIG.morning.time,
        evening: SHIFT_CONFIG.evening.time,
        night: SHIFT_CONFIG.night.time,
        general: SHIFT_CONFIG.general.time,
        pre: SHIFT_CONFIG.pre.time,
        middle: SHIFT_CONFIG.middle.time
      };
    } catch (e) { return { morning: '06:00-14:00', evening: '14:00-22:00', night: '22:00-06:00', general: '09:00-17:00', pre: '04:00-12:00', middle: '11:00-19:00' }; }
  });

  const [shiftColors, setShiftColors] = useState<ShiftColors>(() => {
    try {
      const saved = localStorage.getItem(COLORS_KEY);
      return saved ? JSON.parse(saved) : {
        morning: '#f59e0b', evening: '#0ea5e9', night: '#7c3aed', general: '#64748b', pre: '#06b6d4', middle: '#f97316'
      };
    } catch (e) { return { morning: '#f59e0b', evening: '#0ea5e9', night: '#7c3aed', general: '#64748b', pre: '#06b6d4', middle: '#f97316' }; }
  });

  const [enabledShifts, setEnabledShifts] = useState<Record<ShiftType, boolean>>(() => {
    try {
      const saved = localStorage.getItem(VISIBILITY_KEY);
      return saved ? JSON.parse(saved) : {
        morning: true, evening: true, night: true, general: false, pre: false, middle: false
      };
    } catch (e) { return { morning: true, evening: true, night: true, general: false, pre: false, middle: false }; }
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const yearMonthRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => { localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem(QUOTAS_KEY, JSON.stringify(quotas)); }, [quotas]);
  useEffect(() => { localStorage.setItem(TIMINGS_KEY, JSON.stringify(shiftTimings)); }, [shiftTimings]);
  useEffect(() => { localStorage.setItem(COLORS_KEY, JSON.stringify(shiftColors)); }, [shiftColors]);
  useEffect(() => { localStorage.setItem(VISIBILITY_KEY, JSON.stringify(enabledShifts)); }, [enabledShifts]);
  useEffect(() => { localStorage.setItem(DEFAULT_VIEW_KEY, defaultViewMode); }, [defaultViewMode]);
  useEffect(() => { 
    localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [viewMode]);

  const handleBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify({ attendance, quotas, shiftTimings, shiftColors, enabledShifts, defaultViewMode, isDarkMode })], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shift_backup_${formatDate(new Date())}.json`;
    link.click();
  }, [attendance, quotas, shiftTimings, shiftColors, enabledShifts, defaultViewMode, isDarkMode]);

  const handleResetData = () => {
    if (confirmReset) {
      // Prompt for backup before final wipe
      if (window.confirm("Would you like to download a backup of your current data before resetting? This is your last chance to save it.")) {
        handleBackup();
      }
      setAttendance({});
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const getAttendanceForDate = useCallback((date: Date): DayAttendance => {
    const key = formatDate(date);
    return attendance[key] || { morning: false, evening: false, night: false, general: false, pre: false, middle: false, leave: null, note: '', isHoliday: false, holidayName: '' };
  }, [attendance]);

  const clearSelection = useCallback(() => {
    setSelectionSet(new Set());
    setIsMultiSelectMode(false);
  }, []);

  const weekStatsMap = useMemo(() => {
    const credits: { [weekKey: string]: number } = {};
    const used: { [weekKey: string]: number } = {};
    const activeShiftTypes = (Object.keys(SHIFT_CONFIG) as ShiftType[]);

    (Object.entries(attendance) as [string, DayAttendance][]).forEach(([dateKey, day]) => {
      const parts = dateKey.split('-');
      if (parts.length < 3) return;
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const weekKey = getStartOfWeekKey(dateObj);
      
      const hasAnyShift = activeShiftTypes.some(t => day[t]);
      if (hasAnyShift) {
        if (dateObj.getDay() === 0 || day.isHoliday) credits[weekKey] = (credits[weekKey] || 0) + 1;
      }
      if (day.leave === LeaveType.REST) used[weekKey] = (used[weekKey] || 0) + 1;
    });

    return { credits, used };
  }, [attendance]);

  const checkRestEligibility = useCallback((date: Date) => {
    const weekKey = getStartOfWeekKey(date);
    const dayAttendance = getAttendanceForDate(date);
    return dayAttendance.leave === LeaveType.REST || (weekStatsMap.used[weekKey] || 0) < (weekStatsMap.credits[weekKey] || 0);
  }, [weekStatsMap, getAttendanceForDate]);

  const handleDayClick = useCallback((date: Date) => {
    const dayKey = formatDate(date);
    if (isMultiSelectMode) {
      setSelectionSet(prev => {
        const newSet = new Set(prev);
        if (newSet.has(dayKey)) newSet.delete(dayKey);
        else newSet.add(dayKey);
        return newSet;
      });
    } else {
      setSelectedDate(date);
      setFocusedDate(date);
    }
  }, [isMultiSelectMode]);

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setActiveMonthIdx(today.getMonth());
    setFocusedDate(today);
    setViewMode(ViewMode.MONTH);
  };

  const handleSaveAttendance = (date: Date, newAtt: DayAttendance) => {
    const key = formatDate(date);
    setAttendance(prev => ({ ...prev, [key]: newAtt }));
  };

  const handleApplyBulk = (template: DayAttendance) => {
    setAttendance(prev => {
      const next: { [key: string]: DayAttendance } = { ...prev };
      selectionSet.forEach(key => { 
        next[key] = { ...template }; 
      });
      return next;
    });
    clearSelection();
    setIsBulkEditing(false);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.attendance) setAttendance(data.attendance);
        if (data.quotas) setQuotas(data.quotas);
        if (data.shiftTimings) setShiftTimings(data.shiftTimings);
        if (data.shiftColors) setShiftColors(data.shiftColors);
        if (data.enabledShifts) setEnabledShifts(data.enabledShifts);
        if (data.defaultViewMode) setDefaultViewMode(data.defaultViewMode);
        if (typeof data.isDarkMode === 'boolean') setIsDarkMode(data.isDarkMode);
        alert("Restore Complete!");
      } catch (err) { alert("Invalid File"); }
    };
    reader.readAsText(file);
  };

  const daysInMonth = useMemo(() => {
    const days = [];
    const date = new Date(currentYear, activeMonthIdx, 1);
    while (date.getMonth() === activeMonthIdx) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentYear, activeMonthIdx]);

  const currentWeekDays = useMemo(() => {
    const days = [];
    const start = new Date(focusedDate);
    start.setDate(focusedDate.getDate() - focusedDate.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [focusedDate]);

  const getStatsForRange = useCallback((prefix: string, dates?: Date[]) => {
    const activeTypes = (Object.keys(SHIFT_CONFIG) as ShiftType[]);
    let stats: any = { el: 0, cl: 0, sl: 0, lop: 0, totalWorked: 0, totalLeave: 0, missingLogs: 0 };
    activeTypes.forEach(t => stats[t] = 0);

    const todayStart = new Date().setHours(0, 0, 0, 0);

    const checkDate = (key: string, data: DayAttendance, dateObj: Date) => {
      const hasShift = activeTypes.some(t => data[t]);
      if (hasShift) {
        activeTypes.forEach(t => { if (data[t]) { stats[t]++; stats.totalWorked++; } });
      }
      
      if (data.leave === LeaveType.EARNED) { stats.el++; stats.totalLeave++; }
      else if (data.leave === LeaveType.CASUAL) { stats.cl++; stats.totalLeave++; }
      else if (data.leave === LeaveType.SICK) { stats.sl++; stats.totalLeave++; }
      else if (data.leave === LeaveType.LOP) { stats.lop++; }

      if (dateObj.getTime() < todayStart && dateObj.getDay() !== 0) {
        if (!hasShift && !data.leave && !data.isHoliday) {
          stats.missingLogs++;
        }
      }
    };

    if (dates) {
      dates.forEach(d => {
        const key = formatDate(d);
        checkDate(key, attendance[key] || { morning: false, evening: false, night: false, general: false, pre: false, middle: false, leave: null }, d);
      });
    } else {
      const [year, month] = prefix.split('-').map(Number);
      if (!isNaN(year)) {
        const start = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1);
        const end = month ? new Date(year, month, 0) : new Date(year, 11, 31);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = formatDate(d);
          checkDate(key, attendance[key] || { morning: false, evening: false, night: false, general: false, pre: false, middle: false, leave: null }, new Date(d));
        }
      }
    }
    return stats;
  }, [attendance]);

  const annualSummary = useMemo(() => {
    const yearStats = getStatsForRange(`${currentYear}-`);
    const yearsWithData = Object.keys(attendance).map(k => parseInt(k.split('-')[0])).filter(y => !isNaN(y));
    const startYear = yearsWithData.length > 0 ? Math.min(...yearsWithData) : currentYear;
    
    let rollEL = 0, rollCL = 0, rollSL = 0;
    const ROLLOVER_CAP_EL = 150, ROLLOVER_CAP_SL = 150, ROLLOVER_CAP_CL = 0;

    for (let y = startYear; y < currentYear; y++) {
      const stats = getStatsForRange(`${y}-`);
      rollEL = Math.max(0, Math.min(ROLLOVER_CAP_EL, (quotas.earned + rollEL) - stats.el));
      rollSL = Math.max(0, Math.min(ROLLOVER_CAP_SL, (quotas.sick + rollSL) - stats.sl));
      rollCL = Math.max(0, Math.min(ROLLOVER_CAP_CL, (quotas.casual + rollCL) - stats.cl));
    }

    return { year: yearStats, rollover: { earned: rollEL, casual: rollCL, sick: rollSL } };
  }, [getStatsForRange, currentYear, attendance, quotas]);

  const activeStats = useMemo(() => {
    if (viewMode === ViewMode.YEAR || viewMode === ViewMode.STATS) return annualSummary.year;
    if (viewMode === ViewMode.MONTH) return getStatsForRange(`${currentYear}-${String(activeMonthIdx + 1).padStart(2, '0')}-`);
    return getStatsForRange('', currentWeekDays);
  }, [viewMode, annualSummary, activeMonthIdx, currentYear, currentWeekDays, getStatsForRange]);

  const getWeekRangeLabel = () => {
    const start = currentWeekDays[0];
    const end = currentWeekDays[6];
    return `${start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;
  };

  const yearlyMonthlyBreakdown = useMemo(() => {
    return MONTHS.map((_, idx) => getStatsForRange(`${currentYear}-${String(idx + 1).padStart(2, '0')}-`));
  }, [currentYear, getStatsForRange]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-calendar-check text-indigo-600 dark:text-indigo-400 text-2xl"></i>
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">ShiftTracker <span className="text-indigo-600 dark:text-indigo-400">Pro</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[ViewMode.WEEK, ViewMode.MONTH, ViewMode.YEAR, ViewMode.STATS].map((mode) => (
                <button 
                  key={mode} 
                  onClick={() => { setViewMode(mode); clearSelection(); }}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === mode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
              <button onClick={() => setCurrentYear(prev => prev - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500"><i className="fa-solid fa-chevron-left text-[10px]"></i></button>
              <span className="px-3 font-black text-slate-800 dark:text-slate-200 text-sm">{currentYear}</span>
              <button onClick={() => setCurrentYear(prev => prev + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500"><i className="fa-solid fa-chevron-right text-[10px]"></i></button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest">
                <i className="fa-solid fa-cloud-slash"></i> Offline Mode
              </div>
            )}
            <button onClick={() => setIsMultiSelectMode(!isMultiSelectMode)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isMultiSelectMode ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
              <i className="fa-solid fa-list-check"></i>{isMultiSelectMode ? 'Exit Select' : 'Multi-Select'}
            </button>
            <button onClick={goToToday} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-all">
              <i className="fa-solid fa-calendar-day"></i>{new Date().getDate()} {MONTHS[new Date().getMonth()].substring(0,3).toUpperCase()}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400">
              <i className="fa-solid fa-sliders"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-10">
        {viewMode === ViewMode.STATS ? (
          <div className="animate-view-fade-in space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-briefcase"></i></div>
                <div><p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Worked</p><h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{activeStats.totalWorked} <span className="text-[10px] text-slate-300 dark:text-slate-600">Days</span></h4></div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-umbrella-beach"></i></div>
                <div><p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Leaves</p><h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{activeStats.totalLeave} <span className="text-[10px] text-slate-300 dark:text-slate-600">Days</span></h4></div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-chart-line"></i></div>
                <div><p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Efficiency</p><h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{Math.round((activeStats.totalWorked / 365) * 100)}%</h4></div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-xl flex items-center justify-center text-xl"><i className="fa-solid fa-heart-pulse"></i></div>
                <div><p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Health</p><h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">{Math.max(10, 100 - activeStats.sl * 5)}%</h4></div>
              </div>
              <div className={`p-6 rounded-[2rem] border shadow-sm flex items-center gap-4 transition-all ${activeStats.missingLogs > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${activeStats.missingLogs > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}><i className="fa-solid fa-circle-exclamation"></i></div>
                <div><p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Missing Records</p><h4 className={`text-2xl font-black ${activeStats.missingLogs > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'}`}>{activeStats.missingLogs}</h4></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Shift Mix <span className="text-indigo-600 dark:text-indigo-400">Overview</span></h3>
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500"><i className="fa-solid fa-pie-chart"></i></div>
                </div>
                <div className="space-y-8">
                  {(Object.keys(SHIFT_CONFIG) as ShiftType[]).filter(t => enabledShifts[t] || activeStats[t] > 0).map(type => {
                    const count = activeStats[type];
                    const percent = activeStats.totalWorked > 0 ? (count / activeStats.totalWorked) * 100 : 0;
                    return (
                      <div key={type} className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md" style={{ backgroundColor: shiftColors[type] }}><i className={`fa-solid ${SHIFT_CONFIG[type].icon} text-[10px]`}></i></div>
                            <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">{SHIFT_CONFIG[type].label}</span>
                          </div>
                          <span className="text-[11px] font-black text-slate-400 dark:text-slate-500">{count} Shifts ({Math.round(percent)}%)</span>
                        </div>
                        <div className="h-4 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${percent}%`, backgroundColor: shiftColors[type] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 dark:bg-black/40 p-10 rounded-[2.5rem] text-white shadow-2xl overflow-hidden relative border dark:border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black tracking-tight">Leave Utilization</h3>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-400"><i className="fa-solid fa-gauge-high"></i></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {['earned', 'casual', 'sick'].map(key => {
                      const config = (LEAVE_CONFIG as any)[key];
                      const baseQuota = quotas[key as keyof LeaveQuota] as number;
                      const rolledOver = (annualSummary.rollover as any)[key] || 0;
                      const totalQuota = baseQuota + rolledOver;
                      const used = annualSummary.year[key === 'earned' ? 'el' : key === 'casual' ? 'cl' : 'sl'];
                      const remaining = Math.max(0, totalQuota - used);
                      const percent = Math.min(100, (used / (totalQuota || 1)) * 100);
                      
                      return (
                        <div key={key} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center text-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${config.dotColor} bg-opacity-20 ${config.dotColor.replace('bg-', 'text-')}`}>
                            <i className={`fa-solid ${config.icon}`}></i>
                          </div>
                          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-1">{config.label}</h4>
                          <p className="text-2xl font-black mb-4">{remaining}<span className="text-xs text-white/40 ml-1">/{totalQuota}</span></p>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full ${config.dotColor}`} style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Yearly Activity Ledger</h3>
                <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800 uppercase tracking-widest">{currentYear} Monthly Statistics</div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50 dark:border-slate-800">
                      <th className="pb-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Month</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">Worked</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">Leaves</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">LOP</th>
                      <th className="pb-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Activity %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {MONTHS.map((month, idx) => {
                      const stats = yearlyMonthlyBreakdown[idx];
                      const totalInMonth = new Date(currentYear, idx + 1, 0).getDate();
                      const activityPercent = Math.round((stats.totalWorked / totalInMonth) * 100);
                      
                      return (
                        <tr key={month} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-6"><span className="text-sm font-black text-slate-800 dark:text-slate-200">{month}</span></td>
                          <td className="py-6">
                            <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                              <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">{stats.totalWorked}</span>
                              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(stats.totalWorked / totalInMonth) * 100}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6">
                            <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">{stats.totalLeave}</span>
                              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(stats.totalLeave / totalInMonth) * 100}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 text-center"><span className={`inline-block px-3 py-1 ${stats.lop > 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600'} rounded-lg text-xs font-black`}>{stats.lop}</span></td>
                          <td className="py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-xs font-black text-slate-600 dark:text-slate-400">{activityPercent}%</span>
                              <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: `${activityPercent}%` }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative touch-pan-y no-scrollbar">
              {viewMode === ViewMode.MONTH && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 overflow-hidden">
                  <div ref={tabsRef} className="flex-1 flex overflow-x-auto gap-2 py-2 no-scrollbar">
                    {MONTHS.map((month, idx) => (
                      <button key={month} onClick={() => { setActiveMonthIdx(idx); clearSelection(); }} className={`flex-none px-6 py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${activeMonthIdx === idx ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'}`}>{month}</button>
                    ))}
                  </div>
                </div>
              )}
              
              <div key={`${viewMode}-${activeMonthIdx}-${focusedDate.getTime()}`} className="animate-view-fade-in">
                {viewMode === ViewMode.WEEK && (
                  <div className="p-4 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{getWeekRangeLabel()}</h2>
                      <div className="flex gap-2">
                        <button onClick={() => { const d = new Date(focusedDate); d.setDate(d.getDate() - 7); setFocusedDate(d); }} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><i className="fa-solid fa-chevron-left"></i></button>
                        <button onClick={() => { const d = new Date(focusedDate); d.setDate(d.getDate() + 7); setFocusedDate(d); }} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><i className="fa-solid fa-chevron-right"></i></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                      {DAYS_OF_WEEK.map(day => <div key={day} className="text-center text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 py-1 uppercase tracking-wider">{day}</div>)}
                      {currentWeekDays.map(date => <InteractiveDayCell key={formatDate(date)} date={date} attendance={getAttendanceForDate(date)} isToday={new Date().toDateString() === date.toDateString()} isSelected={selectionSet.has(formatDate(date))} shiftColors={shiftColors} onClick={handleDayClick} />)}
                    </div>
                  </div>
                )}
                {viewMode === ViewMode.MONTH && (
                  <div className="p-2 md:p-8">
                    {isMultiSelectMode && (
                      <div className="flex gap-2 mb-6">
                        <button onClick={() => setSelectionSet(new Set(daysInMonth.map(d => formatDate(d))))} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-widest">Select Month</button>
                        <button onClick={() => setSelectionSet(new Set())} className="px-4 py-2 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/50 ml-auto">Clear</button>
                      </div>
                    )}
                    <div className="grid grid-cols-7 gap-1 md:gap-4">
                      {DAYS_OF_WEEK.map(day => <div key={day} className="text-center text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 py-1 uppercase tracking-wider">{day}</div>)}
                      {Array(new Date(currentYear, activeMonthIdx, 1).getDay()).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
                      {daysInMonth.map(date => <InteractiveDayCell key={formatDate(date)} date={date} attendance={getAttendanceForDate(date)} isToday={new Date().toDateString() === date.toDateString()} isSelected={selectionSet.has(formatDate(date))} shiftColors={shiftColors} onClick={handleDayClick} />)}
                    </div>
                  </div>
                )}
                {viewMode === ViewMode.YEAR && (
                  <div className="p-4 md:p-8 space-y-16">
                    {MONTHS.map((m, idx) => {
                      const days = [];
                      const date = new Date(currentYear, idx, 1);
                      while (date.getMonth() === idx) {
                        days.push(new Date(date));
                        date.setDate(date.getDate() + 1);
                      }
                      return (
                        <div key={m} ref={el => { yearMonthRefs.current[idx] = el; }} className="space-y-6">
                          <div className="flex items-center gap-4 px-2">
                             <h3 className="text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">{m} {currentYear}</h3>
                          </div>
                          <div className="grid grid-cols-7 gap-1 md:gap-4 bg-white/40 dark:bg-slate-800/40 p-2 md:p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                            {DAYS_OF_WEEK.map(day => <div key={day} className="text-center text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 py-1 uppercase tracking-wider">{day}</div>)}
                            {Array(new Date(currentYear, idx, 1).getDay()).fill(null).map((_, i) => <div key={`pad-${idx}-${i}`} className="aspect-square" />)}
                            {days.map(d => (
                              <InteractiveDayCell key={formatDate(d)} date={d} attendance={getAttendanceForDate(d)} isToday={new Date().toDateString() === d.toDateString()} isSelected={selectionSet.has(formatDate(d))} shiftColors={shiftColors} onClick={handleDayClick} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
              <div className="lg:col-span-2 space-y-6 md:space-y-10">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      {viewMode === ViewMode.YEAR ? `${currentYear} Annual Summary` : 
                      viewMode === ViewMode.MONTH ? `${MONTHS[activeMonthIdx]} Summary` : 
                      `Weekly Summary (${getWeekRangeLabel()})`}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Shift Split</p>
                      <div className="grid grid-cols-3 gap-4">
                        {(Object.keys(SHIFT_CONFIG) as ShiftType[]).filter(t => enabledShifts[t] || activeStats[t] > 0).map(type => (
                          <div key={type} className="text-center">
                            <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white shadow-md mb-2" style={{ backgroundColor: shiftColors[type] }}><i className={`fa-solid ${SHIFT_CONFIG[type].icon} text-xs`}></i></div>
                            <div className="text-xl font-black text-slate-800 dark:text-slate-200">{activeStats[type]}</div>
                            <div className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase">{SHIFT_CONFIG[type].label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Annual Leave Balance</p>
                      <div className="space-y-4">
                        {['earned', 'casual', 'sick'].map(key => {
                          const config = (LEAVE_CONFIG as any)[key];
                          const baseQuota = quotas[key as keyof LeaveQuota] as number;
                          const rolledOver = (annualSummary.rollover as any)[key] || 0;
                          const totalQuota = baseQuota + rolledOver;
                          const used = annualSummary.year[key === 'earned' ? 'el' : key === 'casual' ? 'cl' : 'sl'];
                          const remaining = Math.max(0, totalQuota - used);
                          const percent = Math.min(100, (used / (totalQuota || 1)) * 100);
                          return (
                            <div key={key} className="space-y-2">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{config.label}</span>
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500"><span className="text-slate-800 dark:text-slate-200">{remaining}</span> / {totalQuota} left</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${config.dotColor}`} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 md:space-y-10">
                <div className="bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border dark:border-slate-800">
                  <h3 className="text-base font-black mb-6 flex items-center gap-3"><i className="fa-solid fa-circle-info text-indigo-400"></i>Legend</h3>
                  <div className="space-y-4">
                    {(Object.keys(SHIFT_CONFIG) as ShiftType[]).filter(t => enabledShifts[t] || activeStats[t] > 0).map((key) => (
                      <div key={key} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: shiftColors[key as ShiftType] }}><i className={`fa-solid ${SHIFT_CONFIG[key].icon} text-[10px]`}></i></div>
                        <span className="text-xs font-black text-slate-300 dark:text-slate-400">{SHIFT_CONFIG[key].label} ({shiftTimings[key as ShiftType]})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        shiftColors={shiftColors} 
        setShiftColors={setShiftColors} 
        quotas={quotas} 
        setQuotas={setQuotas} 
        shiftTimings={shiftTimings} 
        setShiftTimings={setShiftTimings} 
        enabledShifts={enabledShifts} 
        setEnabledShifts={setEnabledShifts} 
        defaultViewMode={defaultViewMode}
        setDefaultViewMode={setDefaultViewMode}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        handleBackup={handleBackup} 
        handleRestore={handleRestore} 
        handleResetData={handleResetData} 
        confirmReset={confirmReset} 
      />
      {selectedDate && <ShiftSelector date={selectedDate} attendance={getAttendanceForDate(selectedDate)} shiftTimings={shiftTimings} shiftColors={shiftColors} enabledShifts={enabledShifts} canMarkRest={checkRestEligibility(selectedDate)} onConfirm={(final) => handleSaveAttendance(selectedDate, final)} onClose={() => setSelectedDate(null)} />}
      {isBulkEditing && <ShiftSelector bulkCount={selectionSet.size} attendance={{ morning: false, evening: false, night: false, general: false, pre: false, middle: false, leave: null }} shiftTimings={shiftTimings} shiftColors={shiftColors} enabledShifts={enabledShifts} onConfirm={handleApplyBulk} onClose={() => setIsBulkEditing(false)} />}
      {selectionSet.size > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-4"><div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-layer-group"></i></div><span className="font-black text-sm">{selectionSet.size} Days</span></div>
            <div className="flex gap-3"><button onClick={clearSelection} className="text-[10px] font-black uppercase text-slate-400">Cancel</button><button onClick={() => setIsBulkEditing(true)} className="px-6 py-3 bg-indigo-600 rounded-xl font-black text-[10px] uppercase">Update All</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
