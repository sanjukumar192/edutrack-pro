import React, { useState } from 'react';
import { UserRole, RegistrationRequest } from '../types';
import { UserPlus, School, Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  onSubmit: (data: Omit<RegistrationRequest, 'id' | 'status' | 'timestamp'>) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [section, setSection] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      onSubmit({
        name,
        email,
        role,
        rollNo: role === UserRole.STUDENT ? rollNo : undefined,
        section: role === UserRole.STUDENT ? section : undefined,
      });
      setIsSubmitting(false);
      // Reset form
      setName('');
      setEmail('');
      setRollNo('');
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-50">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Join EduTrack</h2>
          <p className="text-gray-500 text-sm mt-2">Create an account to get started. Your request will be sent to the Admin for approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.STUDENT)}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  role === UserRole.STUDENT
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.TEACHER)}
                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  role === UserRole.TEACHER
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Teacher
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="name@school.edu"
              />
            </div>

            {role === UserRole.STUDENT && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    required
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="e.g. 101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  >
                    {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};