import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Copy, 
  BookOpen, 
  Calendar, 
  ScrollText, 
  Wind, 
  Anchor,
  Sparkles,
  CheckCircle2,
  Users,
  Compass,
  Zap,
  Mountain,
  ShieldAlert,
  CloudSun,
  Globe,
  BarChart3,
  MessageSquareQuote,
  Loader2
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'adventist-pulse-app';

const CONTINENTS = [
  { id: 'africa', label: 'Africa', trend: 'Highly Traditional' },
  { id: 'asia', label: 'Asia', trend: 'Mainstream/Traditional' },
  { id: 'europe', label: 'Europe', trend: 'Progressive-leaning' },
  { id: 'north-america', label: 'North America', trend: 'Mixed/Polarized' },
  { id: 'oceania', label: 'Oceania', trend: 'Mainstream/Progressive' },
  { id: 'south-america', label: 'South America', trend: 'Traditional/Mainstream' }
];

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

const App = () => {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(-1);
  const [continent, setContinent] = useState(null);
  const [selections, setSelections] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [communityData, setCommunityData] = useState([]);

  // (1) Auth Setup
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // (2) Fetch Global Community Data
  useEffect(() => {
    if (!user) return;
    const pulsesCol = collection(db, 'artifacts', appId, 'public', 'data', 'pulses');
    const unsubscribe = onSnapshot(pulsesCol, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setCommunityData(data);
    }, (error) => console.error("Firestore error:", error));
    return () => unsubscribe();
  }, [user]);

  const handleSelect = (pillarId, option) => {
    setSelections(prev => ({ ...prev, [pillarId]: option }));
  };

  const savePulseToCloud = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    
    try {
      const pulsesCol = collection(db, 'artifacts', appId, 'public', 'data', 'pulses');
      const payload = {
        continent: continent.label,
        continentId: continent.id,
        selections: Object.keys(selections).reduce((acc, key) => {
          acc[key] = selections[key].type;
          return acc;
        }, {}),
        timestamp: serverTimestamp(),
      };
      await addDoc(pulsesCol, payload);
    } catch (e) {
      console.error("Error saving pulse:", e);
    } finally {
      setIsSaving(false);
      setIsFinished(true);
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
    setStep(-1);
    setContinent(null);
    setSelections({});
    setIsFinished(false);
    setActiveTab('profile');
  };

  const getMyStats = () => {
    const types = Object.values(selections).map(s => s.type);
    const total = types.length;
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
    return Object.entries(stats).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const generateSummary = () => {
    const keys = ADVENTIST_PILLARS.map(p => selections[p.id]?.keyword).filter(Boolean);
    if (keys.length < 8) return "Incomplete evaluation.";
    return `My Adventist identity leans toward ${calculateLean()} views. Specifically, I am a ${keys[0]} on the Godhead and a ${keys[2]} on grace. Regarding the distinctives, I hold a ${keys[5]} view of the sanctuary and a ${keys[4]} stance on inspiration, unified by an ${keys[7]} view of the Remnant and a ${keys[6]} practice of the Sabbath.`;
  };

  const progress = ((step + 1 + (isFinished ? 1 : 0)) / (ADVENTIST_PILLARS.length + 1)) * 100;

  const copyToClipboard = () => {
    const text = generateSummary();
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

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
          <div className="h-full bg-indigo-600 transition-all duration-700 ease-in-out" style={{ width: `${progress}%` }} />
        </div>

        {!isFinished ? (
          <div className="space-y-6">
            {isSaving ? (
              <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold">Synchronizing with Community Pulse...</h2>
                <p className="text-slate-500 mt-2">Saving your anonymous profile to the global cloud.</p>
              </div>
            ) : step === -1 ? (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Globe className="w-6 h-6" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contextualization</span>
                    <span className="text-lg font-bold text-slate-800">Global Region</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Which continent do you live on?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONTINENTS.map((c) => (
                    <button key={c.id} onClick={() => { setContinent(c); nextStep(); }} className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${continent?.id === c.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>
                      <div className="flex justify-between items-center"><span className="font-bold text-slate-800">{c.label}</span></div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${ADVENTIST_PILLARS[step].category === 'Shared Foundation' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                    {ADVENTIST_PILLARS[step].category}
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
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
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              {[{ id: 'profile', icon: <Compass className="w-4 h-4" />, label: 'Profile' }, { id: 'stats', icon: <BarChart3 className="w-4 h-4" />, label: 'Live Community' }, { id: 'church', icon: <MessageSquareQuote className="w-4 h-4" />, label: 'State of Church' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                  <div className="inline-block px-4 py-1.5 bg-indigo-900 text-white text-xs font-black uppercase tracking-widest rounded-full mb-4">{calculateLean()} Leading</div>
                  <h2 className="text-3xl font-black text-slate-900">Your Theological Identity</h2>
                </div>
                <div className="bg-slate-900 text-slate-100 p-10 rounded-[2rem] mb-8 relative shadow-inner text-center italic font-serif text-xl leading-relaxed">
                  "{generateSummary()}"
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Region</span>
                    <span className="font-bold text-indigo-900">{continent?.label}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Pulse Count</span>
                    <span className="font-bold text-indigo-900">{communityData.length} Anonymous Responses</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-black text-slate-900 mb-6 text-center">Your Balance vs. Community Pulse</h3>
                <div className="space-y-8 mb-8">
                  {Object.entries(getMyStats()).map(([type, myPercent]) => {
                    const commPercent = getCommunityStats()[type];
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-wider">
                          <span className="text-slate-800">{type}</span>
                          <div className="flex gap-4">
                            <span className="text-indigo-600">You: {Math.round(myPercent)}%</span>
                            <span className="text-slate-400">Global: {Math.round(commPercent)}%</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {/* My Progress */}
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${myPercent}%` }} />
                          </div>
                          {/* Community Progress */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden opacity-50">
                            <div className="h-full bg-slate-400 transition-all duration-1000" style={{ width: `${commPercent}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 text-center leading-relaxed italic">
                  Solid bars represent your selections. Faded bars represent the {communityData.length} responses currently in the global pulse.
                </p>
              </div>
            )}

            {activeTab === 'church' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
                <h3 className="text-xl font-black text-slate-900 text-center mb-2">The Global Pulse</h3>
                <div className="p-6 bg-indigo-50 border-l-4 border-indigo-900 rounded-r-2xl text-sm text-slate-700 leading-relaxed space-y-4">
                  <p>
                    Current cloud data suggests that within the **{continent?.label}** region, the community trend is **{continent?.trend}**. 
                  </p>
                  <p>
                    Globally, we are seeing {getCommunityStats().Traditionalist > 40 ? 'a strong surge in Traditionalist frameworks' : 'a balanced diversification across spectrums'}. 
                    As an individual leaning **{calculateLean()}**, you are {calculateLean() === 'Mainstream' ? 'positioned in the ecclesiastical center of modern Adventism.' : 'contributing to the growing edge of the church.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-slate-100">
              <button onClick={copyToClipboard} className="flex items-center justify-center gap-3 bg-indigo-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all active:scale-95 shadow-lg">
                {copyFeedback ? <><CheckCircle2 className="w-6 h-6" /> Identity Copied!</> : <><Copy className="w-6 h-6" /> Copy Profile</>}
              </button>
              <button onClick={reset} className="flex items-center justify-center gap-2 text-slate-400 py-2 font-bold hover:text-slate-800 transition-all"><RotateCcw className="w-4 h-4" /> Start Over</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
