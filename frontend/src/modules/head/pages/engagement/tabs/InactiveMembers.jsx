import React, { useState } from 'react';
import { useInactiveMembers } from '../hooks/useInactiveMembers';
import { LoadingSkeleton, EmptyState } from '../components/EmptyStates';
import { UserX, BellRing } from 'lucide-react';
import { Avatar } from '../../../../member/components/common/Avatar';
import { engagementNotificationService } from '../services/engagementNotificationService';

export const InactiveMembers = () => {
  const { inactiveMembers, isLoading, error } = useInactiveMembers();
  const [sendingId, setSendingId] = useState(null);

  const handleRemind = async (memberId) => {
    setSendingId(memberId);
    await engagementNotificationService.sendReminder('test-community', memberId, 'inactive_reminder', 'We miss you!');
    setSendingId(null);
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (error || !inactiveMembers?.length) return <EmptyState icon={UserX} title="No Inactive Members" message="Everyone is highly active!" />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800">Inactive Members</h3>
        <p className="text-sm text-gray-500">Members who haven't engaged recently</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[12px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Member</th>
                <th className="p-4">Days Inactive</th>
                <th className="p-4">Missed Events</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inactiveMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={member.name.charAt(0)} size="sm" imageUrl={member.avatar} />
                      <span className="font-bold text-[13px] text-gray-800">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-rose-50 text-rose-600">
                      {member.daysInactive} Days
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-600 text-[13px]">{member.missedEvents}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleRemind(member.id)}
                      disabled={sendingId === member.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-[12px] font-bold hover:bg-brand-secondary transition-colors disabled:opacity-50"
                    >
                      <BellRing size={14} />
                      {sendingId === member.id ? 'Sending...' : 'Send Reminder'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
