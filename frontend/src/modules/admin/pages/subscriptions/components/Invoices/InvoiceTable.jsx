import React from 'react';
import { Download, Printer, Search, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const InvoiceTable = ({ data }) => {
  const { invoices } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by invoice number or community..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      <div className="card-neo overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice ID</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Community</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, idx) => (
                <motion.tr 
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-500" />
                      <span className="text-sm font-bold text-white">{invoice.id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-white">{invoice.communityName}</p>
                    <p className="text-xs text-gray-500">{invoice.planName}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-white">₹{invoice.amount.toLocaleString()}</span>
                    <p className="text-[10px] text-gray-500">{invoice.gateway}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                      invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                      invoice.status === 'failed' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-300">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-brand-primary hover:text-white hover:bg-brand-primary/20 rounded-lg transition-colors" title="Download">
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Print">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTable;
