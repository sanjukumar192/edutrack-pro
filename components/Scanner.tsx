
import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Student, Teacher, COIN_VALUES, UserRole } from '../types';
import { CheckCircle, XCircle, Coins, User, CalendarCheck, GraduationCap } from 'lucide-react';

interface ScannerProps {
  students: Student[];
  teachers?: Teacher[];
  onMarkAttendance: (id: string, role: UserRole) => void;
  onAwardCoins: (studentId: string, amount: number) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ students, teachers = [], onMarkAttendance, onAwardCoins }) => {
  const [scannedUser, setScannedUser] = useState<{ data: Student | Teacher, type: UserRole } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner logic
    const timer = setTimeout(() => {
      const element = document.getElementById('reader');
      if (element && !scannerRef.current) {
        try {
            const scanner = new Html5QrcodeScanner(
                "reader", 
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            
            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        } catch(e) {
            console.error("Scanner init error", e);
        }
      }
    }, 500);

    return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
            scannerRef.current = null;
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      
      // Check if student
      const student = students.find(s => s.id === data.id || s.rollNo === data.roll);
      if (student) {
        setScannedUser({ data: student, type: UserRole.STUDENT });
        setScanError(null);
        return;
      }

      // Check if teacher
      const teacher = teachers.find(t => t.id === data.id);
      if (teacher) {
        setScannedUser({ data: teacher, type: UserRole.TEACHER });
        setScanError(null);
        return;
      }

      setScanError("User not found in database.");
      setScannedUser(null);
      
    } catch (e) {
      setScanError("Invalid QR Code format.");
    }
  };

  const onScanFailure = (error: any) => {
    // Ignore frame errors
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Students
    const student = students.find(s => s.rollNo === manualId || s.name.toLowerCase().includes(manualId.toLowerCase()));
    if (student) {
      setScannedUser({ data: student, type: UserRole.STUDENT });
      setScanError(null);
      return;
    }

    // Check Teachers
    const teacher = teachers.find(t => t.name.toLowerCase().includes(manualId.toLowerCase()));
    if (teacher) {
        setScannedUser({ data: teacher, type: UserRole.TEACHER });
        setScanError(null);
        return;
    }

    setScanError("User not found.");
    setScannedUser(null);
  };

  const handleAction = (action: 'attendance' | 'coins', value?: number) => {
    if (!scannedUser) return;
    
    if (action === 'attendance') {
      onMarkAttendance(scannedUser.data.id, scannedUser.type);
      alert(`Attendance marked for ${scannedUser.data.name} (${scannedUser.type})`);
    } else if (action === 'coins' && value && scannedUser.type === UserRole.STUDENT) {
      onAwardCoins(scannedUser.data.id, value);
      alert(`${value} Coins awarded to ${scannedUser.data.name}`);
    }
    // Reset after action
    setScannedUser(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-indigo-900">
          <User className="h-6 w-6" />
          Universal Scanner
        </h2>

        {/* Main Scanner Area */}
        {!scannedUser ? (
          <div className="space-y-4">
             <div id="reader" className="w-full bg-gray-100 rounded-lg overflow-hidden min-h-[300px]"></div>
             <p className="text-sm text-gray-500 text-center">Scan Student or Teacher QR Code</p>
             
             <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or search manually</span>
                </div>
             </div>

             <form onSubmit={handleManualSearch} className="flex gap-2">
               <input 
                 type="text" 
                 value={manualId}
                 onChange={(e) => setManualId(e.target.value)}
                 placeholder="Enter Name or Roll No"
                 className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
               />
               <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                 Search
               </button>
             </form>
             {scanError && (
               <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                 <XCircle className="h-5 w-5" />
                 {scanError}
               </div>
             )}
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
             <div className="flex justify-between items-start">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-gray-900">{scannedUser.data.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${scannedUser.type === UserRole.TEACHER ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {scannedUser.type}
                    </span>
                 </div>
                 {scannedUser.type === UserRole.STUDENT ? (
                    <p className="text-gray-500">Roll: {(scannedUser.data as Student).rollNo} • Section: {(scannedUser.data as Student).section}</p>
                 ) : (
                    <p className="text-gray-500">ID: {scannedUser.data.id.slice(0, 8)}</p>
                 )}
               </div>
               <button 
                onClick={() => setScannedUser(null)}
                className="text-gray-400 hover:text-gray-600"
               >
                 <XCircle className="h-6 w-6" />
               </button>
             </div>

             <div className="grid grid-cols-1 gap-4">
               <button
                 onClick={() => handleAction('attendance')}
                 className="flex items-center justify-center gap-3 w-full p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-md"
               >
                 <CalendarCheck className="h-6 w-6" />
                 <span className="text-lg font-semibold">Mark Present Today</span>
               </button>

               {scannedUser.type === UserRole.STUDENT && (
                   <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                      <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        Award Coins
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {COIN_VALUES.map(value => (
                          <button
                            key={value}
                            onClick={() => handleAction('coins', value)}
                            className="py-2 px-4 bg-white text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 font-medium shadow-sm transition"
                          >
                            +{value}
                          </button>
                        ))}
                      </div>
                   </div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
