import { GoogleGenAI } from "@google/genai";
import { Student, AttendanceRecord, CoinTransaction } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Gemini features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSchoolReport = async (
  students: Student[],
  attendance: AttendanceRecord[],
  transactions: CoinTransaction[]
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "API Key missing. Unable to generate report.";

  // Aggregate data for the prompt
  const totalStudents = students.length;
  const totalCoins = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalAttendance = attendance.length;
  
  // Calculate top sections
  const sectionStats: Record<string, { coins: number; attendance: number }> = {};
  students.forEach(s => {
    if (!sectionStats[s.section]) sectionStats[s.section] = { coins: 0, attendance: 0 };
    sectionStats[s.section].coins += s.coins;
  });
  
  attendance.forEach(a => {
    const student = students.find(s => s.id === a.studentId);
    if (student) {
       if (!sectionStats[student.section]) sectionStats[student.section] = { coins: 0, attendance: 0 };
       sectionStats[student.section].attendance += 1;
    }
  });

  const statsSummary = JSON.stringify({
    totalStudents,
    totalCoins,
    totalAttendance,
    sectionStats
  }, null, 2);

  const prompt = `
    You are a school administrator assistant. Analyze the following raw data from our school management system:
    ${statsSummary}
    
    Please provide a professional executive summary formatted in Markdown. Include:
    1. A brief overview of school engagement (attendance and rewards).
    2. Identification of the top-performing section based on coins and attendance.
    3. Three specific, actionable recommendations for the principal to improve student engagement.
    
    Keep the tone formal and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No report generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate report due to an error.";
  }
};
