import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserRole } from "./types";

import { Login } from "./components/Login";
import { Nav } from "./components/Nav";

import { Dashboard } from "./pages/Dashboard";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";
import { ScannerPage } from "./pages/ScannerPage";
import { GiftStorePage } from "./pages/GiftStorePage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { RegistrationForm } from "./components/RegistrationForm";

function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", u.uid));
      if (!snap.exists()) {
        alert("User record missing in Firestore");
        return;
      }

      setUser(u);
      setRole(snap.data().role);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav role={role!} view={view} setView={setView} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === "dashboard" && <Dashboard role={role!} />}
        {view === "students" && role === UserRole.ADMIN && <StudentsPage />}
        {view === "teachers" && role === UserRole.ADMIN && <TeachersPage />}
        {view === "scanner" && (role === UserRole.ADMIN || role === UserRole.TEACHER) && <ScannerPage />}
        {view === "store" && <GiftStorePage role={role!} />}
        {view === "approvals" && role === UserRole.ADMIN && <ApprovalsPage />}
        {view === "registration" && <RegistrationForm />}
      </main>
    </div>
  );
}

export default App;
