import React from 'react';
import QRCode from 'react-qr-code';
import { Student } from '../types';
import { Download, Printer } from 'lucide-react';

interface IDCardGeneratorProps {
  students: Student[];
}

export const IDCardGenerator: React.FC<IDCardGeneratorProps> = ({ students }) => {
  const handlePrint = () => {
    window.print();
  };

  if (students.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
        No students found. Please upload student data first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-gray-800">Student ID Cards ({students.length})</h2>
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print All Cards
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {students.map((student) => (
          <div 
            key={student.id} 
            className="relative flex flex-col items-center bg-white border-2 border-indigo-100 rounded-xl p-6 shadow-sm print:break-inside-avoid print:border-gray-300 print:shadow-none"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500 rounded-t-xl print:bg-black"></div>
            
            <div className="w-24 h-24 mb-4 bg-white p-1 rounded-lg shadow-inner border border-gray-100">
               {/* QR Code containing student ID */}
               <div style={{ height: "auto", margin: "0 auto", maxWidth: 86, width: "100%" }}>
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={JSON.stringify({ id: student.id, roll: student.rollNo })}
                  viewBox={`0 0 256 256`}
                />
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
              <p className="text-sm text-indigo-600 font-semibold">{student.rollNo}</p>
              <div className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium mt-2 border border-indigo-100">
                Section {student.section}
              </div>
            </div>
            
            <div className="mt-4 pt-4 w-full border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>EduTrack ID</span>
              <span className="font-mono">{student.id.slice(0, 8)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
