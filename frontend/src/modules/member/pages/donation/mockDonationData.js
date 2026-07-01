// English Mock Data for the Donation Module matching reference screens

export const donationInstructions = [
  {
    id: 1,
    step: "1",
    title: "Select Purpose",
    desc: "Choose the purpose for which you want to contribute",
  },
  {
    id: 2,
    step: "2",
    title: "Select Amount",
    desc: "Choose an amount according to your convenience or enter a custom amount",
  },
  {
    id: 3,
    step: "3",
    title: "Donation Type",
    desc: "Choose one-time donation or regular (monthly/yearly) contribution",
  },
  {
    id: 4,
    step: "4",
    title: "Make Payment",
    desc: "Complete a secure payment using your preferred payment method",
  },
  {
    id: 5,
    step: "5",
    title: "Receive Receipt",
    desc: "After payment, you will receive a receipt and a thank you message",
  },
  {
    id: 6,
    step: "6",
    title: "Use of Contribution",
    desc: "Your contribution will be used for the development of the society",
  },
];

export const donationGuidelines = [
  {
    id: "g1",
    title: "Show goal and progress for each purpose",
    desc: "Donors are shown the total goal and current collected amount details to track the progress of their money."
  },
  {
    id: "g2",
    title: "All transactions are completely transparent",
    desc: "Every donation is audited and included in the general assembly reports of the society."
  },
  {
    id: "g3",
    title: "Proper utilization of donation ensured",
    desc: "All funds are reserved only for designated goals. They cannot be used for any other purpose."
  },
  {
    id: "g4",
    title: "Share regular updates and reports",
    desc: "Monthly reports on project progress and utilization are shared with all society members."
  }
];

export const topDonors = [
  { id: "td1", name: "Rakesh Sharma", amount: 25000, initials: "RS" },
  { id: "td2", name: "Suresh Yadav", amount: 21000, initials: "SY" },
  { id: "td3", name: "Manish Gupta", amount: 15500, initials: "MG" },
  { id: "td4", name: "Ajay Singh", amount: 11000, initials: "AS" },
  { id: "td5", name: "Vinod Kumar", amount: 7500, initials: "VK" },
  { id: "td6", name: "Sunita Agarwal", amount: 5000, initials: "SA" },
  { id: "td7", name: "Pankaj Jain", amount: 3500, initials: "PJ" },
  { id: "td8", name: "Rohit Verma", amount: 2100, initials: "RV" }
];

export const impactStats = [
  { id: "st1", label: "Total Contributors", value: "1500+" },
  { id: "st2", label: "Total Donated Amount", value: "₹25,00,000+" },
  { id: "st3", label: "Completed Purposes", value: "12+" },
  { id: "st4", label: "People Benefited", value: "5000+" }
];

export const initialPurposes = [
  {
    id: "p1",
    title: "Samaj Bhavan Construction",
    raised: 875000,
    target: 1500000,
    percentage: 58,
    desc: "Contribution for the construction of a grand society building and auditorium.",
    city: "Indore"
  },
  {
    id: "p2",
    title: "Education Support Fund",
    raised: 325000,
    target: 1000000,
    percentage: 32,
    desc: "Scholarships for poor and meritorious students for higher education and coaching.",
    city: "Indore"
  },
  {
    id: "p3",
    title: "Health Camp Organization",
    raised: 145000,
    target: 500000,
    percentage: 29,
    desc: "Free medical check-ups, health tests, and medicine distribution camps.",
    city: "Bhopal"
  },
  {
    id: "p4",
    title: "Poor Girls Marriage Support",
    raised: 210000,
    target: 700000,
    percentage: 30,
    desc: "Financial support and gift items for the marriage of needy girls in the society.",
    city: "Jaipur"
  }
];

export const recentDonors = {
  "p1": [
    { id: "rd1", name: "Amit Kumar", amount: 5100, date: "2026-06-30T10:00:00Z", initials: "AK" },
    { id: "rd2", name: "Pooja Sharma", amount: 2100, date: "2026-06-29T14:30:00Z", initials: "PS" },
    { id: "rd3", name: "Vikas Singh", amount: 11000, date: "2026-06-28T09:15:00Z", initials: "VS" },
    { id: "rd4", name: "Neha Gupta", amount: 1000, date: "2026-06-27T16:45:00Z", initials: "NG" },
    { id: "rd5", name: "Ravi Patel", amount: 500, date: "2026-06-26T11:20:00Z", initials: "RP" }
  ],
  "p2": [
    { id: "rd6", name: "Sunil Yadav", amount: 2500, date: "2026-06-30T09:00:00Z", initials: "SY" },
    { id: "rd7", name: "Priya Jain", amount: 5100, date: "2026-06-28T10:30:00Z", initials: "PJ" },
    { id: "rd8", name: "Sandeep Verma", amount: 1100, date: "2026-06-25T14:15:00Z", initials: "SV" }
  ],
  "p3": [
    { id: "rd9", name: "Dr. Ramesh", amount: 11000, date: "2026-06-29T11:00:00Z", initials: "DR" },
    { id: "rd10", name: "Savita Chauhan", amount: 2100, date: "2026-06-27T13:45:00Z", initials: "SC" }
  ],
  "p4": [
    { id: "rd11", name: "Anjali Rathore", amount: 5000, date: "2026-06-30T08:30:00Z", initials: "AR" },
    { id: "rd12", name: "Kamlesh Kumar", amount: 2100, date: "2026-06-29T16:00:00Z", initials: "KK" },
    { id: "rd13", name: "Manisha Patel", amount: 11000, date: "2026-06-28T12:00:00Z", initials: "MP" }
  ]
};

export const initialDonationHistory = [
  {
    id: "h1",
    purposeId: "p1",
    purposeTitle: "Samaj Bhavan Construction",
    amount: 500,
    type: "One-time",
    date: "20 May 2024",
    time: "10:30 AM",
    txnId: "TXN1234567890"
  },
  {
    id: "h2",
    purposeId: "p2",
    purposeTitle: "Education Support Fund",
    amount: 1100,
    type: "One-time",
    date: "15 May 2024",
    time: "09:15 AM",
    txnId: "TXN5076543210"
  },
  {
    id: "h3",
    purposeId: "p3",
    purposeTitle: "Health Camp Organization",
    amount: 251,
    type: "One-time",
    date: "10 May 2024",
    time: "11:45 AM",
    txnId: "TXN4567091230"
  }
];
