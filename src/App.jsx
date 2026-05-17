/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  RotateCcw, 
  BookOpen, 
  Calendar, 
  ScrollText, 
  Anchor,
  CheckCircle2,
  Users,
  Compass,
  Zap,
  Mountain,
  ShieldAlert,
  CloudSun,
  Globe,
  BarChart3,
  Loader2,
  User,
  Hourglass,
  Building,
  MessageCircle,
  Share2,
  Send
} from 'lucide-react';

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);  }
} catch (e) {
  console.warn("Firebase not initialized. Running in local fallback mode.");
}
const appId = typeof __app_id !== 'undefined' ? __app_id : 'adventist-pulse-app';

const SDA_DIVISIONS = [
  "East-Central Africa Division (ECD)",
  "Euro-Asia Division (ESD)",
  "Inter-American Division (IAD)",
  "Inter-European Division (EUD)",
  "North American Division (NAD)",
  "Northern Asia-Pacific Division (NSD)",
  "South American Division (SAD)",
  "South Pacific Division (SPD)",
  "Southern Africa-Indian Ocean Division (SID)",
  "Southern Asia Division (SUD)",
  "Southern Asia-Pacific Division (SSD)",
  "Trans-European Division (TED)",
  "West-Central Africa Division (WAD)",
  "Middle East and North Africa Union (MENA)"
];

const AGES = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const GENDERS = ['Male', 'Female', 'Prefer not to say'];
const ATTENDANCE = ['Weekly', 'Monthly', 'Yearly', 'Rarely'];

