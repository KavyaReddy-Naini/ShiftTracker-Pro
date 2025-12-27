
import { GoogleGenAI } from "@google/genai";
import { AttendanceStore, DayAttendance } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShiftInsights = async (attendanceData: AttendanceStore, currentMonth: string): Promise<string> => {
  try {
    // Correctly access the 'attendance' property of the AttendanceStore object.
    const dataSummary = (Object.entries(attendanceData.attendance) as [string, DayAttendance][])
      .filter(([date]) => date.includes(currentMonth))
      .map(([date, data]) => {
        const shifts = Object.entries(data)
          .filter(([k, v]) => v === true && ['morning', 'evening', 'night'].includes(k))
          .map(([k]) => k)
          .join(', ');
        const leave = data.leave ? `Leave: ${data.leave}` : '';
        return `${date}: ${shifts}${leave ? ` (${leave})` : ''}`;
      })
      .join('\n');

    const prompt = `
      You are a specialized Work-Life Balance and Occupational Health Assistant.
      I will provide you with a list of shifts worked and leaves taken in ${currentMonth}.
      
      Attendance & Leave Data:
      ${dataSummary || 'No data recorded yet for this month.'}
      
      Please provide:
      1. A brief encouraging summary of the work pattern.
      2. 2-3 specific health or wellness tips based on the shift types or leave patterns (e.g., if many sick leaves, suggest rest; if many night shifts, suggest sleep hygiene).
      3. A motivational quote for the user.
      
      Keep it professional, empathetic, and concise (under 200 words). Use bullet points for tips.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The Shift Assistant is currently resting. Please try again later!";
  }
};
