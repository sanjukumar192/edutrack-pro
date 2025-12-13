
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Teacher } from '../types';
import { Printer, Search, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

interface TeacherDirectoryProps {
  teachers: Teacher[];
}

export const TeacherDirectory: React.FC<TeacherDirectoryProps> = ({ teachers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showIdCards, setShowIdCards] = useState(false);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            Teacher Directory
        </h2>
        
        {/* Search Bar */}
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name or Email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
        </div>

        <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{teacher.name}</td>
                      <td className="px-6 py-4 text-gray-500">{teacher.email}</td>
                      <td className="px-6 py-4 text-gray-500">{teacher.subject || 'General'}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(teacher.joinDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No teachers found. Approve registration requests to add teachers.
                      </td>
                    </tr>
                  )}
                </tbody>
             </table>
        </div>
      </div>

       {/* ID Card Generation Toggle */}
       <div className="border border-indigo-100 rounded-xl overflow-hidden bg-white">
           <button 
             onClick={() => setShowIdCards(!showIdCards)}
             className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 transition text-indigo-800 font-semibold text-sm"
           >
             <span className="flex items-center gap-2">
               <Printer className="h-4 w-4" /> 
               Printable Teacher ID Cards
             </span>
             {showIdCards ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
           </button>
           
           {showIdCards && (
             <div className="p-6 border-t border-indigo-100">
                <div className="flex justify-end mb-4 no-print">
                    <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                    <Printer className="h-4 w-4 mr-2" />
                    Print All Cards
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
                    {teachers.map((teacher) => (
                    <div 
                        key={teacher.id} 
                        className="relative flex flex-col items-center bg-white border-2 border-purple-100 rounded-xl p-6 shadow-sm print:break-inside-avoid print:border-gray-300 print:shadow-none"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-purple-600 rounded-t-xl print:bg-black"></div>
                        
                        <div className="w-24 h-24 mb-4 bg-white p-1 rounded-lg shadow-inner border border-gray-100">
                        <div style={{ height: "auto", margin: "0 auto", maxWidth: 86, width: "100%" }}>
                            <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={JSON.stringify({ id: teacher.id, type: 'TEACHER' })}
                            viewBox={`0 0 256 256`}
                            />
                        </div>
                        </div>

                        <div className="text-center space-y-1">
                        <h3 className="text-lg font-bold text-gray-900">{teacher.name}</h3>
                        <p className="text-sm text-purple-600 font-semibold">FACULTY</p>
                        <div className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium mt-2 border border-purple-100">
                            {teacher.subject || 'General Staff'}
                        </div>
                        </div>
                        
                        <div className="mt-4 pt-4 w-full border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                        <span>EduTrack ID</span>
                        <span className="font-mono">{teacher.id.slice(0, 8)}</span>
                        </div>
                    </div>
                    ))}
                </div>
             </div>
           )}
        </div>
    </div>
  );
};
