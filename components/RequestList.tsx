import React from 'react';
import { RegistrationRequest, RequestStatus, UserRole } from '../types';
import { CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';

interface RequestListProps {
  requests: RegistrationRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, onApprove, onReject }) => {
  const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING).sort((a, b) => b.timestamp - a.timestamp);

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">All Caught Up!</h3>
        <p className="text-gray-500 mt-2">There are no pending registration requests to review.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-orange-500" />
          Pending Approvals
          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
            {pendingRequests.length}
          </span>
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Requested Role</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingRequests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{req.name}</div>
                  <div className="text-gray-500 text-xs">{req.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    req.role === UserRole.TEACHER ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {req.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {req.role === UserRole.STUDENT && req.rollNo ? (
                    <span>Class: {req.section} | Roll: {req.rollNo}</span>
                  ) : (
                    <span className="italic text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(req.timestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onReject(req.id)}
                    className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-md transition font-medium"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(req.id)}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition shadow-sm font-medium"
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};