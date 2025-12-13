import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Student, AttendanceRecord, CoinTransaction } from '../types';
import { Calendar, Award, TrendingUp, Clock, Download, Table, History, ArrowLeft, Coins } from 'lucide-react';

interface StudentProfileProps {
  student: Student;
  attendance: AttendanceRecord[];
  transactions: CoinTransaction[];
  onBack?: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ student, attendance, transactions, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'coins'>('overview');

  // Filter and Sort Data
  const myAttendance = attendance
    .filter(a => a.studentId === student.id)
    .sort((a, b) => b.timestamp - a.timestamp);
    
  const myTransactions = transactions
    .filter(t => t.studentId === student.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Stats
  const totalCoins = student.coins;
  
  // Attendance % Calculation
  const now = new Date();
  const workDaysSoFar = Math.max(1, now.getDate() - 8); // Simplified logic for demo
  const attendancePercentage = Math.min(100, Math.round((myAttendance.length / workDaysSoFar) * 100));

  // CSV Downloads
  const downloadAttendanceCSV = () => {
    const headers = ["Date", "Time", "Status", "Marked By"];
    const rows = myAttendance.map(r => [
      r.date,
      new Date(r.timestamp).toLocaleTimeString(),
      "Present",
      r.markedBy
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name}_attendance.csv`;
    a.click();
  };

  const downloadCoinsCSV = () => {
    const headers = ["Date", "Time", "Type", "Amount", "Reason/Source"];
    const rows = myTransactions.map(t => [
      new Date(t.timestamp).toLocaleDateString(),
      new Date(t.timestamp).toLocaleTimeString(),
      t.amount > 0 ? "Credit" : "Debit",
      t.amount.toString(),
      t.reason || "Awarded by Teacher"
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name}_coins.csv`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {onBack && (
        <button 
          onClick={onBack} 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
        </button>
      )}

      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
            <div style={{ height: "auto", margin: "0 auto", maxWidth: 100, width: "100%" }}>
                <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={JSON.stringify({ id: student.id, roll: student.rollNo })}
                viewBox={`0 0 256 256`}
                />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{student.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-indigo-100">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/10">
                Class {student.section}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/10">
                Roll No: {student.rollNo}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-white/10">
                ID: {student.id.slice(0, 6).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 shrink-0 min-w-[140px]">
             <p className="text-sm text-indigo-200 mb-1">Total Coins</p>
             <p className="text-4xl font-bold text-yellow-300">{totalCoins}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 shadow-sm">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Award className="h-4 w-4" /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('attendance')} 
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <History className="h-4 w-4" /> Attendance Report
        </button>
        <button 
          onClick={() => setActiveTab('coins')} 
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'coins' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Table className="h-4 w-4" /> Coin History
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 border-t-0 p-6 min-h-[400px]">
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Attendance Summary
                </h3>
                <span className="text-2xl font-bold text-indigo-700">{attendancePercentage}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">You have attended <span className="font-bold">{myAttendance.length}</span> days this month.</p>
              <div className="w-full bg-indigo-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${attendancePercentage}%` }}></div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {myTransactions.slice(0, 3).map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t.reason || 'Class Award'}</span>
                    <span className={`font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {t.amount > 0 ? '+' : ''}{t.amount}
                    </span>
                  </div>
                ))}
                {myTransactions.length === 0 && <p className="text-sm text-gray-400">No recent transactions.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-800">Attendance Log ({myAttendance.length})</h3>
               <button 
                 onClick={downloadAttendanceCSV}
                 className="text-sm flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition"
               >
                 <Download className="h-4 w-4" /> Download CSV
               </button>
             </div>
             <div className="overflow-hidden border rounded-lg border-gray-200">
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-gray-600 font-semibold">
                   <tr>
                     <th className="px-4 py-3">Date</th>
                     <th className="px-4 py-3">Time Recorded</th>
                     <th className="px-4 py-3">Status</th>
                     <th className="px-4 py-3">Recorded By</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {myAttendance.length > 0 ? myAttendance.map(r => (
                     <tr key={r.id} className="hover:bg-gray-50">
                       <td className="px-4 py-3 font-medium text-gray-900">{r.date}</td>
                       <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                         <Clock className="h-3 w-3" /> {new Date(r.timestamp).toLocaleTimeString()}
                       </td>
                       <td className="px-4 py-3">
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                           Present
                         </span>
                       </td>
                       <td className="px-4 py-3 text-gray-500 text-xs uppercase">{r.markedBy}</td>
                     </tr>
                   )) : (
                     <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No attendance records found.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'coins' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-800">Transaction History</h3>
               <button 
                 onClick={downloadCoinsCSV}
                 className="text-sm flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition"
               >
                 <Download className="h-4 w-4" /> Download CSV
               </button>
             </div>
             <div className="overflow-hidden border rounded-lg border-gray-200">
               <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-gray-600 font-semibold">
                   <tr>
                     <th className="px-4 py-3">Date</th>
                     <th className="px-4 py-3">Description</th>
                     <th className="px-4 py-3">Type</th>
                     <th className="px-4 py-3 text-right">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {myTransactions.length > 0 ? myTransactions.map(t => (
                     <tr key={t.id} className="hover:bg-gray-50">
                       <td className="px-4 py-3 text-gray-500">{new Date(t.timestamp).toLocaleDateString()}</td>
                       <td className="px-4 py-3 font-medium text-gray-900">
                         {t.reason || (t.amount > 0 ? 'Teacher Award' : 'Store Redemption')}
                       </td>
                       <td className="px-4 py-3">
                         {t.amount > 0 ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase"><Coins className="h-3 w-3" /> Credit</span>
                         ) : (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase"><Award className="h-3 w-3" /> Debit</span>
                         )}
                       </td>
                       <td className={`px-4 py-3 text-right font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {t.amount > 0 ? '+' : ''}{t.amount}
                       </td>
                     </tr>
                   )) : (
                     <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No transactions found.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};