const ADVENTIST_PILLARS = [
  {
    id: 'trinity',
    category: 'Shared Foundation',
    title: 'The Nature of God',
    icon: <Zap className="w-6 h-6" />,
    question: 'How do you view the Trinity?',
    options: [
      { label: 'Ontological Trinity', description: 'Three co-eternal, co-equal persons in one Godhead (Classic Orthodoxy).', type: 'Traditionalist', keyword: 'Trinitarian' },
      { label: 'Social Trinity', description: 'Emphasis on the loving relationship and distinct personalities of the three.', type: 'Mainstream', keyword: 'Social Trinitarian' },
      { label: 'Functional/Evolving', description: 'The Trinity is a helpful model, but we should be open to diverse interpretations.', type: 'Progressive', keyword: 'Open Trinitarian' },
      { label: 'Non-Trinitarian Roots', description: 'Re-evaluating early Adventist semi-Arian views or the Spirit’s personhood.', type: 'Liberal', keyword: 'Non-Trinitarian' }
    ]
  },
  {
    id: 'creation',
    category: 'Shared Foundation',
    title: 'Origins & Creation',
    icon: <Mountain className="w-6 h-6" />,
    question: 'How do you interpret the Creation account in Genesis?',
    options: [
      { label: 'Literal 6-Day', description: 'God created the world in six literal 24-hour days a few thousand years ago.', type: 'Traditionalist', keyword: 'Young-Earth Creationist' },
      { label: 'Historical/Recent', description: 'Creation was recent and literal, but allowing for some scientific nuance.', type: 'Mainstream', keyword: 'Literal Creationist' },
      { label: 'Progressive/Old Earth', description: 'The "days" represent long periods; God used natural processes over time.', type: 'Progressive', keyword: 'Old-Earth Creationist' },
      { label: 'Theistic Evolution', description: 'Evolution is the method God used; Genesis is symbolic/poetic.', type: 'Liberal', keyword: 'Evolutionary Theist' }
    ]
  },
  {
    id: 'salvation',
    category: 'Shared Foundation',
    title: 'Salvation & Grace',
    icon: <CloudSun className="w-6 h-6" />,
    question: 'What is the relationship between Faith and Works?',
    options: [
      { label: 'Conditional/Sanctified', description: 'Grace saves us, but character perfection is required for the final judgment.', type: 'Traditionalist', keyword: 'Last Generation Theology-oriented' },
      { label: 'Balanced/1888', description: 'Salvation is by faith alone, which naturally produces a life of obedience.', type: 'Mainstream', keyword: '1888-Message Centered' },
      { label: 'Radical Grace', description: 'Absolute assurance in Christ’s finished work; works are purely a response.', type: 'Progressive', keyword: 'Evangelical Grace-oriented' },
      { label: 'Universal/Inclusive', description: 'Christ’s love eventually draws all to Himself, regardless of performance.', type: 'Liberal', keyword: 'Universalist-leaning' }
    ]
  },
  {
    id: 'death',
    category: 'Shared Foundation',
    title: 'State of the Dead',
    icon: <ShieldAlert className="w-6 h-6" />,
    question: 'What happens to a person when they die?',
    options: [
      { label: 'Soul Sleep/Unconscious', description: 'Death is a dreamless sleep until the resurrection at the second coming.', type: 'Traditionalist', keyword: 'Mortalist' },
      { label: 'Conditional Immortality', description: 'Immortality is a gift given only to believers at the end.', type: 'Mainstream', keyword: 'Annihilationist' },
      { label: 'Spiritual Existence', description: 'While sleeping, the spirit has a unique connection to God that transcends biology.', type: 'Progressive', keyword: 'Modified Mortalist' },
      { label: 'Conscious/Traditional', description: 'The soul or spirit returns to God immediately upon death.', type: 'Liberal', keyword: 'Dualist' }
    ]
  },
  {
    id: 'bible',
    category: 'Shared Foundation',
    title: 'Authority of the Bible',
    icon: <BookOpen className="w-6 h-6" />,
    question: 'How do you view the inspiration and authority of the Bible?',
    options: [
      { label: 'Verbal / Inerrant', description: 'The Holy Spirit dictated the exact words. The Bible is completely inerrant in science, history, and theology.', type: 'Traditionalist', keyword: 'Verbal Inerrantist' },
      { label: 'Thought Inspiration', description: 'God inspired the writers\' thoughts, not their exact words. It is an infallible, trustworthy guide for salvation.', type: 'Mainstream', keyword: 'Thought Inspirationist' },
      { label: 'Progressive / Contextual', description: 'Inspired but deeply shaped by its ancient context. Certain cultural mandates may not apply today.', type: 'Progressive', keyword: 'Contextualist' },
      { label: 'Literary / Spiritual', description: 'A valuable human record of spiritual journeys rather than a supernatural, uniquely authoritative rulebook.', type: 'Liberal', keyword: 'Literary Reader' }
    ]
  },
  {
    id: 'inspiration',
    category: 'Adventist Distinctive',
    title: 'Spirit of Prophecy',
    icon: <ScrollText className="w-6 h-6" />,
    question: 'How do you view the writings of Ellen G. White?',
    options: [
      { label: 'Canonical/Verbal', description: 'Infallible authority on par with the Bible for doctrine.', type: 'Traditionalist', keyword: 'Traditionalist/Verbal Inspirationist' },
      { label: 'Prophetic/Testing', description: 'Inspired "lesser light" meant to lead to the Bible; authoritative but not inerrant.', type: 'Mainstream', keyword: 'Classical Adventist' },
      { label: 'Historical/Pastoral', description: 'Valuable devotional resource, but not doctrinally binding or error-free.', type: 'Progressive', keyword: 'Progressive/Historical' },
      { label: 'Cultural/Literary', description: 'Significant heritage, but not viewed as uniquely prophetic in a supernatural sense.', type: 'Liberal', keyword: 'Cultural Adventist' }
    ]
  },
  {
    id: 'sanctuary',
    category: 'Adventist Distinctive',
    title: 'Investigative Judgment',
    icon: <Anchor className="w-6 h-6" />,
    question: 'What is your stance on 1844 and the Sanctuary?',
    options: [
      { label: 'Classic 1844', description: 'Christ entered the Most Holy Place in 1844 for a literal investigative judgment.', type: 'Traditionalist', keyword: 'Sanctuary Traditionalist' },
      { label: 'Redemptive/Symbolic', description: '1844 marks a shift in Christ’s ministry focusing on the certainty of judgment.', type: 'Mainstream', keyword: 'Modified Traditionalist' },
      { label: 'Evangelical/New Covenant', description: 'Christ’s work was finished at the Cross; 1844 is for identity, not status change.', type: 'Progressive', keyword: 'Evangelical Adventist' },
      { label: 'Historical Error', description: 'The doctrine was a "face-saving" measure with little biblical basis.', type: 'Liberal', keyword: 'Revisionist' }
    ]
  },
  {
    id: 'sabbath',
    category: 'Adventist Distinctive',
    title: 'The Sabbath & The Seal',
    icon: <Calendar className="w-6 h-6" />,
    question: 'How does the Sabbath function in your theology?',
    options: [
      { label: 'Final Test/Seal', description: 'The Sabbath is the final test of loyalty and the definitive Seal of God.', type: 'Traditionalist', keyword: 'Sabbatarian Apologist' },
      { label: 'Sign of Allegiance', description: 'A vital sign of relationship and a unique mark of the Remnant church.', type: 'Mainstream', keyword: 'Classic Sabbatarian' },
      { label: 'Day of Rest/Rhythm', description: 'A beautiful gift of rest, but not a salvific "test" or exclusive "seal".', type: 'Progressive', keyword: 'Progressive Sabbatarian' },
      { label: 'Non-Legalistic/Universal', description: 'The "rest" in Christ is more important than the specific day.', type: 'Liberal', keyword: 'Grace-centered Sabbatarian' }
    ]
  },
  {
    id: 'remnant',
    category: 'Adventist Distinctive',
    title: 'The Remnant Identity',
    icon: <Users className="w-6 h-6" />,
    question: 'How do you define the "Remnant Church"?',
    options: [
      { label: 'Exclusive/Denominational', description: 'The SDA Church is the one and only true Remnant organization of prophecy.', type: 'Traditionalist', keyword: 'SDA-Exclusive' },
      { label: 'Functional/Missionary', description: 'The SDA Church has a unique message, but God has sheep in other folds.', type: 'Mainstream', keyword: 'Classical Remnant' },
      { label: 'Invisible/Spiritual', description: 'The Remnant consists of all faithful believers across all traditions.', type: 'Progressive', keyword: 'Ecumenical Remnant' },
      { label: 'Cultural/Evolutionary', description: 'Adventism is one branch of the tree, not a unique prophetic entity.', type: 'Liberal', keyword: 'Post-Remnant' }
    ]
  }
];

