import { 
  LayoutDashboard, BarChart3, Clock, Trophy, UserX, CalendarCheck, HeartHandshake, Share2, Award, FileText 
} from 'lucide-react';

export const ENGAGEMENT_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'contributors', label: 'Top Contributors', icon: Trophy },
  { id: 'inactive', label: 'Inactive Members', icon: UserX },
  { id: 'events', label: 'Event Participation', icon: CalendarCheck },
  { id: 'donations', label: 'Donation Participation', icon: HeartHandshake },
  { id: 'social', label: 'Social Engagement', icon: Share2 },
  { id: 'recognition', label: 'Member Recognition', icon: Award },
  { id: 'reports', label: 'Reports', icon: FileText }
];
