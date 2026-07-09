import React from 'react';
import { Plus, Tag, Trash2, StopCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const CouponManagement = ({ data }) => {
  const { coupons } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Coupon Management</h2>
          <p className="text-xs text-gray-400">Create and manage discount codes</p>
        </div>
        <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="card-neo overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Coupon Details</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Discount</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Usage</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Validity</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon, idx) => (
              <motion.tr 
                key={coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={14} className="text-brand-primary" />
                    <span className="text-sm font-black text-white tracking-wider font-mono bg-white/10 px-2 py-0.5 rounded">{coupon.code}</span>
                  </div>
                  <p className="text-xs text-gray-500">{coupon.name}</p>
                </td>
                <td className="p-4">
                  <span className="text-sm text-white font-bold">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase">{coupon.discountType}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[60px]">
                      <div className="h-full bg-brand-primary" style={{ width: `${(1 - (coupon.remainingUses / coupon.usageLimit)) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{coupon.usageLimit - coupon.remainingUses}/{coupon.usageLimit}</span>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-xs text-gray-300">Until {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                    coupon.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                  }`}>
                    {coupon.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Deactivate">
                      <StopCircle size={16} />
                    </button>
                    <button className="p-2 text-rose-500 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponManagement;
