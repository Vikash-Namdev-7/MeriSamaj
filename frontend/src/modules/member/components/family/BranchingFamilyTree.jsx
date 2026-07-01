import React, { useMemo } from 'react';
import { Avatar } from '../common/Avatar';
import { useData } from '../../context/DataProvider';
import { t } from '../../utils/translations';
import './BranchingFamilyTree.css';

const BranchingFamilyTree = ({ primaryMember, familyMembers }) => {
  const { language } = useData();

  // Inference Engine: Converts flat relationships into a proper nested tree
  const treeData = useMemo(() => {
    const members = familyMembers || [];
    
    // Categorize
    const grandparents = members.filter(m => ['Grandfather', 'Grandmother'].includes(m.relation));
    const parents = members.filter(m => ['Father', 'Mother', 'Father-in-law', 'Mother-in-law'].includes(m.relation));
    const uncles = members.filter(m => ['Uncle', 'Aunt'].includes(m.relation));
    
    const selfRow = [{ ...primaryMember, relation: 'Self', isPrimary: true, id: 'self' }];
    const spouse = members.filter(m => ['Wife', 'Husband', 'Spouse'].includes(m.relation));
    const siblings = members.filter(m => ['Brother', 'Sister'].includes(m.relation));
    const inlaws = members.filter(m => ['Brother-in-law', 'Sister-in-law'].includes(m.relation));
    const cousins = members.filter(m => ['Cousin'].includes(m.relation));
    
    const children = members.filter(m => ['Son', 'Daughter', 'Son-in-law', 'Daughter-in-law'].includes(m.relation));
    const nieces = members.filter(m => ['Nephew', 'Niece'].includes(m.relation));
    
    const grandchildren = members.filter(m => ['Grandson', 'Granddaughter'].includes(m.relation));

    // Construct the nested tree
    // Root Level (Grandparents)
    return {
      label: 'Grandparents',
      members: grandparents.length ? grandparents : [{ name: t('Grandparents', language), relation: 'Ancestors', fake: true }],
      children: [
        // Branch 1: Parents -> Self -> Children -> Grandchildren
        {
          label: 'Parents',
          members: parents.length ? parents : [{ name: t('Parents', language), relation: 'Parents', fake: true }],
          children: [
            {
              label: 'Siblings',
              members: [...siblings, ...inlaws],
              children: [
                {
                  label: 'Nieces/Nephews',
                  members: nieces,
                  children: []
                }
              ]
            },
            {
              label: 'Self',
              members: [...selfRow, ...spouse],
              children: [
                {
                  label: 'Children',
                  members: children,
                  children: [
                    {
                      label: 'Grandchildren',
                      members: grandchildren,
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        },
        // Branch 2: Uncles/Aunts -> Cousins
        {
          label: 'Uncles',
          members: uncles,
          children: [
            {
              label: 'Cousins',
              members: cousins,
              children: []
            }
          ]
        }
      ]
    };
  }, [primaryMember, familyMembers, language]);

  // Recursive render function
  const renderNode = (node) => {
    // Hide empty branches that aren't the main spine
    if (!node.members.length && node.children.length === 0 && !node.fake) return null;
    
    // Don't render fake nodes if they have no real children
    const hasRealChildren = (n) => n.children.some(c => c.members.length > 0 || hasRealChildren(c));
    if (node.fake && !hasRealChildren(node)) return null;

    return (
      <li key={node.label}>
        <div className="tree-node-container">
          {/* Group of members at this node (e.g., Husband & Wife) */}
          <div className="flex gap-2 justify-center items-center p-2 rounded-xl border border-rose-200/50 bg-rose-50/30 backdrop-blur-sm shadow-sm relative z-10">
            {node.members.map(m => (
              <div key={m.id || m.name} className={`flex flex-col items-center w-20 ${m.fake ? 'opacity-40' : ''}`}>
                <Avatar initials={m.initials || '??'} size="md" color={m.isPrimary ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "bg-white text-gray-700 shadow-sm"} />
                <p className="text-[11px] font-bold text-gray-800 mt-2 truncate w-full text-center">{m.name}</p>
                <p className="text-[10px] text-gray-500 font-medium text-center">{t(m.relation, language)}</p>
              </div>
            ))}
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <ul>
            {node.children.map(child => renderNode(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="w-full overflow-x-auto pb-10 pt-4 custom-scrollbar">
      <div className="min-w-max px-10">
        <div className="css-tree">
          <ul>
            {renderNode(treeData)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BranchingFamilyTree;
