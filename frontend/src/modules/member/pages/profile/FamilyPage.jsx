import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Camera, Trash2, Edit3, Phone, Calendar, Heart, Briefcase } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { useData } from '../../context/DataProvider';
import { t } from '../../utils/translations';

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-text-primary outline-none focus:border-brand-primary shadow-sm text-left"
      >
        <span>{value}</span>
        <span className={`text-[10px] text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-[52px] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto py-1 divide-y divide-gray-50 border-t-0 animate-fade-in">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-purple-50/30 text-xs font-semibold text-text-primary flex items-center justify-between"
            >
              <span className={value === option ? 'text-brand-primary font-black' : ''}>{option}</span>
              {value === option && <span className="text-brand-primary text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FamilyPage = () => {
  const navigate = useNavigate();
  const { currentUser, addFamilyMember, deleteFamilyMember, updateFamilyMember, language, setLanguage } = useData();
  const [activeTab, setActiveTab] = useState('list'); // list | add
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const handleSave = (member) => {
    if (editingMember) {
      updateFamilyMember(editingMember.id, member);
      setEditingMember(null);
    } else {
      addFamilyMember(member);
    }
    setActiveTab('list');
  };

  const handleCancel = () => {
    setEditingMember(null);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-6 animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 press-scale">
            <ArrowLeft size={22} className="text-text-primary" />
          </button>
          <h1 className="text-[16px] font-bold text-text-primary tracking-tight">Family Details</h1>
        </div>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="px-2.5 py-1 rounded bg-rose-50 text-rose-600 text-[12px] font-bold uppercase tracking-wider press-scale border border-rose-100"
        >
          {language === 'en' ? 'HI' : 'EN'}
        </button>
      </div>

      <div className="flex-1 px-5 pt-5 pb-20">
        <div className="flex flex-col h-full gap-4">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner shrink-0">
            <button 
              onClick={() => {
                setActiveTab('list');
                setEditingMember(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all press-scale ${activeTab === 'list' ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-text-secondary'}`}
            >
              Family Members
            </button>
            <button 
              onClick={() => {
                setActiveTab('add');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all press-scale ${activeTab === 'add' ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-text-secondary'}`}
            >
              {editingMember ? 'Edit Member' : 'Add New Member'}
            </button>
          </div>

          {activeTab === 'list' ? (
            <div className="space-y-3">
              {currentUser.familyMembers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 animate-fade-in">
                  <p className="text-sm font-semibold text-text-secondary">No family members added yet.</p>
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="mt-3 px-4 py-2 bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-bold rounded-xl press-scale"
                  >
                    + Add Family Member
                  </button>
                </div>
              ) : (
                currentUser.familyMembers.map((fm) => (
                  <div key={fm.id} className="bg-white rounded-3xl border border-gray-100 p-4.5 shadow-sm flex items-start gap-4 animate-fade-in-up">
                    <Avatar initials={fm.initials} src={fm.avatar} size="lg" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-text-primary truncate">{fm.name}</h4>
                        <span className="bg-purple-50 text-[#7C3AED] text-[9px] font-black px-2 py-0.5 rounded-full border border-purple-100 uppercase tracking-wider">
                          {fm.relation}
                        </span>
                      </div>
                      
                      {/* Sub Info Row list */}
                      <div className="mt-2.5 space-y-1.5">
                        {fm.phone && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            <span>{fm.phone}</span>
                          </div>
                        )}
                        {fm.dob && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <Calendar size={11} className="text-slate-400 shrink-0" />
                            <span>Born {new Date(fm.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        )}
                        {fm.maritalStatus && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <Heart size={11} className="text-slate-400 shrink-0" />
                            <span>{fm.maritalStatus}</span>
                          </div>
                        )}
                        {fm.occupation && (
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <Briefcase size={11} className="text-slate-400 shrink-0" />
                            <span>{fm.occupation}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2 mt-4 pt-2.5 border-t border-gray-100">
                        <button 
                          onClick={() => {
                            setEditingMember(fm);
                            setActiveTab('add');
                          }}
                          className="px-3.5 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold rounded-xl press-scale flex items-center gap-1"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button 
                          onClick={() => {
                            setMemberToDelete(fm);
                          }}
                          className="px-3.5 py-1.5 bg-red-50 text-red-500 border border-red-100 text-[10px] font-bold rounded-xl press-scale flex items-center gap-1"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <FamilyMemberForm 
              initialMember={editingMember} 
              onCancel={handleCancel} 
              onSave={handleSave} 
              language={language} 
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal inside Mobile Frame */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-xl border border-gray-100 animate-zoom-in text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trash2 size={22} className="text-red-500 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-slate-800">Delete Family Member?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Are you sure you want to remove <span className="text-slate-700 font-bold">"{memberToDelete.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-2xl border border-slate-200 transition-all press-scale"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteFamilyMember(memberToDelete.id);
                  setMemberToDelete(null);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-2xl transition-all press-scale shadow-md shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FamilyMemberForm = ({ initialMember, onCancel, onSave, language }) => {
  const [form, setForm] = useState({ 
    name: initialMember?.name || '', 
    relation: initialMember?.relation || 'Spouse', 
    dob: initialMember?.dob || '', 
    phone: initialMember?.phone || '',
    avatar: initialMember?.avatar || null,
    maritalStatus: initialMember?.maritalStatus || 'Single',
    occupation: initialMember?.occupation || ''
  });

  return (
    <div className="animate-fade-in-up bg-white rounded-3xl p-5 border border-gray-100 shadow-sm pb-12">
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
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-[#7C3AED] rounded-full flex items-center justify-center shadow-md press-scale cursor-pointer border border-white">
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
          <CustomSelect 
            value={form.relation} 
            onChange={(val) => setForm({...form, relation: val})} 
            options={['Grandfather', 'Grandmother', 'Father', 'Mother', 'Uncle', 'Aunt', 'Spouse', 'Brother', 'Sister', 'Son', 'Daughter', 'Nephew', 'Niece', 'Grandson', 'Granddaughter']}
          />
        </div>

        <div>
          <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Mobile Number</label>
          <input 
            type="tel" 
            placeholder="Enter mobile number" 
            value={form.phone} 
            maxLength={10}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              setForm({...form, phone: val});
            }}
            className="w-full mt-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-brand-primary shadow-sm" 
          />
        </div>

        <div>
          <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Date of Birth</label>
          <input 
            type="date" 
            value={form.dob} 
            onChange={(e) => setForm({...form, dob: e.target.value})} 
            className="w-full mt-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-brand-primary shadow-sm" 
          />
        </div>

        <div>
          <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Marital Status</label>
          <CustomSelect 
            value={form.maritalStatus} 
            onChange={(val) => setForm({...form, maritalStatus: val})} 
            options={['Single', 'Married', 'Divorced', 'Widowed']}
          />
        </div>

        <div>
          <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Occupation / Profession</label>
          <input 
            type="text" 
            placeholder="e.g. Student, Software Engineer, Homemaker" 
            value={form.occupation} 
            onChange={(e) => setForm({...form, occupation: e.target.value})} 
            className="w-full mt-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] text-text-primary outline-none focus:border-brand-primary shadow-sm" 
          />
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
            className="flex-1 py-3.5 rounded-xl text-[15px] font-bold text-white bg-[#7C3AED] shadow-lg shadow-[#7C3AED]/30 press-scale"
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