const MOCK_PULSES = [
  { selections: { trinity: 'Mainstream', creation: 'Traditionalist', salvation: 'Mainstream', death: 'Traditionalist', bible: 'Mainstream', inspiration: 'Mainstream', sanctuary: 'Mainstream', sabbath: 'Traditionalist', remnant: 'Mainstream' } },
  { selections: { trinity: 'Traditionalist', creation: 'Traditionalist', salvation: 'Traditionalist', death: 'Traditionalist', bible: 'Traditionalist', inspiration: 'Traditionalist', sanctuary: 'Traditionalist', sabbath: 'Traditionalist', remnant: 'Traditionalist' } },
  { selections: { trinity: 'Progressive', creation: 'Mainstream', salvation: 'Progressive', death: 'Progressive', bible: 'Progressive', inspiration: 'Progressive', sanctuary: 'Progressive', sabbath: 'Progressive', remnant: 'Progressive' } },
  { selections: { trinity: 'Mainstream', creation: 'Progressive', salvation: 'Mainstream', death: 'Traditionalist', bible: 'Mainstream', inspiration: 'Mainstream', sanctuary: 'Mainstream', sabbath: 'Mainstream', remnant: 'Mainstream' } },
  { selections: { trinity: 'Traditionalist', creation: 'Traditionalist', salvation: 'Traditionalist', death: 'Traditionalist', bible: 'Traditionalist', inspiration: 'Traditionalist', sanctuary: 'Traditionalist', sabbath: 'Traditionalist', remnant: 'Traditionalist' } },
  { selections: { trinity: 'Progressive', creation: 'Progressive', salvation: 'Progressive', death: 'Progressive', bible: 'Progressive', inspiration: 'Progressive', sanctuary: 'Progressive', sabbath: 'Progressive', remnant: 'Progressive' } },
  { selections: { trinity: 'Liberal', creation: 'Liberal', salvation: 'Liberal', death: 'Liberal', bible: 'Liberal', inspiration: 'Liberal', sanctuary: 'Liberal', sabbath: 'Liberal', remnant: 'Liberal' } },
];

