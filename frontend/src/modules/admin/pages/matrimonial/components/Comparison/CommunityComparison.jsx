import React from 'react';

export const CommunityComparison = ({ data }) => {
  const { profiles = [] } = data;

  // Build community breakdown from profiles
  const commMap = {};
  profiles.forEach(p => {
    const name = p.personal?.community || 'Unknown';
    if (!commMap[name]) commMap[name] = { count: 0, male: 0, female: 0, active: 0 };
    commMap[name].count++;
    if (p.personal?.gender === 'male') commMap[name].male++;
    if (p.personal?.gender === 'female') commMap[name].female++;
    if (p.status === 'active') commMap[name].active++;
  });

  const rows = Object.entries(commMap).sort((a, b) => b[1].count - a[1].count).slice(0, 15);
  const maxCount = rows[0]?.[1].count || 1;

  if (rows.length === 0) {
    return <div className="card-neo p-12 text-center text-gray-600 font-semibold">No community data yet.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-black text-white">Community Breakdown</h3>
      <div className="card-neo overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Community', 'Total', 'Male', 'Female', 'Active', 'Distribution'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, stats]) => (
              <tr key={name} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 font-bold text-white text-sm">{name}</td>
                <td className="px-4 py-3 text-gray-300 font-semibold">{stats.count}</td>
                <td className="px-4 py-3 text-blue-400 font-semibold">{stats.male}</td>
                <td className="px-4 py-3 text-pink-400 font-semibold">{stats.female}</td>
                <td className="px-4 py-3 text-emerald-400 font-semibold">{stats.active}</td>
                <td className="px-4 py-3 w-32">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(stats.count / maxCount) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommunityComparison;
