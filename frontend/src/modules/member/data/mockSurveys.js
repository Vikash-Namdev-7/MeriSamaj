// Mock data for Community Surveys and Polls module
// Separate from Elections — these are opinion polls, feedback forms, surveys.
// API-ready: replace mockSurveys with API response in production.

export const mockSurveys = [
  {
    id: 'sv1',
    title: 'Samaj Bhawan Renovation Preference Survey',
    titleHi: 'समाज भवन नवीनीकरण प्राथमिकता सर्वे',
    description: 'Help us decide how to prioritize the Samaj Bhawan renovation budget for 2026.',
    descriptionHi: 'वर्ष 2026 के समाज भवन नवीनीकरण बजट को प्राथमिकता देने में हमारी मदद करें।',
    category: 'Infrastructure',
    categoryHi: 'अवसंरचना',
    status: 'active',
    totalResponses: 124,
    deadline: 'Jul 10, 2026',
    deadlineHi: '10 जुलाई 2026',
    createdBy: 'Samaj Administration',
    banner: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    questions: [
      {
        id: 'sv1q1',
        type: 'single',
        question: 'Which area needs immediate renovation?',
        questionHi: 'कौन से क्षेत्र को तत्काल नवीनीकरण की आवश्यकता है?',
        required: true,
        options: [
          { id: 'o1', label: 'Main Hall', labelHi: 'मुख्य हॉल' },
          { id: 'o2', label: 'Kitchen and Dining', labelHi: 'रसोई और भोजन क्षेत्र' },
          { id: 'o3', label: 'Parking Area', labelHi: 'पार्किंग क्षेत्र' },
          { id: 'o4', label: 'Restrooms', labelHi: 'शौचालय सुविधाएं' }
        ]
      },
      {
        id: 'sv1q2',
        type: 'multi',
        question: 'Which new facilities should be added?',
        questionHi: 'कौन सी नई सुविधाएं जोड़ी जानी चाहिए?',
        required: false,
        options: [
          { id: 'o1', label: 'AC and Heating System', labelHi: 'AC और हीटिंग सिस्टम' },
          { id: 'o2', label: 'Digital Projector', labelHi: 'डिजिटल प्रोजेक्टर' },
          { id: 'o3', label: 'Gym Room', labelHi: 'जिम कमरा' },
          { id: 'o4', label: 'Library Corner', labelHi: 'पुस्तकालय कोना' },
          { id: 'o5', label: 'CCTV Security', labelHi: 'सीसीटीवी सुरक्षा' }
        ]
      },
      {
        id: 'sv1q3',
        type: 'rating',
        question: 'Rate the current condition of Samaj Bhawan (1-5)',
        questionHi: 'समाज भवन की मौजूदा स्थिति को रेट करें (1-5)',
        required: true,
        maxRating: 5
      },
      {
        id: 'sv1q4',
        type: 'text',
        question: 'Any other suggestions or specific needs?',
        questionHi: 'कोई अन्य सुझाव या विशिष्ट आवश्यकताएं?',
        required: false,
        placeholder: 'Share your thoughts...'
      }
    ]
  },
  {
    id: 'sv2',
    title: 'Annual Mahotsav Feedback',
    titleHi: 'वार्षिक महोत्सव प्रतिक्रिया',
    description: 'We want to hear your experience at the Annual Mahotsav 2025 to make 2026 even better!',
    descriptionHi: 'वार्षिक महोत्सव 2025 में आपके अनुभव के बारे में सुनना चाहते हैं ताकि 2026 और बेहतर हो!',
    category: 'Events',
    categoryHi: 'कार्यक्रम',
    status: 'active',
    totalResponses: 87,
    deadline: 'Jul 5, 2026',
    deadlineHi: '5 जुलाई 2026',
    createdBy: 'Events Committee',
    banner: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    questions: [
      {
        id: 'sv2q1',
        type: 'rating',
        question: 'Overall satisfaction with the event (1-5)',
        questionHi: 'कार्यक्रम से समग्र संतुष्टि (1-5)',
        required: true,
        maxRating: 5
      },
      {
        id: 'sv2q2',
        type: 'single',
        question: 'What was the best part of the Mahotsav?',
        questionHi: 'महोत्सव का सबसे अच्छा हिस्सा क्या था?',
        required: true,
        options: [
          { id: 'o1', label: 'Cultural Programs', labelHi: 'सांस्कृतिक कार्यक्रम' },
          { id: 'o2', label: 'Award Ceremony', labelHi: 'पुरस्कार समारोह' },
          { id: 'o3', label: 'Community Feast', labelHi: 'सामूहिक भोज' },
          { id: 'o4', label: 'Networking with Members', labelHi: 'सदस्यों से मुलाकात' }
        ]
      },
      {
        id: 'sv2q3',
        type: 'multi',
        question: 'What improvements would you suggest?',
        questionHi: 'आप क्या सुधार सुझाएंगे?',
        required: false,
        options: [
          { id: 'o1', label: 'Better Food Variety', labelHi: 'बेहतर खाने की विविधता' },
          { id: 'o2', label: 'Longer Duration', labelHi: 'लंबी अवधि' },
          { id: 'o3', label: 'More Cultural Programs', labelHi: 'अधिक सांस्कृतिक कार्यक्रम' },
          { id: 'o4', label: 'Better Venue Facilities', labelHi: 'बेहतर स्थल सुविधाएं' },
          { id: 'o5', label: 'Kids Activities', labelHi: 'बच्चों की गतिविधियां' }
        ]
      },
      {
        id: 'sv2q4',
        type: 'text',
        question: 'Any specific message for the organizing committee?',
        questionHi: 'आयोजन समिति के लिए कोई विशेष संदेश?',
        required: false,
        placeholder: 'Write your message here...'
      }
    ]
  },
  {
    id: 'sv3',
    title: 'Monthly Community Opinion Poll',
    titleHi: 'मासिक सामुदायिक राय पोल',
    description: 'Quick monthly poll to gauge community sentiment on current affairs.',
    descriptionHi: 'वर्तमान मामलों पर समुदाय की भावना जानने के लिए त्वरित मासिक पोल।',
    category: 'Opinion',
    categoryHi: 'राय',
    status: 'active',
    totalResponses: 212,
    deadline: 'Jun 30, 2026',
    deadlineHi: '30 जून 2026',
    createdBy: 'Samaj Committee',
    banner: null,
    questions: [
      {
        id: 'sv3q1',
        type: 'single',
        question: 'Should we increase Samaj annual membership fee?',
        questionHi: 'क्या हमें समाज वार्षिक सदस्यता शुल्क बढ़ाना चाहिए?',
        required: true,
        options: [
          { id: 'o1', label: 'Yes, definitely', labelHi: 'हां, जरूर' },
          { id: 'o2', label: 'No, keep it same', labelHi: 'नहीं, वही रखें' },
          { id: 'o3', label: 'Yes, but only slightly', labelHi: 'हां, लेकिन थोड़ा ही' },
          { id: 'o4', label: 'Need more discussion', labelHi: 'और चर्चा की जरूरत' }
        ]
      }
    ]
  },
  {
    id: 'sv4',
    title: 'Youth Career and Education Survey',
    titleHi: 'युवा करियर और शिक्षा सर्वे',
    description: 'Help us understand the career challenges of our youth to design better programs.',
    descriptionHi: 'बेहतर कार्यक्रम डिजाइन करने के लिए हमारे युवाओं की करियर चुनौतियां समझने में मदद करें।',
    category: 'Youth',
    categoryHi: 'युवा',
    status: 'closed',
    totalResponses: 341,
    deadline: 'Jun 15, 2026',
    deadlineHi: '15 जून 2026',
    createdBy: 'Youth Committee',
    banner: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    questions: [
      {
        id: 'sv4q1',
        type: 'single',
        question: 'What is your current career status?',
        questionHi: 'आपकी वर्तमान करियर स्थिति क्या है?',
        required: true,
        options: [
          { id: 'o1', label: 'Student', labelHi: 'छात्र' },
          { id: 'o2', label: 'Employed', labelHi: 'नौकरीपेशा' },
          { id: 'o3', label: 'Self-employed', labelHi: 'स्व-रोजगार' },
          { id: 'o4', label: 'Seeking opportunities', labelHi: 'अवसर खोज रहा हूं' }
        ]
      },
      {
        id: 'sv4q2',
        type: 'multi',
        question: 'Which support would help you most?',
        questionHi: 'कौन सी मदद आपके सबसे काम आएगी?',
        required: false,
        options: [
          { id: 'o1', label: 'Career Counselling Sessions', labelHi: 'करियर परामर्श सत्र' },
          { id: 'o2', label: 'Skill Development Workshops', labelHi: 'कौशल विकास कार्यशाला' },
          { id: 'o3', label: 'Internship Opportunities', labelHi: 'इंटर्नशिप अवसर' },
          { id: 'o4', label: 'Scholarship Assistance', labelHi: 'छात्रवृत्ति सहायता' }
        ]
      }
    ]
  }
];
