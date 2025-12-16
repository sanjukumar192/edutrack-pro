
import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Users, QrCode, Shield, School, UserPlus, ClipboardList, User, FileBarChart, Gift, GraduationCap } from 'lucide-react';

interface NavProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentView: string;
  setView: (view: string) => void;
  pendingCount: number;
}

export const Nav: React.FC<NavProps> = ({ currentRole, setRole, currentView, setView, pendingCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
    { id: 'approvals', label: 'Approvals', icon: ClipboardList, roles: [UserRole.ADMIN], badge: pendingCount },
    { id: 'reports', label: 'Reports', icon: FileBarChart, roles: [UserRole.ADMIN] },
    { id: 'store', label: 'Gift Store', icon: Gift, roles: [UserRole.ADMIN, UserRole.STUDENT] },
    { id: 'students', label: 'Students', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap, roles: [UserRole.ADMIN] },
    { id: 'scanner', label: 'Scanner', icon: QrCode, roles: [UserRole.TEACHER, UserRole.ADMIN] },
    { id: 'profile', label: 'My Profile', icon: User, roles: [UserRole.STUDENT] },
    { id: 'registration', label: 'Join School', icon: UserPlus, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT], public: true },
  ];

  return (
    <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => setView('dashboard')}
          >
            <School className="h-8 w-8 text-indigo-300" />
            <span>EduTrack Pro</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {navItems.filter(item => item.public || item.roles.includes(currentRole)).map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item.id 
                    ? 'bg-indigo-800 text-white' 
                    : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-indigo-900">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-indigo-800 px-3 py-1 rounded-full border border-indigo-700">
              <Shield className="h-3 w-3 text-indigo-300" />
              <select 
                value={currentRole}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-transparent border-none focus:ring-0 text-xs font-semibold uppercase cursor-pointer text-indigo-100 outline-none"
              >
                {[UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT].map(r => (
  <option key={r} value={r} className="text-gray-900">
    {r}
  </option>
))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="md:hidden flex justify-around bg-indigo-800 py-2 border-t border-indigo-700">
         {navItems.filter(item => item.public || item.roles.includes(currentRole)).slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`relative p-2 rounded-md ${currentView === item.id ? 'text-white bg-indigo-700' : 'text-indigo-300'}`}
            >
              <item.icon className="h-6 w-6" />
              {item.badge && item.badge > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full"></span>
              )}
            </button>
          ))}
      </div>
    </nav>
  );
};

