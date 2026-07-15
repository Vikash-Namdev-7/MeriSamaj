import React, { useState, useEffect } from 'react';
import { X, Settings, Check, Trash2, Edit2, Plus } from 'lucide-react';
import { useData } from '../../../../member/context/DataProvider';

export default function InvitationFormSettingsModal({ isOpen, onClose }) {
  const { invitationFormConfig, updateInvitationConfig } = useData();
  const [localConfig, setLocalConfig] = useState(invitationFormConfig);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(invitationFormConfig);
    }
  }, [isOpen, invitationFormConfig]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    updateInvitationConfig(localConfig);
    onClose();
  };

  const handleDeleteField = (id) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      setLocalConfig(prev => ({
        ...prev,
        formFields: prev.formFields.filter(f => f.id !== id)
      }));
    }
  };

  const startEditField = (field) => {
    setEditingFieldId(field.id);
    setEditFormData({ ...field });
  };

  const saveEditedField = () => {
    setLocalConfig(prev => ({
      ...prev,
      formFields: prev.formFields.map(f => f.id === editingFieldId ? editFormData : f)
    }));
    setEditingFieldId(null);
  };

  const addNewField = () => {
    const newId = `custom_${Date.now()}`;
    const newField = { 
      id: newId, 
      label: 'New Field', 
      desc: 'Description for new field', 
      type: 'text', 
      required: false 
    };
    setLocalConfig(prev => ({
      ...prev,
      formFields: [...(prev.formFields || []), newField]
    }));
    startEditField(newField);
  };

  const fixedSettings = [
    { key: 'enableMembersTab', label: 'Show Members Directory', desc: 'Allow inviting general members' },
    { key: 'enablePresidentsTab', label: 'Show Presidents Tab', desc: 'Allow inviting community presidents' },
    { key: 'enableGroupsTab', label: 'Show Groups Tab', desc: 'Allow inviting entire groups' },
    { key: 'enableFriendsTab', label: 'Show Friends Tab', desc: 'Allow inviting from friends list' },
    { key: 'enableBatchInvite', label: 'Batch Invite Actions', desc: 'Allow "Invite All" bulk actions' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-slate-800">Form Configuration</h2>
              <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Manage fields for member invitation form</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center !text-slate-500 hover:bg-slate-100 hover:!text-rose-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
          
          {/* Dynamic Fields Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Form Fields</h3>
              <button onClick={addNewField} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
                <Plus size={14} /> Add Field
              </button>
            </div>
            
            {localConfig.formFields?.map(field => (
              <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 transition-all">
                {editingFieldId === field.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Field Label</label>
                        <input 
                          type="text" 
                          value={editFormData.label} 
                          onChange={e => setEditFormData({...editFormData, label: e.target.value})}
                          className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Input Type</label>
                        <select 
                          value={editFormData.type} 
                          onChange={e => setEditFormData({...editFormData, type: e.target.value})}
                          className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 mt-1 bg-white"
                        >
                          <option value="text">Text</option>
                          <option value="time">Time</option>
                          <option value="date">Date</option>
                          <option value="url">URL Link</option>
                          <option value="tel">Phone</option>
                          <option value="file">File Upload</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                      <input 
                        type="text" 
                        value={editFormData.desc} 
                        onChange={e => setEditFormData({...editFormData, desc: e.target.value})}
                        className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 mt-1"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editFormData.required} 
                          onChange={e => setEditFormData({...editFormData, required: e.target.checked})}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        Required Field
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingFieldId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                        <button onClick={saveEditedField} className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                        {field.label}
                        {field.required && <span className="text-[9px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase font-black">Required</span>}
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">{field.type}</span>
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{field.desc}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditField(field)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteField(field.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {localConfig.formFields?.length === 0 && (
              <div className="text-center p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm font-semibold text-slate-500">
                No custom fields added.
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Directory Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Directory & Features</h3>
            {fixedSettings.map(option => (
              <div key={option.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-[14px] font-bold text-slate-800">{option.label}</h4>
                  <p className="text-[11px] font-semibold text-slate-500">{option.desc}</p>
                </div>
                
                {/* Toggle Switch */}
                <button 
                  onClick={() => handleToggle(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localConfig[option.key] ? 'bg-indigo-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localConfig[option.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-[13px] !text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-bold text-[13px] !text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check size={16} strokeWidth={3} className="!text-white" />
            <span className="!text-white">Save Configuration</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
