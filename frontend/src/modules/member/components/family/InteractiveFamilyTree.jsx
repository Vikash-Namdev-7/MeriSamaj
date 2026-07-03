import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, User, Phone, MessageSquare, ExternalLink, Calendar, Heart, Briefcase, X, MapPin, HeartPulse } from 'lucide-react';
import { Avatar } from '../common/Avatar';

// ─── UTILITIES ───

// Map flat relations to layout columns/rows
const getLayoutGeneration = (relationStr) => {
  const r = relationStr.toLowerCase();
  if (r.includes('grandfather') || r.includes('grandmother')) return 2;
  if (r.includes('grandson') || r.includes('granddaughter')) return -2;
  if (r.includes('father') || r.includes('mother') || r.includes('parent') || r.includes('uncle') || r.includes('aunt')) return 1;
  if (r.includes('son') || r.includes('daughter') || r.includes('child') || r.includes('nephew') || r.includes('niece')) return -1;
  return 0; // Spouses, Siblings, Self
};

const getRelationCategory = (relationStr) => {
  const r = relationStr.toLowerCase();
  if (r.includes('wife') || r.includes('husband') || r.includes('spouse')) return 'spouse';
  if (r.includes('brother') || r.includes('sister') || r.includes('sibling')) return 'sibling';
  return 'other';
};