const MOCK_COMMENTS = [
  { id: '1', text: "It's fascinating to see how geographically diverse our theological approaches are becoming.", lean: "Mainstream", timestamp: { toMillis: () => Date.now() - 86400000 } },
  { id: '2', text: "I believe returning to our historic roots is exactly what the church needs right now.", lean: "Traditionalist", timestamp: { toMillis: () => Date.now() - 172800000 } },
  { id: '3', text: "We need to ensure our grace theology is as robust as our Sabbath theology.", lean: "Progressive", timestamp: { toMillis: () => Date.now() - 3600000 } }
];

const App = () => {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(-4);
  const [division, setDivision] = useState('');
  const [age, setAge] = useState(null);
  const [gender, setGender] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [selections, setSelections] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Community Data
  const [communityData, setCommunityData] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Computed state for UI logic
  const isProfileComplete = Object.keys(selections).length === ADVENTIST_PILLARS.length;

  // (1) Auth Setup
  useEffect(() => {
    if (!auth) {
      setIsLocalMode(true);
      return;
    }
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Auth failed, falling back to local mode.", err);
        setIsLocalMode(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // (2) Fetch Global Community Data
  useEffect(() => {
    if (isLocalMode) {
      setCommunityData(MOCK_PULSES);
      setComments(MOCK_COMMENTS);
      return;
    }
    if (!user || !db) return;
    
    let unsubscribePulses = () => {};
    let unsubscribeComments = () => {};

    try {
      const pulsesCol = collection(db, 'artifacts', appId, 'public', 'data', 'pulses');
      unsubscribePulses = onSnapshot(pulsesCol, (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        setCommunityData(data);
      }, (error) => {
        console.warn("Firestore error (pulses). Falling back to mock data.", error);
        setIsLocalMode(true);
        setCommunityData(MOCK_PULSES);
      });
      
      const commentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'pulse_comments');
      unsubscribeComments = onSnapshot(commentsCol, (snapshot) => {
        const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        data.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
        setComments(data);
      }, (error) => {
        console.warn("Firestore error (comments). Falling back to mock data.", error);
        setIsLocalMode(true);
        setComments(MOCK_COMMENTS);
      });
    } catch(e) {
      setIsLocalMode(true);
      setCommunityData(MOCK_PULSES);
      setComments(MOCK_COMMENTS);
    }

    return () => {
      unsubscribePulses();
      unsubscribeComments();
    };
  }, [user, isLocalMode]);

  const handleSelect = (pillarId, option) => {
    setSelections(prev => ({ ...prev, [pillarId]: option }));
  };

  const skipToStats = () => {
    setIsFinished(true);
    setActiveTab('stats');
  };

  const savePulseToCloud = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    const payload = {
      division: division,
      age: age,
      gender: gender,
      attendance: attendance,
      selections: Object.keys(selections).reduce((acc, key) => {
        acc[key] = selections[key].type;
        return acc;
      }, {}),
      timestamp: db ? serverTimestamp() : new Date(),
    };

    if (isLocalMode || !db || !user) {
      setCommunityData(prev => [...prev, payload]);
      setTimeout(() => {
        setIsSaving(false);
        setIsFinished(true);
        setActiveTab('profile');
      }, 800);
      return;
    }
    
    try {
      const pulsesCol = collection(db, 'artifacts', appId, 'public', 'data', 'pulses');
      await addDoc(pulsesCol, payload);
    } catch (e) {
      console.warn("Error saving pulse to cloud. Adding locally.", e);
      setCommunityData(prev => [...prev, payload]);
    } finally {
      setIsSaving(false);
      setIsFinished(true);
      setActiveTab('profile');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || isPostingComment) return;
    setIsPostingComment(true);
    
    const commentPayload = {
       text: newComment.trim(),
       userId: user ? user.uid : 'local-user',
       lean: isProfileComplete ? calculateLean() : 'Observer',
       timestamp: db ? serverTimestamp() : { toMillis: () => Date.now() }
    };

    if (isLocalMode || !db || !user) {
       setComments(prev => [{...commentPayload, id: Math.random().toString()}, ...prev]);
       setNewComment('');
       setIsPostingComment(false);
       return;
    }

    try {
      const commentsCol = collection(db, 'artifacts', appId, 'public', 'data', 'pulse_comments');
      await addDoc(commentsCol, commentPayload);
      setNewComment('');
    } catch (e) {
      console.warn("Error posting comment. Adding locally.", e);
      setComments(prev => [{...commentPayload, id: Math.random().toString(), timestamp: { toMillis: () => Date.now() }}, ...prev]);
      setNewComment('');
    } finally {
      setIsPostingComment(false);
    }
  };

  const nextStep = () => {
    if (step < ADVENTIST_PILLARS.length - 1) {
      setStep(step + 1);
    } else {
      savePulseToCloud();
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const reset = () => {
    setStep(-4);
    setDivision('');
    setAge(null);
    setGender(null);
    setAttendance(null);
    setSelections({});
    setIsFinished(false);
    setActiveTab('profile');
  };

  const getMyStats = () => {
    const types = Object.values(selections).map(s => s.type);
    const total = types.length;
    if (total === 0) return { Traditionalist: 0, Mainstream: 0, Progressive: 0, Liberal: 0 };
    return {
      Traditionalist: (types.filter(t => t === 'Traditionalist').length / total) * 100,
      Mainstream: (types.filter(t => t === 'Mainstream').length / total) * 100,
      Progressive: (types.filter(t => t === 'Progressive').length / total) * 100,
      Liberal: (types.filter(t => t === 'Liberal').length / total) * 100
    };
  };

  const getCommunityStats = () => {
    if (communityData.length === 0) return { Traditionalist: 0, Mainstream: 0, Progressive: 0, Liberal: 0 };
    
    let totalSelections = 0;
    const counts = { Traditionalist: 0, Mainstream: 0, Progressive: 0, Liberal: 0 };
    
    communityData.forEach(entry => {
      Object.values(entry.selections || {}).forEach(type => {
        if (counts[type] !== undefined) {
          counts[type]++;
          totalSelections++;
        }
      });
    });

    if (totalSelections === 0) return counts;
    return {
      Traditionalist: (counts.Traditionalist / totalSelections) * 100,
      Mainstream: (counts.Mainstream / totalSelections) * 100,
      Progressive: (counts.Progressive / totalSelections) * 100,
      Liberal: (counts.Liberal / totalSelections) * 100
    };
  };

  const calculateLean = () => {
    const stats = getMyStats();
    if (Object.keys(selections).length === 0) return 'Mixed';
    return Object.entries(stats).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const generateSummary = () => {
    const keys = ADVENTIST_PILLARS.map(p => selections[p.id]?.keyword).filter(Boolean);
    if (keys.length < 9) return "Incomplete evaluation. Complete all questions to reveal your summary.";
    return `My Adventist identity leans toward ${calculateLean()} views. Specifically, I am a ${keys[0]} on the Godhead, a ${keys[2]} on grace, and a ${keys[4]} on Scripture. Regarding the distinctives, I hold a ${keys[6]} view of the sanctuary and a ${keys[5]} stance on the Spirit of Prophecy, unified by an ${keys[8]} view of the Remnant and a ${keys[7]} practice of the Sabbath.`;
  };

  const progressPercentage = isFinished ? 100 : ((step + 4) / (ADVENTIST_PILLARS.length + 4)) * 100;

  const shareApp = async () => {
    const shareData = {
      title: 'Adventist Pulse',
      text: 'Discover your theological identity and see how you align with the global Adventist community. Take the Adventist Pulse today!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
            console.log('Share failed via API, falling back to clipboard.', err);
        } else {
            return; // User cancelled share
        }
      }
    }
    
    // Fallback clipboard logic
    const textArea = document.createElement("textarea");
    textArea.value = `${shareData.text} ${shareData.url}`;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const availableTabs = [
    ...(isProfileComplete ? [{ id: 'profile', icon: <Compass className="w-4 h-4" />, label: 'Profile' }] : []),
    { id: 'stats', icon: <BarChart3 className="w-4 h-4" />, label: 'Community' },
    { id: 'discussion', icon: <MessageCircle className="w-4 h-4" />, label: 'Discuss' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-900 text-white rounded-2xl mb-4 shadow-xl">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Adventist Pulse</h1>
          <p className="text-slate-500 mt-2 italic text-sm">Community-grounded theological discovery.</p>
        </header>

        <div className="w-full h-1.5 bg-slate-200 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-700 ease-in-out" style={{ width: `${progressPercentage}%` }} />
        </div>

        {!isFinished ? (
          <div className="space-y-6">
            {isSaving ? (
              <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold">Synchronizing with Community Pulse...</h2>
                <p className="text-slate-500 mt-2">Saving your anonymous profile to the global cloud.</p>
              </div>
            ) : step < 0 ? (
              /* DEMOGRAPHICS STEPS (-4, -3, -2, -1) */
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    {step === -4 && <Globe className="w-6 h-6" />}
                    {step === -3 && <Hourglass className="w-6 h-6" />}
                    {step === -2 && <User className="w-6 h-6" />}
                    {step === -1 && <Building className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Contextualization {step === -4 ? '1/4' : step === -3 ? '2/4' : step === -2 ? '3/4' : '4/4'}
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {step === -4 ? 'Church Region' : step === -3 ? 'Age Group' : step === -2 ? 'Gender' : 'Church Attendance'}
                    </span>
                  </div>
                </div>

                {/* Content switching based on demographic step */}
                {step === -4 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">Which SDA Division do you live in?</h2>
                    <div className="relative mb-6">
                      <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="w-full p-5 pr-12 rounded-2xl border-2 border-slate-200 outline-none text-slate-700 font-bold appearance-none bg-white focus:border-indigo-600 transition-colors cursor-pointer"
                      >
                        <option value="" disabled>Select your Division...</option>
                        {SDA_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </>
                )}

                {step === -3 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">What is your age group?</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {AGES.map((a) => (
                        <button key={a} onClick={() => { setAge(a); nextStep(); }} className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 ${age === a ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                          <span className="font-bold text-slate-800">{a}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === -2 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">How do you identify?</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {GENDERS.map((g) => (
                        <button key={g} onClick={() => { setGender(g); nextStep(); }} className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${gender === g ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                          <span className="font-bold text-slate-800">{g}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === -1 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-slate-800">How often do you attend your local Adventist church?</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {ATTENDANCE.map((a) => (
                        <button key={a} onClick={() => { setAttendance(a); nextStep(); }} className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${attendance === a ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                          <span className="font-bold text-slate-800">{a}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                <div className="flex justify-between items-center px-2 mt-8">
                  {step > -4 ? (
                    <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  ) : <div></div>}
                  {step === -4 && (
                    <button 
                      onClick={nextStep} 
                      disabled={!division} 
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all ${!division ? 'bg-slate-200 text-slate-400' : 'bg-indigo-900 text-white hover:bg-black'}`}
                    >
                      Next <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* PILLAR STEPS (0 to 8) */
              <>
                <div className="flex justify-center">
                  <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${ADVENTIST_PILLARS[step].category === 'Shared Foundation' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                    {ADVENTIST_PILLARS[step].category}
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`p-2.5 rounded-xl ${ADVENTIST_PILLARS[step].category === 'Shared Foundation' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>{ADVENTIST_PILLARS[step].icon}</div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dimension {step + 1} of {ADVENTIST_PILLARS.length}</span>
                      <span className="text-lg font-bold text-slate-800">{ADVENTIST_PILLARS[step].title}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-6 text-slate-800">{ADVENTIST_PILLARS[step].question}</h2>
                  <div className="grid gap-3">
                    {ADVENTIST_PILLARS[step].options.map((option) => (
                      <button key={option.label} onClick={() => handleSelect(ADVENTIST_PILLARS[step].id, option)} className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${selections[ADVENTIST_PILLARS[step].id]?.label === option.label ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                        <div className="flex justify-between items-center mb-1"><span className={`font-bold text-base ${selections[ADVENTIST_PILLARS[step].id]?.label === option.label ? 'text-indigo-800' : 'text-slate-700'}`}>{option.label}</span></div>
                        <p className="text-sm text-slate-500 font-medium">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center px-4">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-200"><ChevronLeft className="w-5 h-5" /> Back</button>
                  <button onClick={nextStep} disabled={!selections[ADVENTIST_PILLARS[step].id]} className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black shadow-lg transition-all ${!selections[ADVENTIST_PILLARS[step].id] ? 'bg-neutral-200 text-neutral-400' : 'bg-indigo-900 text-white hover:bg-black'}`}>{step === ADVENTIST_PILLARS.length - 1 ? 'See Global Results' : 'Next'} <ChevronRight className="w-5 h-5" /></button>
                </div>
              </>
            )}

            {/* Global Skip Button */}
            {!isSaving && (
              <div className="mt-8 text-center">
                <button onClick={skipToStats} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                  Skip directly to Global Stats
                </button>
              </div>
            )}
          </div>
        ) : (
          /* RESULTS VIEW */
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden flex flex-col min-h-[500px]">
            
            <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl mb-8">
              {availableTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1">
              {activeTab === 'profile' && isProfileComplete && (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="text-center mb-8">
                    <div className="inline-block px-4 py-1.5 bg-indigo-900 text-white text-xs font-black uppercase tracking-widest rounded-full mb-4">{calculateLean()} Leading</div>
                    <h2 className="text-3xl font-black text-slate-900">Your Theological Identity</h2>
                  </div>
                  <div className="bg-slate-900 text-slate-100 p-10 rounded-[2rem] mb-8 relative shadow-inner text-center italic font-serif text-xl leading-relaxed">
                    "{generateSummary()}"
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Demographics</span>
                      <span className="font-bold text-indigo-900 text-sm">{age}, {gender}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Region</span>
                      <span className="font-bold text-indigo-900 text-sm">{division?.split('(')[1]?.replace(')','')}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Attendance</span>
                      <span className="font-bold text-indigo-900 text-sm">{attendance}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Global Pulse</span>
                      <span className="font-black text-indigo-900 text-2xl leading-none mb-1">{communityData.length}</span>
                      <span className="font-medium text-slate-500 text-xs">Responses</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-black text-slate-900 mb-6 text-center">{isProfileComplete ? 'Your Balance vs. Community Pulse' : 'Global Community Pulse'}</h3>
                  <div className="space-y-8 mb-8">
                    {Object.entries(getMyStats()).map(([type, myPercent]) => {
                      const commPercent = getCommunityStats()[type];
                      return (
                        <div key={type}>
                          <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-wider">
                            <span className="text-slate-800">{type}</span>
                            <div className="flex gap-4">
                              {isProfileComplete && <span className="text-indigo-600">You: {Math.round(myPercent)}%</span>}
                              <span className={isProfileComplete ? "text-slate-400" : "text-indigo-600"}>Global: {Math.round(commPercent)}%</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {/* My Progress */}
                            {isProfileComplete && (
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${myPercent}%` }} />
                              </div>
                            )}
                            {/* Community Progress */}
                            <div className={`w-full ${isProfileComplete ? 'h-1.5 opacity-50' : 'h-2.5'} bg-slate-100 rounded-full overflow-hidden`}>
                              <div className={`h-full ${isProfileComplete ? 'bg-slate-400' : 'bg-indigo-600'} transition-all duration-1000`} style={{ width: `${commPercent}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-6 bg-indigo-50 border-l-4 border-indigo-900 rounded-r-2xl text-sm text-slate-700 leading-relaxed mb-4">
                    <p>
                      {isProfileComplete ? (
                        <>
                          Current cloud data suggests that within <strong>{division}</strong>, the community exhibits unique theological dynamics.
                          As an individual with a <strong>{calculateLean()}</strong> profile, you are {calculateLean() === 'Mainstream' ? 'positioned in the ecclesiastical center' : 'contributing to the theological diversity'} of the modern church network.
                        </>
                      ) : (
                        <>
                          Current cloud data reveals the aggregate theological dynamics of the global Adventist community. 
                          Take the pulse yourself to see where you fit into this landscape!
                        </>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 text-center leading-relaxed italic">
                    {isProfileComplete ? "Solid bars represent your selections. Faded bars represent the total aggregate pulse." : "Bars represent the total aggregate pulse from the global community."}
                  </p>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 flex flex-col h-[400px]">
                  <h3 className="text-xl font-black text-slate-900 mb-4 text-center">Community Discussion</h3>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                    {comments.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                        <MessageCircle className="w-10 h-10 opacity-20" />
                        <p className="italic text-sm">Be the first to share your perspective...</p>
                      </div>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-indigo-900 px-2.5 py-1 bg-indigo-100 rounded-md uppercase tracking-wider">{c.lean}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {c.timestamp && typeof c.timestamp.toMillis === 'function' ? new Date(c.timestamp.toMillis()).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex gap-2 relative mt-auto border-t border-slate-100 pt-4">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder={isProfileComplete ? `Share a thought as a ${calculateLean()}...` : `Share a thought...`}
                      className="flex-1 resize-none rounded-2xl border-2 border-slate-200 p-3.5 text-sm focus:border-indigo-600 focus:ring-0 transition-all bg-white"
                      rows={2}
                    />
                    <button
                      onClick={handlePostComment}
                      disabled={!newComment.trim() || isPostingComment}
                      className="bg-indigo-900 text-white w-14 rounded-2xl hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center shadow-md active:scale-95"
                    >
                      {isPostingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-slate-100">
              <button onClick={shareApp} className="flex items-center justify-center gap-3 bg-indigo-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all active:scale-95 shadow-lg">
                {copyFeedback ? <><CheckCircle2 className="w-6 h-6" /> App Link Copied/Shared!</> : <><Share2 className="w-6 h-6" /> Share Adventist Pulse</>}
              </button>
              <button onClick={reset} className="flex items-center justify-center gap-2 text-slate-400 py-3 font-bold hover:text-slate-800 transition-all rounded-xl hover:bg-slate-50"><RotateCcw className="w-4 h-4" /> {isProfileComplete ? 'Take Pulse Again' : 'Take the Pulse'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
