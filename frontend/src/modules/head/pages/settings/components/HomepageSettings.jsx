import React from 'react';
import { Layout } from 'lucide-react';

export const HomepageSettings = ({ settings, updateDraft }) => {
  const modules = settings?.modules || {};

  const handleToggle = (key) => {
    updateDraft('modules', key, !modules[key]);
  };

  const renderToggle = (label, key, description) => (
    <div className="flex items-start justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <div className="pr-4">
        <h4 className="text-sm font-bold text-white mb-0.5">{label}</h4>
        <p className="text-[10px] text-white/50">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={!!modules[key]}
          onChange={() => handleToggle(key)}
        />
        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
      </label>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layout size={20} className="text-brand-primary" />
          Module Visibility
        </h2>
        <p className="text-xs text-white/50">Enable or disable features across the public homepage and member dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderToggle('Donation', 'donation', 'Allow members to make donations online.')}
        {renderToggle('Matrimonial', 'matrimonial', 'Enable the matrimonial profiles module.')}
        {renderToggle('Events', 'events', 'Show upcoming events and allow registrations.')}
        {renderToggle('Professional Directory', 'professionalDirectory', 'Business listings and professional networking.')}
        {renderToggle('Gallery', 'gallery', 'Photo and video gallery of community events.')}
        {renderToggle('News & Announcements', 'news', 'Publish news, circulars, and announcements.')}
        {renderToggle('Polls & Voting', 'polls', 'Run community polls or small elections.')}
        {renderToggle('Surveys', 'surveys', 'Gather feedback from community members.')}
        {renderToggle('Achievements', 'achievements', 'Highlight member accomplishments.')}
        {renderToggle('Shradhanjali', 'shradhanjali', 'Obituaries and condolences section.')}
        {renderToggle('Advertisements', 'advertisements', 'Show banner ads from sponsors.')}
        {renderToggle('Volunteer Program', 'volunteer', 'Allow members to sign up as volunteers.')}
      </div>
    </div>
  );
};
