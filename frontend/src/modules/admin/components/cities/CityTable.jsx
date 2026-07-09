import React from 'react';
import { Eye, Edit, MapPin, Users, Activity, ToggleLeft, ToggleRight, MoreVertical } from 'lucide-react';

export const CityTable = ({ 
  cities, 
  onViewCity, 
  onEditCity, 
  onToggleStatus, 
  loading 
}) => {

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-text-muted font-medium">Loading Directory...</p>
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-muted mb-4">
          <MapPin size={32} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Cities Found</h3>
        <p className="text-sm text-text-muted text-center max-w-md">
          There are no cities matching your current filters or search query. Try adjusting your parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">City Info</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">State/Country</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Communities</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Members</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cities.map((city) => (
            <tr key={city.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold shadow-sm">
                    {city.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{city.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 tracking-wide uppercase font-semibold">Code: {city.code}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-700 font-medium">{city.state}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{city.country}</p>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-bold text-gray-700">
                  {city.communitiesCount}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700">
                  <Users size={14} className="text-gray-400" />
                  {city.membersCount.toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  city.status === 'Active' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {city.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 transition-opacity">
                  <button 
                    onClick={() => onToggleStatus(city)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-black transition-all border border-transparent shadow-sm"
                    title={city.status === 'Active' ? 'Disable City' : 'Enable City'}
                  >
                    {city.status === 'Active' ? <ToggleRight size={16} className="text-black" /> : <ToggleLeft size={16} className="text-black" />}
                  </button>
                  <button 
                    onClick={() => onEditCity(city)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-black transition-all border border-gray-300 shadow-sm"
                    title="Edit City"
                  >
                    <Edit size={16} className="text-black" />
                  </button>
                  <button 
                    onClick={() => onViewCity(city)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-black transition-all border border-gray-300 shadow-sm flex items-center gap-1.5 px-3"
                  >
                    <Eye size={16} className="text-black" /> <span className="text-[11px] font-bold uppercase text-black">View</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