// SVG Curved Path Generator
const drawCurve = (x1, y1, x2, y2) => {
  // Add some vertical padding so it comes out of the bottom/top of nodes
  const offset = 40;
  if (Math.abs(y1 - y2) > 20) {
    // Vertical curve (parents/children)
    return `M ${x1} ${y1} C ${x1} ${y1 + offset}, ${x2} ${y2 - offset}, ${x2} ${y2}`;
  } else {
    // Horizontal curve (spouses/siblings)
    return `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;
  }
};


// ─── MAIN COMPONENT ───

export default function InteractiveFamilyTree({ members, currentUser, onEditMember }) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Map Data to Nodes & Layout
  const { nodes, edges } = useMemo(() => {
    const nodeWidth = 120;
    const nodeHeight = 140;
    const gapX = 60;
    const gapY = 260;

    let allNodes = [];
    let allEdges = [];

    // Add Self (Center)
    const meNode = {
      ...currentUser,
      isMe: true,
      treeId: 'me',
      relation: 'Self',
      x: 0,
      y: 0
    };
    allNodes.push(meNode);

    // Group members by generation
    const byGen = {
      2: [], 1: [], 0: { spouse: [], sibling: [], other: [] }, '-1': [], '-2': []
    };

    members.forEach(m => {
      const gen = getLayoutGeneration(m.relation);
      if (gen === 0) {
        byGen[0][getRelationCategory(m.relation)].push(m);
      } else if (byGen[gen]) {
        byGen[gen].push(m);
      }
    });

    // Helper to sort by closeness to center
    const sortByCloseness = (a, b) => {
      const getWeight = (r) => {
        const rel = r.toLowerCase();
        if (rel.includes('mother') || rel.includes('grandmother')) return 1;
        if (rel.includes('father') || rel.includes('grandfather')) return 2;
        if (rel.includes('aunt')) return -1;
        if (rel.includes('uncle')) return 10;
        return 5;
      };
      return getWeight(a.relation) - getWeight(b.relation);
    };

    // Layout Generation 2 (Grandparents) - Placed Above Parents
    byGen[2].sort(sortByCloseness);
    const gpCount = byGen[2].length;
    byGen[2].forEach((m, i) => {
      const offsetX = (i - (gpCount - 1) / 2) * (nodeWidth + gapX);
      allNodes.push({ ...m, treeId: m.id, x: offsetX, y: -gapY * 2 });
      const parentNode = byGen[1].find(p => p.relation.toLowerCase().includes('father') || p.relation.toLowerCase().includes('mother'));
      allEdges.push({ source: m.id, target: parentNode ? parentNode.id : 'me', type: 'parent' });
    });

    // Layout Generation 1 (Parents) - Placed Above
    byGen[1].sort(sortByCloseness);
    const pCount = byGen[1].length;
    byGen[1].forEach((m, i) => {
      const offsetX = (i - (pCount - 1) / 2) * (nodeWidth + gapX);
      allNodes.push({ ...m, treeId: m.id, x: offsetX, y: -gapY });
      allEdges.push({ source: m.id, target: 'me', type: 'parent' });
    });

    // Layout Generation -1 (Children) - Placed Below
    const cCount = byGen['-1'].length;
    byGen['-1'].forEach((m, i) => {
      const offsetX = (i - (cCount - 1) / 2) * (nodeWidth + gapX);
      allNodes.push({ ...m, treeId: m.id, x: offsetX, y: gapY });
      allEdges.push({ source: 'me', target: m.id, type: 'child' });
    });

    // Layout Generation -2 (Grandchildren) - Placed Below Children
    const gcCount = byGen['-2'].length;
    byGen['-2'].forEach((m, i) => {
      const offsetX = (i - (gcCount - 1) / 2) * (nodeWidth + gapX);
      allNodes.push({ ...m, treeId: m.id, x: offsetX, y: gapY * 2 });
      const childNode = byGen['-1'].length > 0 ? byGen['-1'][0] : null;
      allEdges.push({ source: childNode ? childNode.id : 'me', target: m.id, type: 'child' });
    });

    // Layout Generation 0 (Spouses & Siblings) - Placed Beside
    // Spouses to the right, siblings to the left
    const sCount = byGen[0].spouse.length;
    byGen[0].spouse.forEach((m, i) => {
      const offsetX = (i + 1) * (nodeWidth + gapX);
      allNodes.push({ ...m, treeId: m.id, x: offsetX, y: 0 });
      allEdges.push({ source: 'me', target: m.id, type: 'spouse' });
    });

    const sibCount = byGen[0].sibling.length;
    byGen[0].sibling.forEach((m, i) => {
      const offsetX = -(i + 1) * (nodeWidth + gapX);
      allNodes.push({ ...m, treeId: m.id, x: offsetX, y: 0 });
      allEdges.push({ source: m.id, target: 'me', type: 'sibling' });
    });

    const otherCount = byGen[0].other.length;
    byGen[0].other.forEach((m, i) => {
      const offsetX = (sCount + i + 1) * (nodeWidth + gapX);
      allNodes.push({ ...m, treeId: m.id, x: offsetX, y: 0 });
      allEdges.push({ source: 'me', target: m.id, type: 'other' });
    });

    return { nodes: allNodes, edges: allEdges };
  }, [members, currentUser]);


  // 2. Pan & Zoom Handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAdjust = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(0.3, prev.scale * scaleAdjust), 2.5)
    }));
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // 3. UI Controls
  const zoomIn = () => setTransform(p => ({ ...p, scale: Math.min(2.5, p.scale * 1.2) }));
  const zoomOut = () => setTransform(p => ({ ...p, scale: Math.max(0.3, p.scale * 0.8) }));
  const resetZoom = () => setTransform({ x: 0, y: 0, scale: 1 });

  return (
    <div className="relative -mx-5 w-[calc(100%+2.5rem)] h-[75vh] min-h-[500px] bg-slate-50/50 rounded-3xl sm:rounded-[36px] border border-purple-100/30 overflow-hidden shadow-inner flex flex-col animate-fade-in-up mt-2">
      
      {/* Top Bar: Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-end gap-3 items-start pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/30 shadow-lg overflow-hidden flex flex-col">
            <button onClick={zoomIn} className="p-2.5 hover:bg-purple-50 text-slate-600 active:bg-purple-100 transition-colors"><ZoomIn size={16} /></button>
            <div className="w-full h-px bg-purple-100/50" />
            <button onClick={zoomOut} className="p-2.5 hover:bg-purple-50 text-slate-600 active:bg-purple-100 transition-colors"><ZoomOut size={16} /></button>
          </div>

        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 w-full h-full touch-none cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <motion.div 
          className="w-full h-full origin-center relative flex items-center justify-center"
          animate={{ x: transform.x, y: transform.y, scale: transform.scale }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* SVG Edges Layer */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {edges.map((edge, i) => {
              const sourceNode = nodes.find(n => n.treeId === edge.source);
              const targetNode = nodes.find(n => n.treeId === edge.target);
              if (!sourceNode || !targetNode) return null;

              // Node anchor offsets
              let sx = sourceNode.x; let sy = sourceNode.y;
              let tx = targetNode.x; let ty = targetNode.y;

              // Adjust anchors based on relationship (bottom to top, or side to side)
              if (edge.type === 'parent' || edge.type === 'child') {
                if (sourceNode.y < targetNode.y) {
                  sy += 70; ty -= 70; // Top node bottom to bottom node top
                } else {
                  sy -= 70; ty += 70; 
                }
              } else {
                if (sourceNode.x < targetNode.x) {
                  sx += 60; tx -= 60; // Left node right to right node left
                } else {
                  sx -= 60; tx += 60;
                }
              }

              return (
                <path 
                  key={i}
                  d={drawCurve(sx, sy, tx, ty)}
                  fill="none"
                  stroke={edge.type === 'spouse' ? '#F43F5E' : '#8B5CF6'}
                  strokeWidth="2.5"
                  strokeDasharray={edge.type === 'spouse' ? '4 4' : 'none'}
                  className="opacity-40"
                />
              );
            })}
          </svg>

          {/* HTML Nodes Layer */}
          <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {nodes.map(node => {
              const isMatch = searchQuery === '' || node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.relation.toLowerCase().includes(searchQuery.toLowerCase());
              
              return (
                <div 
                  key={node.treeId}
                  className={`absolute w-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-300 ${isMatch ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}
                  style={{ left: node.x, top: node.y }}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`w-full bg-white/90 backdrop-blur-md p-3 rounded-[24px] flex flex-col items-center gap-2 border-2 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all ${node.isMe ? 'border-[#7C3AED] shadow-[0_4px_20px_rgba(124,58,237,0.2)]' : 'border-purple-100/50 shadow-sm'}`}
                  >
                    <div className="relative">
                      <Avatar initials={node.initials} src={node.avatar} size="lg" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                      {node.isMe && (
                        <div className="absolute -bottom-1 -right-1 bg-[#7C3AED] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white">
                          YOU
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <h4 className="text-[11px] font-black text-slate-800 truncate leading-tight">{node.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 truncate mt-0.5 uppercase tracking-wider">{node.relation}</p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

        </motion.div>
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/40 backdrop-blur-sm sm:items-center"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl overflow-hidden relative"
            >
              <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center mt-2 mb-5">
                <Avatar initials={selectedNode.initials} src={selectedNode.avatar} size="xl" className="w-20 h-20 rounded-full border-4 border-purple-50 shadow-md mb-3" />
                <h3 className="text-lg font-black text-slate-800">{selectedNode.name}</h3>
                <span className="inline-flex items-center gap-1 bg-purple-50 text-[#7C3AED] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider mt-1.5">
                  <HeartPulse size={12} /> {selectedNode.relation}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Calendar size={14} className="text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Age / Born</span>
                  <span className="text-xs font-black text-slate-700">{selectedNode.dob || selectedNode.age || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Briefcase size={14} className="text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Profession</span>
                  <span className="text-xs font-black text-slate-700 truncate w-full">{selectedNode.occupation || selectedNode.profession || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Heart size={14} className="text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Marital Status</span>
                  <span className="text-xs font-black text-slate-700 truncate w-full">{selectedNode.maritalStatus || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Phone size={14} className="text-slate-400 mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                  <span className="text-xs font-black text-slate-700 truncate w-full">{selectedNode.phone || 'N/A'}</span>
                </div>
              </div>

              {selectedNode.status === 'deceased' ? (
                <div className="bg-slate-100/50 p-4 rounded-2xl text-center border border-slate-200/50">
                  <p className="text-xs font-bold text-slate-500 italic">In Loving Memory</p>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  {!selectedNode.isMe && onEditMember && (
                    <button 
                      onClick={() => { setSelectedNode(null); onEditMember(selectedNode); }}
                      className="w-full py-3 bg-purple-50 text-[#7C3AED] rounded-2xl flex justify-center items-center gap-2 hover:bg-purple-100 active:scale-95 transition-all text-xs font-black"
                    >
                      <User size={14} /> Edit Info
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
