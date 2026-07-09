import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Plus, CheckCircle2, MapPin, Clock, X, Users, ClipboardList, CheckSquare, Search, Info, IndianRupee, QrCode
} from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';

const TABS = [
  { id: 'planner', label: 'Events Planner', icon: Calendar },
  { id: 'bookings', label: 'Event Bookings', icon: ClipboardList },
  { id: 'checkins', label: 'Attendee Check-ins', icon: CheckSquare }
];

const EventBookingsView = () => {
  const bookings = [
    { id: 'EVB-402', user: 'Pradeep Rathore', resource: 'Main Community Hall A', date: 'Jul 15, 2026', purpose: 'Matrimonial Sammelan', amount: '₹15,000', status: 'Paid' },
    { id: 'EVB-401', user: 'Rakesh Namdev', resource: 'Mini Hall B', date: 'Jul 18, 2026', purpose: 'Community Meeting', amount: '₹5,000', status: 'Pending' },
    { id: 'EVB-400', user: 'Kamlesh Joshi', resource: 'Main Community Hall A', date: 'Jul 22, 2026', purpose: 'Cultural Youth Festival', amount: '₹12,000', status: 'Paid' },
    { id: 'EVB-399', user: 'Sunita Namdev', resource: 'Mini Hall B', date: 'Jul 28, 2026', purpose: 'Educational Awards ceremony', amount: '₹4,500', status: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Hall Requests', val: '48 Requests', color: 'border-purple-500/20 text-purple-600 bg-purple-500/5' },
          { label: 'Pending Approvals', val: '5 Pending', color: 'border-amber-500/20 text-amber-600 bg-amber-500/5' },
          { label: 'Revenue Generated', val: '₹84,500', color: 'border-brand-primary/20 text-brand-primary bg-brand-primary/5' },
          { label: 'Resource Utilization', val: '72% Capacity', color: 'border-blue-500/20 text-blue-600 bg-blue-500/5' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-between ${stat.color}`}>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-xl font-black mt-1">{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-black text-gray-900">Hall Reservation Logs</h3>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Search reservation..." className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-brand-primary transition-all w-40 text-gray-800" />
            <button className="px-3 py-1.5 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/95 transition-all shadow-sm">Search</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {['Reservation ID', 'Applicant', 'Hall / Venue', 'Event Date', 'Purpose', 'Booking Fee', 'Status'].map((h, i) => (
                  <th key={i} className="px-6 py-3.5 text-[10px] font-black uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-6 py-4 font-bold text-gray-900">{bk.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-[10px]">
                        {bk.user[0]}
                      </div>
                      <span className="font-semibold text-gray-800">{bk.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{bk.resource}</td>
                  <td className="px-6 py-4 text-gray-500">{bk.date}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{bk.purpose}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{bk.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      bk.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                      bk.status === 'Pending' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                    }`}>
                      {bk.status}
                    </span>
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

const AttendeeCheckinsView = () => {
  const [searchVal, setSearchVal] = useState('');
  const [checkedInList, setCheckedInList] = useState([
    { name: 'Vikash Namdev', ticket: 'TIC-98442', event: 'Annual Youth Sammelan', time: '10:02 AM', status: 'Approved' },
    { name: 'Jyoti Namdev', ticket: 'TIC-98445', event: 'Annual Youth Sammelan', time: '10:15 AM', status: 'Approved' },
    { name: 'Sanjay Namdev', ticket: 'TIC-98449', event: 'Annual Youth Sammelan', time: '10:24 AM', status: 'Approved' },
  ]);

  const handleManualCheckin = (e) => {
    e.preventDefault();
    if (!searchVal) return;
    const newAttendee = {
      name: searchVal,
      ticket: `TIC-${Math.floor(10000 + Math.random() * 90000)}`,
      event: 'Annual Youth Sammelan',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Approved'
    };
    setCheckedInList([newAttendee, ...checkedInList]);
    setSearchVal('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Checkin Console */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <QrCode size={16} className="text-brand-primary" />
            Check-In Verification Console
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Verify attendees by ticket codes or search registered names.</p>
        </div>

        <form onSubmit={handleManualCheckin} className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Enter attendee name or ticket code..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-brand-primary text-xs font-semibold text-gray-800"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-2xl hover:bg-brand-primary/95 transition-all shadow shadow-brand-primary/20">
            Check-In
          </button>
        </form>

        {/* Checked-in Logs */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Live Attendance Registry ({checkedInList.length} Checked-in)</h4>
          <div className="divide-y divide-gray-100 border border-gray-150 rounded-2xl overflow-hidden bg-gray-50/20">
            {checkedInList.map((chk, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 text-xs hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold text-gray-800">{chk.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{chk.ticket} • {chk.event}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">{chk.time}</p>
                  <span className="inline-block mt-1 text-[8px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-200/50">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Stats Dashboard */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-brand-primary" />
            Check-In Analytics
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Real-time attendance rates for active events.</p>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Total Registered', val: '148 Members', rate: 100, color: 'bg-purple-600' },
            { label: 'Checked-In Today', val: '42 Members', rate: 28, color: 'bg-emerald-500' },
            { label: 'No-Shows / Pending', val: '106 Members', rate: 72, color: 'bg-amber-400' },
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-800">
                <span>{stat.label}</span>
                <span>{stat.val}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.rate}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex gap-2">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 leading-normal font-medium">To run QR validation scan, launch the MeriSamaj Companion mobile app scanner and scan the attendee's ticket code.</p>
        </div>
      </div>
    </div>
  );
};

export const EventsDesk = () => {
  const { events, addEvent } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'planner';

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const [toast, setToast] = useState(null);
  const [activeModal, setActiveModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '', date: '', time: '', venue: '', description: '', category: 'General'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) {
      showToast('Please fill in required fields');
      return;
    }

    addEvent({
      title: form.title,
      date: new Date(form.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: form.time || '07:00 PM',
      venue: form.venue,
      description: form.description || 'Community official gathering.',
      category: form.category,
      attendees: 0,
      isRegistered: false
    });

    showToast(`Successfully created event: "${form.title}"!`);
    setForm({ title: '', date: '', time: '', venue: '', description: '', category: 'General' });
    setActiveModal(false);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* ─── TOAST ─── */}
      {toast && (
        <div className="fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 backdrop-blur-md">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold tracking-wide">{toast}</span>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 pt-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Calendar size={24} />
            </div>
            Community Events Planner
          </h2>
          <p className="text-sm text-gray-500 mt-1">Organize celebrations, manage RSVP tallies, and check-in attendees.</p>
        </div>
        <button 
          onClick={() => setActiveModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2 shadow-lg shadow-brand-primary/25"
        >
          <Plus size={14} /> Schedule Event
        </button>
      </section>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200">
        <div className="flex space-x-1 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-xl transition-all relative ${
                  isActive 
                    ? 'text-brand-primary font-black' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-primary' : ''} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="eventsTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'planner' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white border border-gray-250 p-5 rounded-2xl flex flex-col justify-between hover:border-purple-500/20 transition-all space-y-4 shadow-sm">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-brand-primary text-white">
                          {event.category || 'General'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 flex items-center gap-1"><Users size={10} /> {event.attendees || 0} RSVPs</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-800 mt-3 leading-tight">{event.title}</h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1"><MapPin size={11} /> {event.venue}</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1"><Clock size={11} /> {event.date} • {event.time || '07:00 PM'}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <button onClick={() => { setActiveTab('checkins'); }} className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-gray-200">
                        Manage Check-Ins
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'bookings' && <EventBookingsView />}

            {activeTab === 'checkins' && <AttendeeCheckinsView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── BALLOT SETUP MODAL ─── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(false)} />
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-md font-black text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-brand-primary" />
                Schedule Community Celebration
              </h3>
              <button onClick={() => setActiveModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-800 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Event Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Annual Gathering" 
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Event Date *</label>
                  <input 
                    type="date" 
                    required
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 07:00 PM" 
                    value={form.time}
                    onChange={(e) => setForm({...form, time: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Venue Location *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Community Hall, Indore" 
                  value={form.venue}
                  onChange={(e) => setForm({...form, venue: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-250 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Event Category</label>
                <select 
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs text-gray-850"
                >
                  <option value="General">General Gatherings</option>
                  <option value="Festival">Festival & Prayer</option>
                  <option value="Youth">Youth Careers & Seminars</option>
                  <option value="Education">Education Awards</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale"
              >
                Launch Event
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventsDesk;
