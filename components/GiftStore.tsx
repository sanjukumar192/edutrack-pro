
import React, { useState } from 'react';
import { Gift, Student, RedemptionRequest, RequestStatus, UserRole } from '../types';
import { Gift as GiftIcon, Coins, CheckCircle, PlusCircle, ShoppingBag, Upload, X } from 'lucide-react';

interface GiftStoreProps {
  role: UserRole;
  gifts: Gift[];
  currentUser?: Student; // If role is student
  requests: RedemptionRequest[];
  students: Student[]; // For admin to lookup names
  onRequestRedemption: (giftId: string) => void;
  onApproveRedemption: (requestId: string) => void;
  onRejectRedemption: (requestId: string) => void;
  onAddGift?: (gift: Omit<Gift, 'id'>) => void;
}

export const GiftStore: React.FC<GiftStoreProps> = ({
  role,
  gifts,
  currentUser,
  requests,
  students,
  onRequestRedemption,
  onApproveRedemption,
  onRejectRedemption,
  onAddGift
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Gift Form State
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftCost, setNewGiftCost] = useState(100);
  const [newGiftDesc, setNewGiftDesc] = useState('');
  const [newGiftImage, setNewGiftImage] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGiftImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddGift) {
      onAddGift({
        name: newGiftName,
        cost: newGiftCost,
        description: newGiftDesc,
        icon: '🎁', // Default fallback
        image: newGiftImage
      });
      setShowAddModal(false);
      // Reset
      setNewGiftName('');
      setNewGiftCost(100);
      setNewGiftDesc('');
      setNewGiftImage('');
    }
  };

  // --- Student View ---
  if (role === UserRole.STUDENT) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="h-8 w-8" />
              Reward Store
            </h1>
            <p className="text-pink-100 mt-2">Redeem your hard-earned coins for awesome rewards!</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
             <p className="text-sm font-medium text-pink-100">Your Balance</p>
             <p className="text-3xl font-bold flex items-center gap-2">
               <Coins className="h-6 w-6 text-yellow-300" />
               {currentUser?.coins || 0}
             </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mt-8">Available Gifts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map(gift => {
            const canAfford = (currentUser?.coins || 0) >= gift.cost;
            return (
              <div key={gift.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
                <div className="h-40 mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                    {gift.image ? (
                        <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-6xl">{gift.icon}</span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{gift.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{gift.description}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-yellow-600 flex items-center gap-1">
                    <Coins className="h-4 w-4" /> {gift.cost}
                  </span>
                  <button
                    onClick={() => onRequestRedemption(gift.id)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                      canAfford 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Redeem' : 'Need more coins'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {requests.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your Redemption History</h2>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 py-3">Item</th>
                     <th className="px-4 py-3">Cost</th>
                     <th className="px-4 py-3">Status</th>
                     <th className="px-4 py-3">Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {requests.sort((a,b) => b.timestamp - a.timestamp).map(req => {
                     const gift = gifts.find(g => g.id === req.giftId);
                     return (
                       <tr key={req.id}>
                         <td className="px-4 py-3 font-medium">{gift?.name || 'Unknown Item'}</td>
                         <td className="px-4 py-3 text-yellow-600 font-medium">{req.cost}</td>
                         <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' :
                              req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {req.status}
                            </span>
                         </td>
                         <td className="px-4 py-3 text-gray-500">{new Date(req.timestamp).toLocaleDateString()}</td>
                       </tr>
                     );
                   })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Admin View ---
  const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Add Gift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-900">Add New Gift</h3>
               <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                 <X className="h-6 w-6" />
               </button>
             </div>
             <form onSubmit={handleSubmitGift} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Gift Name</label>
                 <input 
                   required
                   className="w-full border border-gray-300 rounded-lg p-2" 
                   value={newGiftName}
                   onChange={e => setNewGiftName(e.target.value)}
                   placeholder="e.g., Fancy Pen"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Cost (Coins)</label>
                 <input 
                   required
                   type="number"
                   className="w-full border border-gray-300 rounded-lg p-2" 
                   value={newGiftCost}
                   onChange={e => setNewGiftCost(Number(e.target.value))}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                 <textarea 
                   required
                   className="w-full border border-gray-300 rounded-lg p-2" 
                   value={newGiftDesc}
                   onChange={e => setNewGiftDesc(e.target.value)}
                   rows={3}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Upload)</label>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition">
                    <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        id="gift-image-upload"
                        onChange={handleImageUpload}
                    />
                    <label htmlFor="gift-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {newGiftImage ? (
                            <img src={newGiftImage} alt="Preview" className="h-20 object-contain" />
                        ) : (
                            <>
                                <Upload className="h-6 w-6 text-gray-400" />
                                <span className="text-sm text-gray-500">Click to upload image</span>
                            </>
                        )}
                    </label>
                 </div>
               </div>
               <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 mt-2"
               >
                 Add Gift to Store
               </button>
             </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <GiftIcon className="h-6 w-6 text-indigo-600" />
             Gift Distribution Center
           </h2>
           <div className="flex space-x-2 mt-4 sm:mt-0">
             <button
               onClick={() => setActiveTab('catalog')}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                 activeTab === 'catalog' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               Catalog
             </button>
             <button
               onClick={() => setActiveTab('requests')}
               className={`relative px-4 py-2 rounded-lg text-sm font-medium transition ${
                 activeTab === 'requests' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               Requests
               {pendingRequests.length > 0 && (
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                   {pendingRequests.length}
                 </span>
               )}
             </button>
           </div>
        </div>

        {activeTab === 'catalog' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-gray-500 text-sm">Manage store inventory visible to students.</p>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                    <PlusCircle className="h-4 w-4" /> Add Gift
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {gifts.map(gift => (
                 <div key={gift.id} className="border rounded-lg p-4 hover:border-indigo-200 transition">
                   <div className="h-32 mb-3 bg-gray-50 rounded flex items-center justify-center overflow-hidden relative">
                      {gift.image ? (
                        <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{gift.icon}</span>
                      )}
                      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-yellow-700 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200">
                        {gift.cost} Coins
                      </span>
                   </div>
                   <h4 className="font-bold text-gray-900 line-clamp-1">{gift.name}</h4>
                   <p className="text-xs text-gray-500 mt-1 line-clamp-2">{gift.description}</p>
                 </div>
               ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p>No pending redemption requests.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Requested Item</th>
                    <th className="px-6 py-4">Cost</th>
                    <th className="px-6 py-4">Current Balance</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingRequests.map(req => {
                    const student = students.find(s => s.id === req.studentId);
                    const gift = gifts.find(g => g.id === req.giftId);
                    if (!student || !gift) return null;

                    const canAfford = student.coins >= gift.cost;

                    return (
                      <tr key={req.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">Roll: {student.rollNo} | Class: {student.section}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             {gift.image ? (
                                 <img src={gift.image} className="w-6 h-6 rounded object-cover" />
                             ) : (
                                 <span>{gift.icon}</span>
                             )}
                             <span>{gift.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-yellow-600">{gift.cost}</td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
                             {student.coins}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => onRejectRedemption(req.id)}
                            className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition text-sm font-medium"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => onApproveRedemption(req.id)}
                            disabled={!canAfford}
                            className={`px-4 py-1.5 rounded text-white text-sm font-medium transition shadow-sm ${
                              canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
                            }`}
                          >
                            Approve & Deduct
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
