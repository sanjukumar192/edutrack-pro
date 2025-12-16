import { LayoutDashboard, Users, QrCode, ClipboardList, Gift, GraduationCap } from "lucide-react";
import { UserRole } from "../types";

export function Nav({
  role,
  view,
  setView,
}: {
  role: UserRole;
  view: string;
  setView: (v: string) => void;
}) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT] },
    { id: "students", label: "Students", icon: Users, roles: [UserRole.ADMIN] },
    { id: "teachers", label: "Teachers", icon: GraduationCap, roles: [UserRole.ADMIN] },
    { id: "scanner", label: "Scanner", icon: QrCode, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { id: "approvals", label: "Approvals", icon: ClipboardList, roles: [UserRole.ADMIN] },
    { id: "store", label: "Gift Store", icon: Gift, roles: [UserRole.ADMIN, UserRole.STUDENT] },
  ];

  return (
    <nav className="bg-indigo-900 text-white px-4 py-3 flex gap-2">
      {items
        .filter((i) => i.roles.includes(role))
        .map((i) => (
          <button
            key={i.id}
            onClick={() => setView(i.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded ${
              view === i.id ? "bg-indigo-700" : "hover:bg-indigo-800"
            }`}
          >
            <i.icon className="h-4 w-4" />
            {i.label}
          </button>
        ))}
    </nav>
  );
}
