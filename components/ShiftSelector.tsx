
import React, { useState } from 'react';
import { ShiftType, LeaveType, DayAttendance, ShiftTimings, ShiftColors } from '../types';
import { SHIFT_CONFIG, LEAVE_CONFIG } from '../constants';

interface ShiftSelectorProps {
  date?: Date;
  bulkCount?: number;
  attendance: DayAttendance;
  shiftTimings: ShiftTimings;
  shiftColors: ShiftColors;
  enabledShifts: Record<ShiftType, boolean>;
  canMarkRest?: boolean; 
  onConfirm: (finalAttendance: DayAttendance) => void;
  onClose: () => void;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ 
  date, bulkCount, attendance, shiftTimings, shiftColors, enabledShifts, canMarkRest, onConfirm, onClose 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localAttendance, setLocalAttendance] = useState<DayAttendance>(attendance);

  const isBulk = !!bulkCount;

  const handleToggleShift = (type: ShiftType) => {
    setLocalAttendance(prev => ({
      ...prev,
      [type]: !prev[type],
      leave: prev[type] ? prev.leave : null 
    }));
  };

  const handleToggleLeave = (type: LeaveType | null) => {
    setLocalAttendance(prev => ({
      ...prev,
      leave: type,
      morning: type ? false : prev.morning,
      evening: type ? false : prev.evening,
      night: type ? false : prev.night,
      general: type ? false : prev.general,
      pre: type ? false : prev.pre,
      middle: type ? false : prev.middle
    }));
  };

  const handleUpdateNote = (note: string) => setLocalAttendance(prev => ({ ...prev, note }));
  const handleToggleHoliday = () => setLocalAttendance(prev => ({ ...prev, isHoliday: !prev.isHoliday }));
  const handleUpdateHolidayName = (name: string) => setLocalAttendance(prev => ({ ...prev, holidayName: name }));

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onConfirm(localAttendance);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => onClose(), 600);
    }, 400);
  };

  const isResting = localAttendance.leave === LeaveType.REST;
  const isSunday = date?.getDay() === 0;
  const showRestSection = !isBulk && !localAttendance.isHoliday && !isSunday && canMarkRest;
  
  // Include shifts that are globally enabled OR currently active for this specific day
  const activeShiftList = (Object.keys(SHIFT_CONFIG) as ShiftType[]).filter(t => enabledShifts[t] || localAttendance[t]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{isBulk ? `Apply to ${bulkCount} Days` : date?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">{isBulk ? 'Configure Bulk Template' : 'Daily Schedule Log'}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"><i className="fa-solid fa-xmark text-lg"></i></button>
        </div>
        
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          <section className="bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${localAttendance.isHoliday ? 'bg-rose-500 text-white' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-400 dark:text-rose-500'}`}><i className="fa-solid fa-holly-berry"></i></div>
                <h4 className="text-[10px] font-black text-rose-900/50 dark:text-rose-400/50 uppercase tracking-[0.2em]">Public Holiday</h4>
              </div>
              <button onClick={handleToggleHoliday} className={`w-11 h-6 flex items-center rounded-full transition-all duration-300 relative px-1 ${localAttendance.isHoliday ? 'bg-rose-500' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${localAttendance.isHoliday ? 'translate-x-5' : 'translate-x-0'}`} /></button>
            </div>
            {localAttendance.isHoliday && <input type="text" value={localAttendance.holidayName || ''} onChange={(e) => handleUpdateHolidayName(e.target.value)} placeholder="Holiday Name (e.g. Christmas)" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold outline-none dark:text-rose-100" />}
          </section>

          {showRestSection && (
            <section className="p-5 rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 border-dashed bg-indigo-50/40 dark:bg-indigo-900/10 transition-all duration-300 animate-in slide-in-from-top-2">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isResting ? 'bg-indigo-600 text-white rotate-12 scale-110' : 'bg-white dark:bg-slate-800 text-indigo-400'}`}><i className="fa-solid fa-couch text-xl"></i></div>
                    <div><h4 className="text-[10px] font-black text-indigo-900/50 dark:text-indigo-300/50 uppercase tracking-[0.2em]">Compensatory Rest</h4><p className="text-xs font-black leading-tight text-indigo-600 dark:text-indigo-400">Eligible for Rest Day</p></div>
                  </div>
                  <div className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-md tracking-widest shadow-sm">Benefit</div>
                </div>
                <button onClick={() => handleToggleLeave(isResting ? null : LeaveType.REST)} className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${isResting ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30'}`}>{isResting && <i className="fa-solid fa-check"></i>}{isResting ? 'Marked as Rest Day' : 'Mark as Rest Day'}</button>
              </div>
            </section>
          )}

          <section>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Active Shifts</h4>
            <div className={`grid gap-3 ${activeShiftList.length > 3 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {activeShiftList.map((type) => {
                const isActive = localAttendance[type];
                return (
                  <button key={type} onClick={() => handleToggleShift(type)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isActive ? 'border-opacity-100 ring-4 ring-indigo-50 dark:ring-indigo-900/20 bg-white dark:bg-slate-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`} style={isActive ? { borderColor: shiftColors[type] + '44' } : {}}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50'}`}><i className={`fa-solid ${SHIFT_CONFIG[type].icon} text-base`} style={{ color: isActive ? shiftColors[type] : '#cbd5e1' }}></i></div>
                      <p className="font-black text-xs" style={{ color: isActive ? shiftColors[type] : (document.documentElement.classList.contains('dark') ? '#94a3b8' : '#334155') }}>{SHIFT_CONFIG[type].label}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: isActive ? shiftColors[type] : 'transparent', borderColor: isActive ? shiftColors[type] : (document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0') }}>{isActive && <i className="fa-solid fa-check text-[8px] text-white"></i>}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Absence & Leave</h4>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(LEAVE_CONFIG) as LeaveType[]).filter(type => type !== LeaveType.REST).map((type) => {
                const config = (LEAVE_CONFIG as any)[type];
                const isActive = localAttendance.leave === type;
                return (
                  <button key={type} onClick={() => handleToggleLeave(isActive ? null : type)} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all ${isActive ? `${config.color.split(' ')[0]} dark:bg-opacity-20 border-opacity-100 ring-4 ring-emerald-50 dark:ring-emerald-900/10` : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isActive ? 'bg-white dark:bg-slate-700' : 'bg-slate-50 dark:bg-slate-900/50'}`}><i className={`fa-solid ${config.icon} text-xl ${isActive ? config.color.split(' ')[1] : 'text-slate-300 dark:text-slate-600'}`}></i></div>
                    <p className={`font-black text-[11px] uppercase tracking-wider ${isActive ? config.color.split(' ')[1] : 'text-slate-700 dark:text-slate-400'}`}>{config.label}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Notes</h4>
            <textarea value={localAttendance.note || ''} onChange={(e) => handleUpdateNote(e.target.value)} placeholder="Record any specific details..." className="w-full p-5 bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800 rounded-3xl outline-none min-h-[140px] resize-none text-sm font-medium dark:text-slate-200" />
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800"><button onClick={handleSave} disabled={isSaving || saveSuccess} className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${saveSuccess ? 'bg-emerald-600 text-white' : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400'}`}>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Confirm & Save'}</button></div>
      </div>
    </div>
  );
};

export default ShiftSelector;
