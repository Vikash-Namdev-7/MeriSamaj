import React from 'react';
import { AreaChart, BarChart, DonutChart, ProgressRing } from './ChartComponents';
import { Users, Calendar, Heart, Briefcase, Award, Bell, Home, DollarSign } from 'lucide-react';

export const AnalyticsSection = ({ title, icon, children }) => (
  <div className="card-neo p-6 space-y-6">
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
      <div className="w-10 h-10 rounded-xl bg-brand-primary/20 text-brand-primary flex items-center justify-center border border-brand-primary/30">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">Real-time analytical data</p>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <div className={`p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between ${className}`}>
    <div className="mb-4">
      <h4 className="text-sm font-bold text-gray-800">{title}</h4>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex-1 flex items-center justify-center">
      {children}
    </div>
  </div>
);

export const MemberAnalytics = ({ data }) => {
  return (
    <AnalyticsSection title="Member Analytics" icon={<Users size={20} />}>
      <ChartCard title="Monthly Growth" subtitle="Verified accounts over time" className="xl:col-span-2">
        <AreaChart data={[10, 25, 45, 60, 90, 150]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
      </ChartCard>
      
      <ChartCard title="Verification Status" subtitle="Active vs Pending accounts">
        <div className="flex flex-col items-center gap-4 w-full">
          <DonutChart data={[{value: 85}, {value: 15}]} colors={['#34D399', '#FB7185']} size={140} />
          <div className="flex items-center gap-4 text-xs font-bold w-full justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-400" /> 85% Active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-400" /> 15% Pending</span>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Gender Distribution">
        <div className="flex flex-col items-center gap-4 w-full">
          <DonutChart data={[{value: 55}, {value: 45}]} colors={['#8B5CF6', '#F472B6']} size={140} />
          <div className="flex items-center gap-4 text-xs font-bold w-full justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" /> 55% Male</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-pink-400" /> 45% Female</span>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Age Distribution" className="xl:col-span-2">
        <BarChart 
          data={[15, 35, 40, 25, 10]} 
          labels={['18-24', '25-34', '35-44', '45-54', '55+']} 
          colors={['#60A5FA']}
        />
      </ChartCard>
    </AnalyticsSection>
  );
};

export const EventAnalytics = ({ data }) => {
  return (
    <AnalyticsSection title="Event Analytics" icon={<Calendar size={20} />}>
      <ChartCard title="Registrations vs Attendance" subtitle="Expected vs Actual Turnout" className="xl:col-span-2">
        <BarChart 
          data={[[100, 80], [150, 140], [200, 180], [120, 90]]} 
          labels={['Q1', 'Q2', 'Q3', 'Q4']}
          colors={['#8B5CF6', '#34D399']}
        />
        <div className="flex items-center gap-4 text-xs font-bold mt-2 absolute bottom-2 right-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" /> Registered</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-400" /> Attended</span>
        </div>
      </ChartCard>

      <ChartCard title="Overall Participation %">
        <ProgressRing progress={78} size={150} color="#818CF8" />
      </ChartCard>
    </AnalyticsSection>
  );
};

export const MatrimonialAnalytics = ({ data }) => {
  return (
    <AnalyticsSection title="Matrimonial Analytics" icon={<Heart size={20} />}>
       <ChartCard title="Active Matches">
        <ProgressRing progress={45} size={140} color="#F472B6" />
      </ChartCard>

      <ChartCard title="Profile Completion" className="xl:col-span-2">
        <AreaChart data={[30, 45, 60, 75, 80, 85]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} color="#F472B6" />
      </ChartCard>
    </AnalyticsSection>
  );
};

export const ProfessionalAnalytics = ({ data }) => {
  return (
    <AnalyticsSection title="Professional Directory Analytics" icon={<Briefcase size={20} />}>
      <ChartCard title="Business Categories" className="xl:col-span-2">
        <BarChart 
          data={[35, 25, 20, 15, 5]} 
          labels={['IT', 'Finance', 'Medical', 'Business', 'Other']}
          colors={['#FBBF24']}
        />
      </ChartCard>
      
      <ChartCard title="Verified Listings">
        <ProgressRing progress={92} size={140} color="#FBBF24" />
      </ChartCard>
    </AnalyticsSection>
  );
};

export const EngagementAnalytics = ({ data }) => {
  return (
    <AnalyticsSection title="Community Engagement" icon={<Award size={20} />}>
      <ChartCard title="Weekly Active Users" subtitle="Members active on platform" className="xl:col-span-2">
        <AreaChart data={[300, 450, 400, 600, 800, 750]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6']} color="#8B5CF6" />
      </ChartCard>

      <ChartCard title="Leaderboard">
        <div className="w-full space-y-3">
          {[
            { name: 'Suresh Agrawal', points: 1250, role: 'Patron' },
            { name: 'Dr. Kavita Agrawal', points: 980, role: 'Volunteer' },
            { name: 'Vikas Jain', points: 850, role: 'Contributor' }
          ].map((u, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div>
                <p className="text-xs font-bold text-gray-800">{u.name}</p>
                <p className="text-[9px] text-gray-500">{u.role}</p>
              </div>
              <span className="text-xs font-black text-brand-primary">{u.points} pts</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </AnalyticsSection>
  );
};

export const NotificationAnalytics = ({ data }) => {
  return (
    <AnalyticsSection title="Notification Analytics" icon={<Bell size={20} />}>
      <ChartCard title="Delivery Rate">
        <ProgressRing progress={98.5} size={140} color="#60A5FA" />
      </ChartCard>

      <ChartCard title="Notification Reach by Channel" className="xl:col-span-2">
        <BarChart 
          data={[450, 320, 150]} 
          labels={['Push', 'Email', 'SMS']}
          colors={['#60A5FA', '#34D399', '#FBBF24']}
        />
      </ChartCard>
    </AnalyticsSection>
  );
};

export const FamilyAnalytics = ({ data }) => {
  return (
    <AnalyticsSection title="Family Analytics" icon={<Home size={20} />}>
      <ChartCard title="Family Growth" subtitle="New family registrations" className="xl:col-span-2">
        <AreaChart data={[15, 20, 35, 50, 75, 90]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} color="#10B981" />
      </ChartCard>
      
      <ChartCard title="Average Family Size">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-4xl font-black text-emerald-500 mb-2">4.2</div>
          <p className="text-xs font-bold text-gray-500">Members per family</p>
        </div>
      </ChartCard>
    </AnalyticsSection>
  );
};

export const FundAnalytics = ({ data }) => {
  return (
    <AnalyticsSection title="Donation & Fund Analytics" icon={<DollarSign size={20} />}>
      <ChartCard title="Monthly Donations" className="xl:col-span-2">
        <BarChart 
          data={[12000, 15000, 11000, 18000, 25000, 22000]} 
          labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
          colors={['#F59E0B']}
        />
      </ChartCard>

      <ChartCard title="Campaign Progress">
        <ProgressRing progress={85} size={140} color="#F59E0B" />
        <p className="text-xs font-bold text-gray-500 mt-2 text-center w-full">Annual Target: ₹5,00,000</p>
      </ChartCard>
    </AnalyticsSection>
  );
};
