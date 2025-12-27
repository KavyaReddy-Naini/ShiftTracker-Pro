
import React, { useState, useRef } from 'react';
import { ShiftType, LeaveType, LeaveQuota, ShiftTimings, ShiftColors, ViewMode } from '../types';
import { SHIFT_CONFIG, LEAVE_CONFIG } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftColors: ShiftColors;
  setShiftColors: (colors: ShiftColors) => void;
  quotas: LeaveQuota;
  setQuotas: (quotas: LeaveQuota) => void;
  shiftTimings: ShiftTimings;
  setShiftTimings: (timings: ShiftTimings) => void;
  enabledShifts: Record<ShiftType, boolean>;
  setEnabledShifts: (visibility: Record<ShiftType, boolean>) => void;
  defaultViewMode: ViewMode;
  setDefaultViewMode: (mode: ViewMode) => void;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  handleBackup: () => void;
  handleRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetData: () => void;
  confirmReset: boolean;
}

enum SettingTab {
  SHIFTS = 'shifts',
  QUOTAS = 'quotas',
  DATA = 'data',
  ABOUT = 'about'
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, shiftColors, setShiftColors, quotas, setQuotas, shiftTimings, setShiftTimings,
  enabledShifts, setEnabledShifts, defaultViewMode, setDefaultViewMode, isDarkMode, setIsDarkMode, handleBackup, handleRestore, handleResetData, confirmReset
}) => {
  const [activeTab, setActiveTab] = useState<SettingTab>(SettingTab.SHIFTS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const updateQuota = (key: string, value: number) => {
    let finalValue = value;
    if (key === 'casual') finalValue = Math.min(11, Math.max(0, value));
    setQuotas({ ...quotas, [key]: finalValue });
  };

  const toggleShiftVisibility = (type: ShiftType) => {
    setEnabledShifts({ ...enabledShifts, [type]: !enabledShifts[type] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-md p-4 animate-in fade-in transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[85vh] border border-white/20 dark:border-slate-800">
        
        <aside className="w-full md:w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><i className="fa-solid fa-sliders"></i></div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm">Settings</h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">ShiftTracker Pro</p>
            </div>
          </div>
          {[
            { id: SettingTab.SHIFTS, label: 'Shifts', icon: 'fa-calendar-day' },
            { id: SettingTab.QUOTAS, label: 'Leave Quotas', icon: 'fa-list-check' },
            { id: SettingTab.DATA, label: 'Data Management', icon: 'fa-database' },
            { id: SettingTab.ABOUT, label: 'About', icon: 'fa-circle-info' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as SettingTab)} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <i className={`fa-solid ${tab.icon} w-4`}></i>{tab.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{activeTab}</h2>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800"><i className="fa-solid fa-xmark"></i></button>
          </header>

          <main className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900 space-y-8 no-scrollbar">
            {activeTab === SettingTab.SHIFTS && (
              <div className="space-y-10">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">General Preferences</h4>
                  <div className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Default View Mode</h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">View to show when the app starts</p>
                      </div>
                      <div className="flex bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                        {[ViewMode.WEEK, ViewMode.MONTH, ViewMode.YEAR].map((mode) => (
                          <button 
                            key={mode} 
                            onClick={() => setDefaultViewMode(mode)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${defaultViewMode === mode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Dark Mode</h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Switch between light and dark themes</p>
                      </div>
                      <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-11 h-6 flex items-center rounded-full transition-all duration-300 relative px-1 ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Shift Configuration</h4>
                  <div className="space-y-4">
                    {(Object.keys(SHIFT_CONFIG) as ShiftType[]).map(type => (
                      <div key={type} className={`p-6 rounded-3xl border transition-all flex flex-col gap-6 ${enabledShifts[type] ? 'border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 opacity-60'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm`} style={{ backgroundColor: enabledShifts[type] ? shiftColors[type] : '#94a3b8' }}>
                              <i className={`fa-solid ${SHIFT_CONFIG[type].icon}`}></i>
                            </div>
                            <div>
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">{SHIFT_CONFIG[type].label} Shift</h5>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{enabledShifts[type] ? 'Active' : 'Disabled'}</p>
                            </div>
                          </div>
                          <button onClick={() => toggleShiftVisibility(type)} className={`w-11 h-6 flex items-center rounded-full transition-all duration-300 relative px-1 ${enabledShifts[type] ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabledShifts[type] ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {enabledShifts[type] && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Shift Timing</label>
                              <input 
                                type="text" 
                                value={shiftTimings[type]} 
                                onChange={(e) => setShiftTimings({...shiftTimings, [type]: e.target.value})} 
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-300 dark:focus:border-indigo-800 transition-colors"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Color Theme</label>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="color" 
                                  value={shiftColors[type]} 
                                  onChange={(e) => setShiftColors({...shiftColors, [type]: e.target.value})} 
                                  className="w-12 h-11 p-0 rounded-xl cursor-pointer border-none bg-transparent" 
                                />
                                <div className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-slate-800 dark:text-slate-200 text-[10px] uppercase">
                                  {shiftColors[type]}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === SettingTab.QUOTAS && (
              <div className="space-y-10">
                <section>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Annual Leave Base Quotas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['earned', 'casual', 'sick'].map(type => (
                      <div key={type} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(LEAVE_CONFIG as any)[type].dotColor} bg-opacity-20 ${(LEAVE_CONFIG as any)[type].dotColor.replace('bg-', 'text-')}`}>
                            <i className={`fa-solid ${(LEAVE_CONFIG as any)[type].icon}`}></i>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{(LEAVE_CONFIG as any)[type].label}</span>
                        </div>
                        <input type="number" value={quotas[type as keyof LeaveQuota]} onChange={(e) => updateQuota(type, parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-300 dark:focus:border-indigo-800" />
                      </div>
                    ))}
                  </div>
                </section>
                <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                   <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed font-medium">
                     <i className="fa-solid fa-circle-info mr-2"></i>
                     These quotas represent your base entitlement per calendar year. Balances are calculated by adding base quotas to rollovers from previous years, minus used leaves.
                   </p>
                </div>
              </div>
            )}

            {activeTab === SettingTab.DATA && (
              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={handleBackup} className="p-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-[2rem] text-emerald-700 dark:text-emerald-300 flex flex-col items-center group transition-all hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40"><i className="fa-solid fa-download text-2xl mb-4 group-hover:bounce"></i><span className="font-black text-xs uppercase tracking-widest">Backup Data</span></button>
                  <button onClick={() => fileInputRef.current?.click()} className="p-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-[2rem] text-indigo-700 dark:text-indigo-300 flex flex-col items-center group transition-all hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40"><i className="fa-solid fa-upload text-2xl mb-4 group-hover:bounce"></i><span className="font-black text-xs uppercase tracking-widest">Restore Data</span><input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept=".json" /></button>
                </div>
                <div className="p-8 bg-rose-50 dark:bg-rose-900/20 rounded-[2.5rem] border-2 border-rose-100 dark:border-rose-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div><h4 className="font-black text-rose-900 dark:text-rose-200">Danger Zone</h4><p className="text-xs text-rose-700/60 dark:text-rose-400/60 mt-1">This will delete all attendance records and reset settings.</p></div>
                  <button onClick={handleResetData} className="px-10 py-4 bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white dark:hover:text-white transition-all">{confirmReset ? 'Confirm Reset' : 'Reset All Data'}</button>
                </div>
              </div>
            )}

            {activeTab === SettingTab.ABOUT && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <h3 className="text-3xl font-black mb-2 tracking-tight">ShiftTracker Pro</h3>
                  <p className="text-indigo-100 text-sm font-semibold opacity-80">Professional Attendance Suite</p>
                  
                  <div className="mt-8 flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                      <i className="fa-solid fa-code-branch"></i> Version 4.1.0-stable
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                      <i className="fa-solid fa-code"></i> Developer: Soumith Uppu
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-xl flex items-center justify-center mb-6"><i className="fa-solid fa-bullseye"></i></div>
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Core Mission</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Designed specifically for shift workers, ShiftTracker Pro empowers you to visualize your schedule and manage leaves effectively through an intuitive interface.
                    </p>
                  </div>
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center justify-center mb-6"><i className="fa-solid fa-shield-halved"></i></div>
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Privacy & Data</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Your data stays yours. All attendance records are stored locally on your device. The app operates entirely offline with no remote tracking.
                    </p>
                  </div>
                </div>

                <div className="p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 text-2xl"><i className="fa-solid fa-rocket"></i></div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Tech Stack</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
                    Powered by React 19 and Tailwind CSS 3. Built with performance and offline-first capabilities in mind for a seamless experience.
                  </p>
                  <div className="mt-8 flex gap-4">
                    <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"><i className="fa-brands fa-github"></i></div>
                    <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"><i className="fa-solid fa-globe"></i></div>
                  </div>
                </div>
                
                <p className="text-center text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">© 2024 ShiftTracker Pro. Licensed under MIT.</p>
              </div>
            )}
          </main>
          <footer className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"><button onClick={onClose} className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all">Save & Exit</button></footer>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
