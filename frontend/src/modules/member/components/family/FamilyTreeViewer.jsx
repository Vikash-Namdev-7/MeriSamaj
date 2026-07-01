import React, { useState, useMemo } from 'react';
import { Network, ListFilter, UserPlus, MoreVertical, CheckCircle } from 'lucide-react';
import { Avatar } from '../common/Avatar';

const generationMap = {
  'Grandfather': 2, 'Grandmother': 2,
  'Father': 1, 'Mother': 1, 'Uncle': 1, 'Aunt': 1, 'Father-in-law': 1, 'Mother-in-law': 1,
  'Self': 0, 'Wife': 0, 'Husband': 0, 'Spouse': 0, 'Brother': 0, 'Sister': 0, 'Cousin': 0, 'Brother-in-law': 0, 'Sister-in-law': 0,
  'Son': -1, 'Daughter': -1, 'Nephew': -1, 'Niece': -1, 'Son-in-law': -1, 'Daughter-in-law': -1,
  'Grandson': -2, 'Granddaughter': -2
};

const generationTitles = {
  2: "Grandparents",
  1: "Parents & Elders",
  0: "Peers & Siblings",
  '-1': "Children",
  '-2': "Grandchildren"
};

export const FamilyTreeViewer = ({ primaryMember, familyMembers, onAddClick }) => {
  const [viewMode, setViewMode] = useState('tree-asc'); // 'tree-asc', 'tree-desc', 'list'

  const processedData = useMemo(() => {
    // Inject Self into the pool
    const selfRecord = {
      ...primaryMember,
      relation: 'Self',
      isPrimary: true,
      id: primaryMember.id || 'self'
    };

    const allMembers = [selfRecord, ...(familyMembers || [])];

    // Assign generation
    const membersWithGen = allMembers.map(m => {
      const gen = generationMap[m.relation] !== undefined ? generationMap[m.relation] : 0;
      return { ...m, gen };
    });

    if (viewMode === 'list') {
      return membersWithGen.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Group by generation
    const grouped = membersWithGen.reduce((acc, curr) => {
      acc[curr.gen] = acc[curr.gen] || [];
      acc[curr.gen].push(curr);
      return acc;
    }, {});

    // Sort generations
    const sortedGens = Object.keys(grouped).map(Number).sort((a, b) => {
      return viewMode === 'tree-asc' ? b - a : a - b; // b - a: 2, 1, 0, -1
    });

    return sortedGens.map(gen => ({
      genLevel: gen,
      title: generationTitles[gen] || 'Extended Family',
      members: grouped[gen]
    }));
  }, [primaryMember, familyMembers, viewMode]);

  return (
    <div className="w-full">
      {/* ─── CONTROLS ─── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-white/50 backdrop-blur-md rounded-xl p-1 border border-gray-200">
          <button
            onClick={() => setViewMode('tree-asc')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all ${viewMode === 'tree-asc' ? 'bg-white shadow-sm text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Network size={14} /> Tree (Top-Down)
          </button>
          <button
            onClick={() => setViewMode('tree-desc')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all ${viewMode === 'tree-desc' ? 'bg-white shadow-sm text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Network size={14} className="rotate-180" /> Tree (Bottom-Up)
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <ListFilter size={14} /> List
          </button>
        </div>
      </div>

      {/* ─── RENDER ─── */}
      <div className="space-y-2">
        {viewMode === 'list' ? (
          // Flat List View
          <div className="space-y-3">
            {processedData.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        ) : (
          // Tree View
          <div className="relative border-l-2 border-gray-200 ml-4 pb-4">
            {processedData.map((genGroup, idx) => (
              <div key={genGroup.genLevel} className="mb-8 relative">
                {/* Generation Node/Header */}
                <div className="absolute -left-[17px] top-4 w-8 h-8 rounded-full bg-white border-4 border-brand-primary/20 flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-brand-primary" />
                </div>
                
                <div className="pl-8 pt-3">
                  <h3 className="text-[14px] font-bold text-brand-primary tracking-wide mb-3">{genGroup.title}</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {genGroup.members.map(m => (
                      <MemberCard key={m.id} member={m} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Button */}
        {onAddClick && (
          <button 
            onClick={onAddClick}
            className="w-full mt-6 py-5 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 flex flex-col items-center justify-center gap-2.5 press-scale text-gray-400 hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-colors"
          >
            <UserPlus size={24} />
            <span className="text-[14px] font-semibold">Add Family Member</span>
          </button>
        )}
      </div>
    </div>
  );
};

const MemberCard = ({ member }) => {
  return (
    <div className={`card-std p-4 flex items-center justify-between card-press ${member.isPrimary ? 'border-2 border-brand-primary/20 bg-brand-primary/5' : 'border border-gray-100 bg-white'}`}>
      <div className="flex items-center gap-4">
        <Avatar initials={member.initials} size="md" color={member.isPrimary ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-600"} />
        <div>
          <h3 className="text-[15px] font-bold text-text-primary flex items-center gap-2">
            {member.name}
            {member.isPrimary && <CheckCircle size={14} className="text-brand-primary" />}
          </h3>
          <p className="text-[13px] text-text-secondary mt-0.5 font-medium">{member.relation}</p>
        </div>
      </div>
      {!member.isPrimary && (
        <button className="p-2 press-scale">
          <MoreVertical size={20} className="text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};
