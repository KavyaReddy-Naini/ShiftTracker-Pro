
import React, { useState, useEffect } from 'react';
import { getShiftInsights } from '../services/geminiService';
import { AttendanceStore } from '../types';

interface InsightsPanelProps {
  attendanceData: AttendanceStore;
  currentMonthKey: string;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ attendanceData, currentMonthKey }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await getShiftInsights(attendanceData, currentMonthKey);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    setInsight(null); // Reset when month changes
  }, [currentMonthKey]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <i className="fa-solid fa-sparkles"></i>
          AI Wellness Assistant
        </h3>
        {!insight && !loading && (
          <button 
            onClick={fetchInsights}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
          >
            Analyze Habits
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-sm opacity-80 animate-pulse">Thinking...</p>
        </div>
      ) : insight ? (
        <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
          {insight}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button 
              onClick={fetchInsights}
              className="text-xs opacity-60 hover:opacity-100 underline decoration-dotted"
            >
              Refresh Insights
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-indigo-100/80">
          Recording your shifts helps me provide personalized health tips and pattern analysis.
        </p>
      )}
    </div>
  );
};

export default InsightsPanel;
