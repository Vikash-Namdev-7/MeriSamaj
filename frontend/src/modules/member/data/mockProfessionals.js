// ─── Mock Professional Directory Data ───────────────────────────────────────
// 
// API-READY: When the backend is ready, replace this mock data with 
// API calls in the useProfessionalDirectory.js hook.
//
// Expected API endpoint:
//   GET /api/professional-listings?communityId=xxx
//   GET /api/professional-categories
//
// API Response Shape (each item):
// {
//   id: string,
//   title: string,          // business name
//   category: string,       // e.g. 'Manufacturing'
//   categoryKey: string,    // e.g. 'manufacturing' (for icon mapping)
//   city: string,
//   rating: number,
//   initials: string,       // auto-derive on backend or compute on client
//   phone: string,
//   verified: boolean,
//   description?: string,
//   logo?: string,          // image URL
// }

export const mockProfessionals = [
  {
    id: 'p1',
    title: 'Sharma Industries',
    category: 'Manufacturing',
    categoryKey: 'manufacturing',
    city: 'Jaipur',
    rating: 4.8,
    initials: 'SI',
    phone: '+91 98765 43210',
    verified: true,
    description: 'Manufacturer of high-quality industrial products.',
    logo: null,
  },
  {
    id: 'p2',
    title: 'Yadav Construction',
    category: 'Construction',
    categoryKey: 'construction',
    city: 'Kota',
    rating: 4.9,
    initials: 'YC',
    phone: '+91 98765 11111',
    verified: true,
    description: 'Residential and commercial construction services.',
    logo: null,
  },
  {
    id: 'p3',
    title: 'Gupta Classes',
    category: 'Education Services',
    categoryKey: 'education',
    city: 'Alwar',
    rating: 4.7,
    initials: 'GC',
    phone: '+91 98765 22222',
    verified: true,
    description: 'Specialized coaching for competitive exams.',
    logo: null,
  },
  {
    id: 'p4',
    title: 'Agrawal Diagnostics',
    category: 'Health',
    categoryKey: 'health',
    city: 'Indore',
    rating: 4.8,
    initials: 'AD',
    phone: '+91 98765 33333',
    verified: true,
    description: 'All types of pathology and diagnostic services.',
    logo: null,
  },
  {
    id: 'p5',
    title: 'Verma Law Associates',
    category: 'Others',
    categoryKey: 'others',
    city: 'Bhopal',
    rating: 4.6,
    initials: 'VA',
    phone: '+91 98765 44444',
    verified: true,
    description: 'Expert lawyers in civil and criminal cases.',
    logo: null,
  },
  {
    id: 'p6',
    title: 'Mehta Architects',
    category: 'Construction',
    categoryKey: 'construction',
    city: 'Udaipur',
    rating: 4.7,
    initials: 'MA',
    phone: '+91 98765 55555',
    verified: true,
    description: 'Modern architecture and interior design services.',
    logo: null,
  },
  {
    id: 'p7',
    title: 'Jain Health Clinic',
    category: 'Health',
    categoryKey: 'health',
    city: 'Jaipur',
    rating: 4.9,
    initials: 'JC',
    phone: '+91 98765 66666',
    verified: true,
    description: 'General medicine and expert consultation services.',
    logo: null,
  },
];

// ─── Category UI Configuration ───────────────────────────────────────────────
// When category keys come from the Admin panel, the UI icon will auto-assign from iconMap.
// To add a new category, just add an entry in iconMap.

import { Building, Hammer, GraduationCap, Heart, MoreHorizontal, Briefcase } from 'lucide-react';

export const categoryIconMap = {
  manufacturing: { icon: Building,        color: 'bg-orange-50 text-orange-600 border-orange-100', labelHi: 'Manufacturing' },
  construction:  { icon: Hammer,           color: 'bg-sky-50 text-sky-600 border-sky-100',         labelHi: 'Construction' },
  education:     { icon: GraduationCap,    color: 'bg-emerald-50 text-emerald-600 border-emerald-100', labelHi: 'Education' },
  health:        { icon: Heart,            color: 'bg-rose-50 text-rose-600 border-rose-100',      labelHi: 'Health' },
  business:      { icon: Briefcase,        color: 'bg-violet-50 text-violet-600 border-violet-100', labelHi: 'Business' },
  others:        { icon: MoreHorizontal,   color: 'bg-gray-50 text-gray-600 border-gray-100',     labelHi: 'Others' },
};

// Card color palette — auto-assigned by index when no logo available
export const cardColors = [
  'bg-amber-100 text-amber-700 ring-amber-200',
  'bg-teal-100 text-teal-700 ring-teal-200',
  'bg-red-100 text-red-700 ring-red-200',
  'bg-indigo-100 text-indigo-700 ring-indigo-200',
  'bg-purple-100 text-purple-700 ring-purple-200',
  'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'bg-sky-100 text-sky-700 ring-sky-200',
];
