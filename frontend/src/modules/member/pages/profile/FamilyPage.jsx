import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Camera, Trash2, Edit3 } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { useData } from '../../context/DataProvider';
import BranchingFamilyTree from '../../components/family/BranchingFamilyTree';
import { t } from '../../utils/translations';

const FamilyPage = () => {
  const navigate = useNavigate();
  const { currentUser, addFamilyMember, deleteFamilyMember, updateFamilyMember, language, setLanguage } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // tree | list

  const handleSave = (member) => {
    if (editingMember) {
      updateFamilyMember(editingMember.id, member);
      setEditingMember(null);
    } else {
      addFamilyMember(member);
      setShowAddForm(false);
    }
  };

  const isEditingOrAdding = showAddForm || !!editingMember;

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-6 animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-[16px] font-bold text-text-primary tracking-tight">{t('Family Tree', language)}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1 rounded bg-rose-50 text-rose-600 text-[12px] font-bold uppercase tracking-wider press-scale border border-rose-100"
          >
            {language === 'en' ? 'HI' : 'EN'}
          </button>
          {!isEditingOrAdding && (
            <button onClick={() => setShowAddForm(true)} className="p-1 text-brand-primary press-scale">
              <UserPlus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 pb-20">
        {isEditingOrAdding ? (
          <FamilyMemberForm 
            initialMember={editingMember} 
            onCancel={() => {
              setShowAddForm(false);
              setEditingMember(null);
            }} 
            onSave={handleSave} 
            language={language} 
          />
        ) : (
          <div className="flex flex-col h-full gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
              <button 
                onClick={() => setViewMode('tree')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all press-scale ${viewMode === 'tree' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary'}`}
              >
                {t('View Tree', language)}
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all press-scale ${viewMode === 'list' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary'}`}
              >
                {t('Manage Members', language)}
              </button>
            </div>

            {viewMode === 'tree' ? (
              <div className="w-full h-[60vh] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-20">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Interactive</span>
                </div>
                <BranchingFamilyTree 
                  primaryMember={currentUser} 
                  familyMembers={currentUser.familyMembers} 
                />
              </div>
            ) : (
              <div className="space-y-3">
                {currentUser.familyMembers.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
                    <p className="text-sm font-semibold text-text-secondary">No family members added yet.</p>
                    <button 
                      onClick={() => setShowAddForm(true)}
                      className="mt-3 px-4 py-2 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-xl press-scale"
                    >
                      + {t('Add Family Member', language)}
                    </button>
                  </div>
                ) : (
                  currentUser.familyMembers.map((fm) => (
                    <div key={fm.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar initials={fm.initials} src={fm.avatar} size="md" />
                        <div>
                          <p className="text-sm font-bold text-text-primary">{fm.name}</p>
                          <p className="text-xs text-text-secondary">{t(fm.relation, language)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingMember(fm)}
                          className="p-2 bg-gray-50 text-text-secondary border border-gray-200 rounded-lg press-scale"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(t('Are you sure you want to delete this family member?', language))) {
                              deleteFamilyMember(fm.id);
                            }
                          }}
                          className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-lg press-scale"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FamilyMemberForm = ({ initialMember, onCancel, onSave, language }) => {
  const [form, setForm] = useState({ 
    name: initialMember?.name || '', 
    relation: initialMember?.relation || 'Spouse', 
    dob: initialMember?.dob || '', 
    phone: initialMember?.phone || '',
    avatar: initialMember?.avatar || null
  });

  return (
    <div className="animate-fade-in-up bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
      <h2 className="text-[18px] font-bold text-text-primary mb-5">
        {initialMember ? t('Edit', language) + ' ' + t('Family Member', language) : t('Add Family Member', language)}
      </h2>
      <div className="space-y-4">
        {/* Photo Picker */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {form.avatar ? (
              <img src={form.avatar} alt="Member Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-brand-primary" />
            ) : (
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-dashed border-gray-200 text-gray-300 font-bold text-lg">
                {form.name ? form.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '+'}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-brand-primary rounded-full flex items-center justify-center shadow-md press-scale cursor-pointer border border-white">
              <Camera size={12} className="text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setForm(prev => ({ ...prev, avatar: event.target.result }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">{t('Full Name', language)}</label>
          <input 
            type="text" 
            placeholder="Enter full name" 
            value={form.name} 
            onChange={(e) => setForm({...form, name: e.target.value})} 
            className="w-full mt-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-brand-primary shadow-sm" 
          />
        </div>

        <div>
          <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">{t('Relation', language)}</label>
          <div className="relative mt-2">
            <select 
              value={form.relation} 
              onChange={(e) => setForm({...form, relation: e.target.value})} 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-brand-primary shadow-sm appearance-none"
            >
              {['Grandfather', 'Grandmother', 'Father', 'Mother', 'Uncle', 'Aunt', 'Spouse', 'Brother', 'Sister', 'Son', 'Daughter', 'Nephew', 'Niece', 'Grandson', 'Granddaughter'].map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary text-xs">▼</div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-xl text-[15px] font-bold text-text-secondary bg-gray-100 hover:bg-gray-200 press-scale">
            Cancel
          </button>
          <button 
            onClick={() => onSave({
              ...form, 
              id: initialMember?.id || Date.now().toString(), 
              initials: form.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'UN'
            })} 
            className="flex-1 py-3.5 rounded-xl text-[15px] font-bold text-white bg-brand-primary shadow-lg shadow-brand-primary/30 press-scale"
            disabled={!form.name}
          >
            Save Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyPage;
