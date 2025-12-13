
import React, { useState, useEffect, useMemo } from 'react';
import { Nav } from './components/Nav';
import { StatsChart } from './components/StatsChart';
import { IDCardGenerator } from './components/IDCardGenerator';
import { Scanner } from './components/Scanner';
import { RegistrationForm } from './components/RegistrationForm';
import { RequestList } from './components/RequestList';
import { StudentProfile } from './components/StudentProfile';
import { AttendanceReport } from './components/AttendanceReport';
import { GiftStore } from './components/GiftStore';
import { TeacherDirectory } from './components/TeacherDirectory';
import { generateSchoolReport } from './services/geminiService';
import { Student, Teacher, AttendanceRecord, CoinTransaction, UserRole, RegistrationRequest, RequestStatus, Gift, RedemptionRequest } from './types';
import { Users, Award, Download, FileSpreadsheet, Bot, Loader2, CheckCircle, Search, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from "./firebase";

// Initial Mock Gifts
const DEFAULT_GIFTS: Gift[] = [
  { id: '1', name: 'Premium Notebook', cost: 100, icon: '📓', description: 'High quality A5 notebook for your daily notes.' },
  { id: '2', name: 'Gel Pen Set', cost: 200, icon: '🖊️', description: 'Set of 5 colorful smooth-writing gel pens.' },
  { id: '3', name: 'Water Bottle', cost: 300, icon: '💧', description: 'Durable and eco-friendly sports water bottle.' },
  { id: '4', name: 'School Cap', cost: 400, icon: '🧢', description: 'Embroidered cap with school logo.' },
  { id: '5', name: 'Sports Gear', cost: 500, icon: '⚽', description: 'Football or Basketball (subject to availability).' },
];

function App() {
  // --- State Management ---
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [view, setView] = useState<string>('dashboard');
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('teachers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [transactions, setTransactions] = useState<CoinTransaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [requests, setRequests] = useState<RegistrationRequest[]>(() => {
    const saved = localStorage.getItem('requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [gifts, setGifts] = useState<Gift[]>(() => {
    const saved = localStorage.getItem('gifts');
    return saved ? JSON.parse(saved) : DEFAULT_GIFTS;
  });

  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>(() => {
    const saved = localStorage.getItem('redemptionRequests');
    return saved ? JSON.parse(saved) : [];
  });

  const [report, setReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // New states for Student Directory
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [showIdCards, setShowIdCards] = useState(false);

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('requests', JSON.stringify(requests)); }, [requests]);
  useEffect(() => { localStorage.setItem('gifts', JSON.stringify(gifts)); }, [gifts]);
  useEffect(() => { localStorage.setItem('redemptionRequests', JSON.stringify(redemptionRequests)); }, [redemptionRequests]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Actions ---

  const showNotification = (msg: string, type: 'success'|'error' = 'success') => {
    setNotification({ msg, type });
  };

  const handleRegister = (data: Omit<RegistrationRequest, 'id' | 'status' | 'timestamp'>) => {
    const newRequest: RegistrationRequest = {
      id: crypto.randomUUID(),
      status: RequestStatus.PENDING,
      timestamp: Date.now(),
      ...data
    };
    setRequests(prev => [...prev, newRequest]);
    showNotification("Registration submitted! Waiting for Admin approval.");
    setView('dashboard'); // Redirect to home/dashboard
  };

  const handleApproveRequest = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    if (request.role === UserRole.STUDENT) {
      // Check for duplicates based on Roll No
      if (students.some(s => s.rollNo === request.rollNo)) {
        showNotification("Error: Roll Number already exists!", 'error');
        return;
      }

      const newStudent: Student = {
        id: crypto.randomUUID(), // Generate a new clean ID for the system
        name: request.name,
        email: request.email,
        rollNo: request.rollNo || '000',
        section: request.section || 'A',
        coins: 0
      };
      setStudents(prev => [...prev, newStudent]);
    } else if (request.role === UserRole.TEACHER) {
      const newTeacher: Teacher = {
        id: crypto.randomUUID(),
        name: request.name,
        email: request.email,
        joinDate: Date.now()
      };
      setTeachers(prev => [...prev, newTeacher]);
    }
    
    // Update request status
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: RequestStatus.APPROVED } : r));
    showNotification(`${request.name} has been approved.`);
  };

  const handleRejectRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: RequestStatus.REJECTED } : r));
    showNotification("Request rejected.");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1);
      const newStudents: Student[] = [];
      
      lines.forEach(line => {
        const [name, rollNo, section] = line.split(',').map(s => s.trim());
        if (name && rollNo) {
           // Basic duplicate check
           if (!students.some(s => s.rollNo === rollNo)) {
              newStudents.push({
                id: crypto.randomUUID(),
                name,
                rollNo,
                section: section || 'A',
                coins: 0
              });
           }
        }
      });
      
      setStudents(prev => [...prev, ...newStudents]);
      showNotification(`Successfully imported ${newStudents.length} students.`);
    };
    reader.readAsText(file);
  };

  const markAttendance = (userId: string, userRole: UserRole) => {
    const today = new Date().toISOString().split('T')[0];
    const exists = attendance.find(a => a.studentId === userId && a.date === today);
    
    if (!exists) {
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        studentId: userId,
        userRole: userRole,
        date: today,
        timestamp: Date.now(),
        markedBy: role
      };
      setAttendance(prev => [...prev, newRecord]);
    }
  };

  const awardCoins = (studentId: string, amount: number) => {
    const newTx: CoinTransaction = {
      id: crypto.randomUUID(),
      studentId,
      amount,
      timestamp: Date.now(),
      awardedBy: role,
      reason: 'Teacher Award'
    };
    
    setTransactions(prev => [...prev, newTx]);
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, coins: s.coins + amount } : s
    ));
  };

  // --- Store & Redemption Handlers ---

  const handleRequestRedemption = (giftId: string) => {
    // For demo, if role is student we use the first student in the list or match by email if we had auth
    const currentStudent = students[0];
    if (!currentStudent) return;

    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return;

    if (currentStudent.coins < gift.cost) {
      showNotification("Insufficient coins!", 'error');
      return;
    }

    const newRequest: RedemptionRequest = {
      id: crypto.randomUUID(),
      studentId: currentStudent.id,
      giftId: gift.id,
      cost: gift.cost,
      timestamp: Date.now(),
      status: RequestStatus.PENDING
    };

    setRedemptionRequests(prev => [...prev, newRequest]);
    showNotification("Redemption request sent!");
  };

  const handleApproveRedemption = (requestId: string) => {
    const request = redemptionRequests.find(r => r.id === requestId);
    if (!request) return;

    const student = students.find(s => s.id === request.studentId);
    if (!student) return;

    if (student.coins < request.cost) {
      showNotification(`Cannot approve. ${student.name} has insufficient coins.`, 'error');
      return;
    }

    // 1. Deduct coins
    setStudents(prev => prev.map(s => 
      s.id === student.id ? { ...s, coins: s.coins - request.cost } : s
    ));

    // 2. Record negative transaction (expense)
    const newTx: CoinTransaction = {
      id: crypto.randomUUID(),
      studentId: student.id,
      amount: -request.cost,
      timestamp: Date.now(),
      awardedBy: role,
      reason: 'GIFT_REDEMPTION'
    };
    setTransactions(prev => [...prev, newTx]);

    // 3. Update request status
    setRedemptionRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: RequestStatus.APPROVED } : r
    ));

    showNotification("Request approved & coins deducted.");
  };

  const handleRejectRedemption = (requestId: string) => {
    setRedemptionRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: RequestStatus.REJECTED } : r
    ));
    showNotification("Redemption request rejected.");
  };

  const handleAddGift = (newGiftData: Omit<Gift, 'id'>) => {
     const newGift: Gift = {
         id: crypto.randomUUID(),
         ...newGiftData
     };
     setGifts(prev => [...prev, newGift]);
     showNotification("Gift added to store successfully.");
  };


  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const result = await generateSchoolReport(students, attendance, transactions);
    setReport(result);
    setIsGeneratingReport(false);
  };

  // --- Derived Data ---
  const statsData = useMemo(() => {
    const sections = Array.from(new Set(students.map(s => s.section))).sort();
    return sections.map(section => {
      const sectionStudents = students.filter(s => s.section === section);
      const sectionStudentIds = sectionStudents.map(s => s.id);
      
      const sectionAttendance = attendance.filter(a => sectionStudentIds.includes(a.studentId)).length;
      const sectionCoins = sectionStudents.reduce((sum, s) => sum + s.coins, 0);
      
      return {
        name: `Section ${section}`,
        attendance: sectionAttendance,
        coins: sectionCoins
      };
    });
  }, [students, attendance]);

  const pendingRequestsCount = requests.filter(r => r.status === RequestStatus.PENDING).length;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNo.includes(studentSearch)
  );

  // --- Render Views ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Coins Distributed</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.reduce((acc, s) => acc + s.coins, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <StatsChart data={statsData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold flex items-center gap-2">
               <Bot className="h-5 w-5 text-indigo-500" />
               AI Insights
             </h3>
             <button 
               onClick={handleGenerateReport}
               disabled={isGeneratingReport}
               className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
             >
               {isGeneratingReport ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Generate'}
             </button>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-4 text-sm text-gray-700 overflow-y-auto max-h-64 prose prose-sm">
            {report ? (
              <div dangerouslySetInnerHTML={{ 
                __html: report.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            ) : (
              <p className="text-gray-400 italic text-center mt-10">
                Click Generate to get AI-powered analysis of your school's performance data.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => {
    if (selectedStudent) {
      return (
        <StudentProfile 
          student={selectedStudent}
          attendance={attendance}
          transactions={transactions}
          onBack={() => setSelectedStudent(null)}
        />
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Management Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
             <div>
               <h2 className="text-xl font-bold text-gray-900">Student Directory</h2>
               <p className="text-sm text-gray-500">Manage students, view reports, and generate IDs.</p>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
               {/* Import */}
               <div className="flex-1">
                 <label className="block text-xs font-medium text-gray-700 mb-1">
                   Bulk Import CSV
                 </label>
                 <div className="flex gap-2 items-center">
                   <input 
                     type="file" 
                     accept=".csv"
                     onChange={handleFileUpload}
                     className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                   />
                   <button 
                     onClick={() => {
                        const csvContent = "Name,RollNo,Section\nJohn Doe,101,A\nJane Smith,102,B";
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = "template.csv";
                        a.click();
                     }}
                     className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                     title="Download Template"
                   >
                     <Download className="h-4 w-4" />
                   </button>
                 </div>
               </div>
             </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search by Name or Roll Number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        
        {/* Student Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Section</th>
                    <th className="px-6 py-4">Total Coins</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.slice(0, 50).map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-gray-500">{student.rollNo}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {student.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-yellow-600">{student.coins}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-3 w-3 mr-1.5" /> View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No students found. Try importing a CSV or registering a student.
                      </td>
                    </tr>
                  )}
                </tbody>
             </table>
             {filteredStudents.length > 50 && (
               <div className="px-6 py-4 text-center text-xs text-gray-400 border-t border-gray-100">
                 Showing top 50 results. Refine search to see more.
               </div>
             )}
           </div>
        </div>

        {/* ID Card Generation Toggle */}
        <div className="border border-indigo-100 rounded-xl overflow-hidden bg-white">
           <button 
             onClick={() => setShowIdCards(!showIdCards)}
             className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 transition text-indigo-800 font-semibold text-sm"
           >
             <span className="flex items-center gap-2">
               <Users className="h-4 w-4" /> 
               Printable Student ID Cards
             </span>
             {showIdCards ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
           </button>
           {showIdCards && (
             <div className="p-6 border-t border-indigo-100">
                <IDCardGenerator students={students} />
             </div>
           )}
        </div>
      </div>
    );
  };

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-5 z-[100] px-6 py-3 rounded-lg shadow-xl text-white font-medium flex items-center gap-2 animate-fade-in ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : null}
          {notification.msg}
        </div>
      )}

      <script src="https://unpkg.com/html5-qrcode" type="text/javascript"></script>
      
      <Nav 
        currentRole={role} 
        setRole={(r) => { 
            setRole(r); 
            // Redirect logic when switching roles for demo purposes
            if (r === UserRole.STUDENT) setView('profile');
            else if (r === UserRole.ADMIN) setView('dashboard');
            else if (r === UserRole.TEACHER) setView('scanner');
            // Reset specific views
            setSelectedStudent(null);
        }}
        currentView={view}
        setView={(v) => { setView(v); setSelectedStudent(null); }}
        pendingCount={pendingRequestsCount}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'dashboard' && role === UserRole.ADMIN && renderDashboard()}
        
        {view === 'students' && role === UserRole.ADMIN && renderStudents()}
        
        {view === 'teachers' && role === UserRole.ADMIN && (
            <TeacherDirectory teachers={teachers} />
        )}

        {view === 'reports' && role === UserRole.ADMIN && (
          <AttendanceReport students={students} attendance={attendance} />
        )}

        {view === 'store' && (
          <GiftStore 
            role={role}
            gifts={gifts}
            students={students}
            currentUser={students[0]} // Demo: assuming 1st is logged in
            requests={role === UserRole.STUDENT 
              ? redemptionRequests.filter(r => r.studentId === students[0]?.id) 
              : redemptionRequests
            }
            onRequestRedemption={handleRequestRedemption}
            onApproveRedemption={handleApproveRedemption}
            onRejectRedemption={handleRejectRedemption}
            onAddGift={role === UserRole.ADMIN ? handleAddGift : undefined}
          />
        )}
        
        {view === 'approvals' && role === UserRole.ADMIN && (
            <RequestList 
                requests={requests} 
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
            />
        )}

        {view === 'scanner' && (role === UserRole.TEACHER || role === UserRole.ADMIN) && (
          <Scanner 
            students={students}
            teachers={teachers}
            onMarkAttendance={markAttendance}
            onAwardCoins={awardCoins}
          />
        )}

        {view === 'registration' && (
            <RegistrationForm onSubmit={handleRegister} />
        )}

        {view === 'profile' && role === UserRole.STUDENT && (
            students.length > 0 ? (
                <StudentProfile 
                    student={students[0]} // Demo: Show first student. In real app, would match auth ID
                    attendance={attendance}
                    transactions={transactions}
                />
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800">No Student Data Found</h2>
                    <p className="text-gray-500 mt-2">Please ask an Admin to import student data or approve your registration.</p>
                    <button 
                        onClick={() => setView('registration')}
                        className="mt-4 text-indigo-600 font-medium hover:underline"
                    >
                        Go to Registration
                    </button>
                </div>
            )
        )}
      </main>
    </div>
  );
}

export default App;
