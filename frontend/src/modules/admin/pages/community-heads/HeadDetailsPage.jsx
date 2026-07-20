import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Shield, Settings, Activity, Building2, User } from 'lucide-react';
import { communityHeadService } from '../../services/communityHeadService';
import { Avatar } from '../../../member/components/common/Avatar';
import { CommunityHeadForm } from './components/CommunityHeadForm';

const HeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [head, setHead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  useEffect(() => {
    const fetchHead = async () => {
      try {
        const data = await communityHeadService.getHeadById(id);
        setHead(data);
      } catch (error) {
        console.error("Error fetching head details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHead();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      await communityHeadService.updateHead(id, data);
      const updatedHead = await communityHeadService.getHeadById(id);
      setHead(updatedHead);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!head) return <div className="p-8 text-center text-gray-500">Head not found.</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold">
          <ArrowLeft size={20} /> Back to Roster
        </button>
        <button 
          onClick={() => setIsEditFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl font-bold shadow-sm hover:bg-brand-primary/90 transition-all"
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-100 rounded-2xl min-w-[250px]">
          <Avatar imageUrl={head.avatar} initials={head.name.charAt(0)} size="xl" color="bg-brand-primary" />
          <h2 className="text-2xl font-black text-gray-900 mt-4 text-center">{head.name}</h2>
          <p className="text-gray-500 font-medium text-sm">{head.email}</p>
          
          <div className="mt-4 w-full bg-white rounded-xl border border-gray-100 p-3 space-y-2 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-400 uppercase">Login ID:</span>
              <span className="font-bold text-brand-primary">{head.loginId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-400 uppercase">Password:</span>
              <span className={`font-mono px-2 py-0.5 rounded ${head.plainPassword ? 'bg-gray-50 text-gray-700' : 'bg-red-50 text-red-500 italic'}`}>
                {head.plainPassword || '(Not Set - Edit Profile to update)'}
              </span>
            </div>
          </div>

          <div className="mt-5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs tracking-wider uppercase border border-emerald-100">
            {head.status}
          </div>
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</h4>
              <p className="font-semibold text-gray-900">{head.phone || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Role</h4>
              <p className="font-semibold text-gray-900 capitalize">{head.role}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Created At</h4>
              <p className="font-semibold text-gray-900">{new Date(head.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Communities</h4>
              <p className="font-semibold text-brand-primary">{head.assignedCommunityIds?.length || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <Building2 size={20} className="text-brand-primary" /> Communities
            </h3>
            <div className="flex flex-wrap gap-3">
              {head.assignedCommunityIds?.map(c => (
                <span key={c._id || c} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-xl border border-indigo-100 text-sm">
                  {c.name || 'Unknown Community'}
                </span>
              ))}
              {(!head.assignedCommunityIds || head.assignedCommunityIds.length === 0) && (
                <p className="text-gray-500 italic text-sm">No communities assigned.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <Shield size={20} className="text-brand-primary" /> Permissions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {head.headPermissions && Object.keys(head.headPermissions).map(key => {
                if (key.startsWith('_')) return null; // skip internal mongoose keys if any
                const label = key.replace('can', '').replace(/([A-Z])/g, ' $1').trim();
                const isEnabled = head.headPermissions[key];
                return (
                  <div key={key} className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${isEnabled ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <CommunityHeadForm 
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        initialData={head}
        onSubmit={async (data) => {
          const result = await handleUpdate(data);
          if (result.success) {
            setIsEditFormOpen(false);
          }
          return result;
        }}
      />
    </div>
  );
};

export default HeadDetailsPage;
