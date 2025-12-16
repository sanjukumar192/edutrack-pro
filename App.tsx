import React, { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import { Nav } from "./components/Nav";
import { Login } from "./components/Login";
import { StatsChart } from "./components/StatsChart";
import { StudentProfile } from "./components/StudentProfile";

import {
  Student,
  Teacher,
  AttendanceRecord,
  CoinTransaction,
  UserRole,
  RegistrationRequest,
  RequestStatus,
} from "./types";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [view, setView] = useState("dashboard");

  const [students, setStudents] = useState<Student[]>(() =>
    JSON.parse(localStorage.getItem("students") || "[]")
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    JSON.parse(localStorage.getItem("attendance") || "[]")
  );
  const [transactions, setTransactions] = useState<CoinTransaction[]>(() =>
    JSON.parse(localStorage.getItem("transactions") || "[]")
  );

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  const statsData = useMemo(() => {
    return students.map((s) => ({
      name: s.name,
      coins: s.coins,
      attendance: attendance.filter((a) => a.studentId === s.id).length,
    }));
  }, [students, attendance]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav
        role={role}
        view={view}
        setView={setView}
      />

      <main className="max-w-7xl mx-auto p-6">
        {view === "dashboard" && (
          <StatsChart data={statsData} />
        )}

        {view === "students" && (
          <>
            {!selectedStudent ? (
              <ul className="space-y-2">
                {students.map((s) => (
                  <li
                    key={s.id}
                    className="p-4 bg-white rounded cursor-pointer"
                    onClick={() => setSelectedStudent(s)}
                  >
                    {s.name} — {s.rollNo}
                  </li>
                ))}
              </ul>
            ) : (
              <StudentProfile
                student={selectedStudent}
                attendance={attendance}
                transactions={transactions}
                onBack={() => setSelectedStudent(null)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
