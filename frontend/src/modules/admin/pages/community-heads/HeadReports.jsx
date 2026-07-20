import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, Download, Filter } from 'lucide-react';

const HeadReports = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold mb-2">
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BarChart2 className="text-brand-primary" /> Administrative Reports
          </h1>
          <p className="text-sm text-gray-500">Analytics and reporting for Community Head activities and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart2 size={32} className="text-brand-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Reports Module in Development</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We are currently building comprehensive analytics for community heads, which will include community growth metrics, administrative efficiency, and engagement scorecards.
        </p>
      </div>
    </div>
  );
};

export default HeadReports;
