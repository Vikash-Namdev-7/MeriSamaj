import React from 'react';

export const GeneralInfoTab = ({ settings, updateDraft }) => {
  const general = settings?.general || {};

  const handleChange = (e) => {
    updateDraft('general', e.target.name, e.target.value);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-gray-900">General Information</h2>
        <p className="text-xs text-gray-500">Core details about your community organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Community Name *</label>
          <input 
            name="name"
            value={general.name || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-sm text-gray-900 transition-all focus:ring-2 focus:ring-brand-primary/20"
            placeholder="e.g. Agrawal Samaj Indore"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tagline</label>
          <input 
            name="tagline"
            value={general.tagline || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-sm text-gray-900 transition-all focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Short catchy phrase"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Description</label>
          <textarea 
            name="description"
            value={general.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-sm text-gray-900 transition-all resize-none focus:ring-2 focus:ring-brand-primary/20"
            placeholder="Briefly describe your community..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Established Year</label>
          <input 
            name="establishedYear"
            value={general.establishedYear || ''}
            onChange={handleChange}
            type="number"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-sm text-gray-900 transition-all focus:ring-2 focus:ring-brand-primary/20"
            placeholder="YYYY"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Registration Number</label>
          <input 
            name="registrationNumber"
            value={general.registrationNumber || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-sm text-gray-900 transition-all focus:ring-2 focus:ring-brand-primary/20"
            placeholder="e.g. REG-123"
          />
        </div>
      </div>

      <div className="h-[1px] bg-gray-200 my-6" />

      <div className="space-y-1 mb-6">
        <h3 className="text-md font-bold text-gray-900">Contact & Location</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Official Email</label>
          <input 
            name="email"
            type="email"
            value={general.email || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-sm text-gray-900 transition-all focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Contact Phone</label>
          <input 
            name="phone"
            value={general.phone || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Office Address</label>
          <input 
            name="officeAddress"
            value={general.officeAddress || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-sm text-white transition-all"
          />
        </div>
      </div>
    </div>
  );
};
