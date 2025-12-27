
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SHIFT_CONFIG = {
  morning: {
    label: 'Morning',
    icon: 'fa-sun',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    time: '06:00 - 14:00'
  },
  evening: {
    label: 'Evening',
    icon: 'fa-cloud-sun',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    dotColor: 'bg-sky-500',
    time: '14:00 - 22:00'
  },
  night: {
    label: 'Night',
    icon: 'fa-moon',
    color: 'bg-violet-50 text-violet-700 border-violet-200',
    dotColor: 'bg-violet-600',
    time: '22:00 - 06:00'
  },
  general: {
    label: 'General',
    icon: 'fa-briefcase',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    dotColor: 'bg-slate-500',
    time: '09:00 - 17:00'
  },
  pre: {
    label: 'Pre-shift',
    icon: 'fa-coffee',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dotColor: 'bg-cyan-500',
    time: '04:00 - 12:00'
  },
  middle: {
    label: 'Middle',
    icon: 'fa-clock',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    dotColor: 'bg-orange-500',
    time: '11:00 - 19:00'
  }
};

export const LEAVE_CONFIG = {
  earned: {
    label: 'Earned Leave',
    shortLabel: 'EL',
    icon: 'fa-umbrella-beach',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500'
  },
  casual: {
    label: 'Casual Leave',
    shortLabel: 'CL',
    icon: 'fa-mug-hot',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500'
  },
  sick: {
    label: 'Sick Leave',
    shortLabel: 'SL',
    icon: 'fa-briefcase-medical',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500'
  },
  rest: {
    label: 'Rest Day',
    shortLabel: 'REST',
    icon: 'fa-couch',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-500'
  },
  lop: {
    label: 'Loss Of Pay',
    shortLabel: 'LOP',
    icon: 'fa-user-slash',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    dotColor: 'bg-slate-500'
  }
};
