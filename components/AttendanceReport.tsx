
import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Student } from '../types';
import { Calendar, Filter, Download } from 'lucide-react';

interface AttendanceReportProps {
  students: Student[];
  attendance: AttendanceRecord[];
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({ students, attendance }) => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedSection, setSelectedSection] = useState<string>('All');

  const sections = useMemo(() => {
    const s = new Set(students.map(st => st.section));
    return ['All', ...Array.from(s).sort()];
  }, [students]);

  const reportData = useMemo(() => {
    // Filter records by date
    const recordsInRange = attendance.filter(
      r => r.date >= startDate && r.date <= endDate
    );

    // Group by student
    const studentStats = students.filter(s => selectedSection === 'All' || s.section === selectedSection).map(student => {
      const presentCount = recordsInRange.filter(r => r.studentId === student.id).length;
      // Calculate total days in range (naive calculation assuming everyday is a school day for this demo)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      return {
        ...student,
        presentCount,
        totalDays,
        percentage: Math.round((presentCount / totalDays) * 100)
      };
    });

    return studentStats;
  }, [attendance, students, startDate, endDate, selectedSection]);

  const downloadCSV = () => {
    const headers = ["Name", "Roll No", "Section", "Present Days", "Total Days", "Percentage"];
    const rows = reportData.map(s => [s.name, s.rollNo, s.section, s.presentCount, s.totalDays, `${s.percentage}%`]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${startDate}_to_${endDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            Attendance Report
          </h2>
          <button 
            onClick={downloadCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Section</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select 
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full pl-9 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
              >
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3 text-center">Attendance</th>
                <th className="px-4 py-3 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.length > 0 ? (
                reportData.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-gray-500">{student.rollNo}</td>
                    <td className="px-4 py-3 text-gray-500">{student.section}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">
                        {student.presentCount} / {student.totalDays}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span className={`${student.percentage >= 75 ? 'text-green-600' : student.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {student.percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                    No students found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
