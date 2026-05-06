import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, ShieldCheck, UserPlus, Star, 
  Search, Filter, Calendar, Clock, Send, X, 
  ChevronRight, ArrowRight, BrainCircuit, Sparkles,
  CheckCircle2, ExternalLink, Clipboard, Check
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  social: string;
  expertises: string[];
  rating: number;
  reviews: number;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  availability: string;
  bio: string;
  milestone: string;
  recentActivities: string[];
  publicStatement: string;
  boardsAndImpact: string;
  controversy: string;
  avatarColor: string;
  sourceUrl: string;
  sourceLabel: string;
}

interface Message {
  id: string;
  mentorId: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: Date;
}

interface UserBooking {
  id: string;
  mentorId: string;
  mentorName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending';
}

const MENTORS: Mentor[] = [
  { 
    id: '1',
    name: "Satya Nadella", 
    role: "Chairman & CEO", 
    company: "Microsoft",
    social: "X: @satyanadella | LinkedIn | GitHub",
    expertises: ["Cloud", "AI Strategy", "Enterprise Leadership", "Copilot"], 
    rating: 5.0,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Microsoft's Chairman and CEO, known for leading the company's cloud, Azure, and AI transformation.",
    milestone: "Joined Microsoft in 1992, led major enterprise and cloud divisions, and became CEO in 2014 before later becoming chairman.",
    recentActivities: [
      "Scaled Microsoft's AI and Azure strategy, with Microsoft reporting a $10B AI business run rate.",
      "Oversaw Copilot expansion across Microsoft products and continued Windows 11 rollouts.",
      "Communicated workforce adjustments while emphasizing mission focus and customer impact."
    ],
    publicStatement: "Often frames AI as a work transformation engine that helps customers create new growth.",
    boardsAndImpact: "University of Chicago trustee, BlackRock board member, and supporter of AI for Accessibility and education initiatives.",
    controversy: "Few personal controversies; Microsoft under his tenure continues to face antitrust and market-power scrutiny.",
    avatarColor: "bg-blue-600",
    sourceUrl: "https://news.microsoft.com/ceo/index.html",
    sourceLabel: "Microsoft official"
  },
  { 
    id: '2',
    name: "Sundar Pichai", 
    role: "CEO", 
    company: "Google & Alphabet",
    social: "X: @sundarpichai | LinkedIn | Google blog",
    expertises: ["AI Products", "Search", "Google Cloud", "Personalization"], 
    rating: 5.0,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "CEO of Google and Alphabet, leading Search, Gemini, Android, YouTube, and Google Cloud through the AI era.",
    milestone: "Joined Google in 2004, led Chrome and Android product work, became Google CEO in 2015 and Alphabet CEO in 2019.",
    recentActivities: [
      "Highlighted Gemini 2.5, AI Overviews, and AI Mode in Search at Google I/O.",
      "Showcased infrastructure advances including TPU Ironwood and efficiency work.",
      "Pushed AI personalization features such as contextual Smart Replies."
    ],
    publicStatement: "Regularly emphasizes responsible AI, speed of product shipping, and Google's mission to organize information.",
    boardsAndImpact: "Alphabet board member; Google.org funds global AI for social good and crisis-response projects.",
    controversy: "Google has faced antitrust, privacy, content moderation, and search-bias scrutiny during his tenure.",
    avatarColor: "bg-emerald-600",
    sourceUrl: "https://about.google/company-info/",
    sourceLabel: "Google official"
  },
  { 
    id: '3',
    name: "Jensen Huang", 
    role: "Founder, President & CEO", 
    company: "NVIDIA",
    social: "NVIDIA channels | LinkedIn | GTC keynotes",
    expertises: ["AI Chips", "GPUs", "Founder Leadership", "Data Centers"], 
    rating: 5.0,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Co-founder and CEO of NVIDIA, one of the central companies behind modern AI compute infrastructure.",
    milestone: "Co-founded NVIDIA in 1993 and built it from graphics hardware into a core AI computing platform company.",
    recentActivities: [
      "Advanced Hopper and Blackwell GPU platforms for AI data centers.",
      "Expanded partnerships across Microsoft Azure, Google Cloud, AWS, and enterprise AI programs.",
      "Continues high-profile keynotes on agentic AI, accelerated computing, and AI infrastructure."
    ],
    publicStatement: "Known for arguing that accelerated computing and AI will reshape every industry.",
    boardsAndImpact: "Supports STEM education through NVIDIA Foundation and major university philanthropy.",
    controversy: "No major personal scandal; NVIDIA has faced scrutiny around crypto GPU demand, supply constraints, and AI chip market dominance.",
    avatarColor: "bg-lime-600",
    sourceUrl: "https://www.nvidia.com/en-gb/about-nvidia/board-of-directors/jensen-huang/",
    sourceLabel: "NVIDIA official"
  },
  { 
    id: '4',
    name: "Tim Cook", 
    role: "CEO; Executive Chairman from Sep 1, 2026", 
    company: "Apple",
    social: "X: @tim_cook | LinkedIn | Apple leadership",
    expertises: ["Operations", "Consumer Tech", "Privacy", "Supply Chain"], 
    rating: 4.9,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Apple CEO and board member, widely known for scaling Apple's operations, services, silicon, wearables, and privacy positioning.",
    milestone: "Joined Apple in 1998, became COO, then CEO in 2011 after Steve Jobs.",
    recentActivities: [
      "Oversaw Vision Pro, Apple Watch, Apple Silicon, and continued Services expansion.",
      "Apple announced he will become Executive Chairman as John Ternus becomes CEO on September 1, 2026.",
      "Continues steering Apple through EU DMA, App Store, privacy, and AI platform pressure."
    ],
    publicStatement: "Frequently describes privacy as a fundamental human right and speaks on environment and education.",
    boardsAndImpact: "Apple board member, Nike board member, and private donor to health, education, and disaster-relief causes.",
    controversy: "Apple faces recurring scrutiny over App Store fees, antitrust, privacy tradeoffs, and device performance disputes.",
    avatarColor: "bg-slate-600",
    sourceUrl: "https://www.apple.com/newsroom/2026/04/tim-cook-to-become-apple-executive-chairman-john-ternus-to-become-apple-ceo/",
    sourceLabel: "Apple newsroom"
  },
  { 
    id: '5',
    name: "Andy Jassy", 
    role: "President & CEO", 
    company: "Amazon",
    social: "X: @ajassy | LinkedIn | Amazon IR",
    expertises: ["AWS", "Retail Scale", "Generative AI", "Operations"], 
    rating: 4.9,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Amazon President and CEO, previously known for founding and scaling AWS into a defining cloud business.",
    milestone: "Joined Amazon in 1997, helped create AWS, led AWS, and succeeded Jeff Bezos as Amazon CEO in 2021.",
    recentActivities: [
      "Continues pushing AWS infrastructure, AI chips, and developer AI services.",
      "Oversees Amazon retail, Prime, logistics, robotics, and grocery technology.",
      "Focuses on operating discipline after Amazon's major post-pandemic restructuring."
    ],
    publicStatement: "Often returns to Amazon's Day 1 culture, customer obsession, and practical generative AI adoption.",
    boardsAndImpact: "Serves on education-focused boards including Rainier Scholars and Harvard advisory groups.",
    controversy: "Amazon faces criticism over labor practices, union issues, marketplace power, and executive compensation.",
    avatarColor: "bg-orange-500",
    sourceUrl: "https://ir.aboutamazon.com/officers-and-directors/person-details/default.aspx?ItemId=7601ef7b-4732-44e2-84ef-2cccb54ac11a",
    sourceLabel: "Amazon IR"
  },
  {
    id: '6',
    name: "Elon Musk",
    role: "CEO; owner/operator across Tesla, SpaceX, X, xAI",
    company: "Tesla / SpaceX / X / xAI",
    social: "X: @elonmusk | Tesla leadership",
    expertises: ["EVs", "Space", "Hard Tech", "AI"],
    rating: 4.8,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Hard-tech founder and operator associated with electric vehicles, reusable rockets, satellite internet, social media, and AI.",
    milestone: "Built and sold Zip2 and X.com/PayPal, founded SpaceX, joined and later led Tesla, and later launched xAI.",
    recentActivities: [
      "Continues Tesla Cybertruck, FSD, energy, and manufacturing expansion work.",
      "SpaceX keeps advancing Starship tests, Starlink, and long-term Mars ambitions.",
      "Rebuilt Twitter into X and raised visibility for xAI and Neuralink."
    ],
    publicStatement: "Highly active on X, often discussing free speech, AI risk, space, energy, and regulation.",
    boardsAndImpact: "Musk Foundation supports renewable energy, science education, pediatric research, and carbon-removal efforts.",
    controversy: "Polarizing figure with controversies around social posts, SEC disputes, X management, labor issues, and misinformation claims.",
    avatarColor: "bg-red-600",
    sourceUrl: "https://ir.tesla.com/corporate/elon-musk",
    sourceLabel: "Tesla IR"
  },
  {
    id: '7',
    name: "Sam Altman",
    role: "CEO",
    company: "OpenAI",
    social: "X: @sama | LinkedIn | OpenAI blog",
    expertises: ["AI Strategy", "Startups", "Product Vision", "Policy"],
    rating: 4.9,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "OpenAI CEO, former Y Combinator president, startup investor, and one of the most visible voices in frontier AI.",
    milestone: "Co-founded Loopt, led Y Combinator, co-founded OpenAI in 2015, and became OpenAI CEO in 2019.",
    recentActivities: [
      "Led OpenAI through ChatGPT growth, enterprise AI products, and frontier model releases.",
      "Returned as CEO after the November 2023 board ouster and reinstatement crisis.",
      "Continues policy advocacy around AI safety, compute, governance, and global competition."
    ],
    publicStatement: "Frequently speaks about AI's benefits, risks, governance, and the need for careful deployment.",
    boardsAndImpact: "Investor in companies including Reddit and Stripe; connected to Helion Energy and other frontier-technology ventures.",
    controversy: "OpenAI governance, the 2023 ouster, lawsuits from Elon Musk, and profit-mission tension remain major public debates.",
    avatarColor: "bg-teal-600",
    sourceUrl: "https://openai.com/index/review-completed-altman-brockman-to-continue-to-lead-openai/",
    sourceLabel: "OpenAI official"
  },
  {
    id: '8',
    name: "Deepinder Goyal",
    role: "Co-founder; Vice Chairman/Director after stepping back as CEO",
    company: "Eternal / Zomato / LAT Aerospace",
    social: "X: @deepigoyal | LinkedIn",
    expertises: ["Consumer Internet", "Food Tech", "India Startups", "Aviation"],
    rating: 4.8,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Zomato co-founder and Indian entrepreneur now associated with Eternal, LAT Aerospace, and startup investing.",
    milestone: "Co-founded Foodiebay in 2008, rebranded it to Zomato, and led it through one of India's landmark consumer-tech IPOs.",
    recentActivities: [
      "Stepped back from the Eternal/Zomato CEO role in January 2026 while staying on the board.",
      "Focused on ventures including LAT Aerospace and health-tech/startup investments.",
      "Continues public startup activity through investing, Shark Tank India, and founder commentary."
    ],
    publicStatement: "Often speaks about building for India, sustainability, and founder execution.",
    boardsAndImpact: "Associated with Feeding India, startup angel investments, and education/food-access initiatives.",
    controversy: "Zomato has faced restaurant commission disputes, food-safety criticism, and delivery-platform labor concerns.",
    avatarColor: "bg-red-500",
    sourceUrl: "https://www.zomato.com/investor-relations/governance/deepinder-goyal",
    sourceLabel: "Zomato IR"
  },
  {
    id: '9',
    name: "Bhavish Aggarwal",
    role: "Founder, Chairman & MD",
    company: "Ola Consumer / Ola Electric / Krutrim",
    social: "X: @bhash | LinkedIn",
    expertises: ["Mobility", "EVs", "Indian Startups", "AI"],
    rating: 4.6,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Founder behind Ola's ride-hailing business, Ola Electric, and Krutrim's AI ambitions.",
    milestone: "Co-founded Ola Cabs in 2010, expanded into mobility and financial services, then pushed aggressively into EV manufacturing.",
    recentActivities: [
      "Rebranded and expanded Ola Consumer while scaling Ola Electric's scooter and battery ecosystem.",
      "Focused heavily on EV factories, charging, batteries, and India-made technology.",
      "Continues building Krutrim as an Indian AI platform company."
    ],
    publicStatement: "Frequently promotes Indian technology independence, EV adoption, and high-intensity entrepreneurship.",
    boardsAndImpact: "Ola Foundation initiatives cover road safety, skilling, and community support.",
    controversy: "Faced scrutiny over Ola Electric scooter incidents, service issues, layoffs, and reports about intense workplace culture.",
    avatarColor: "bg-green-600",
    sourceUrl: "https://www.olaelectric.com/investor-relations/directors-profile",
    sourceLabel: "Ola Electric IR"
  },
  {
    id: '10',
    name: "Vijay Shekhar Sharma",
    role: "Chairman, MD & CEO",
    company: "Paytm",
    social: "X: @vijayshekhar | LinkedIn | WEF profile",
    expertises: ["Fintech", "Payments", "Public Markets", "Digital India"],
    rating: 4.7,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Founder-led fintech executive who helped define India's mobile wallet and merchant payments ecosystem.",
    milestone: "Founded One97 in 2000, launched Paytm payments in 2010, and led Paytm's large public-market listing.",
    recentActivities: [
      "Navigates Paytm through RBI and payments-regulation pressure.",
      "Continues focusing Paytm on merchants, lending, offline payments, and financial services.",
      "Publicly engages in digital-payments policy and India startup debates."
    ],
    publicStatement: "Often talks about building for India, reducing startup friction, and expanding digital financial access.",
    boardsAndImpact: "WEF Young Global Leader; supports education, entrepreneurship, and fintech ecosystem work.",
    controversy: "Paytm has faced RBI actions, compliance scrutiny, market volatility, and public policy disputes.",
    avatarColor: "bg-sky-600",
    sourceUrl: "https://ir.paytm.com/directors-and-committees",
    sourceLabel: "Paytm IR"
  },
  {
    id: '11',
    name: "Falguni Nayar",
    role: "Founder, Executive Chairperson, MD & CEO",
    company: "Nykaa",
    social: "LinkedIn | Nykaa corporate site",
    expertises: ["E-commerce", "Beauty", "Brand Building", "Women Leadership"],
    rating: 4.9,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "Founder and CEO of Nykaa, one of India's best-known beauty, fashion, and lifestyle commerce companies.",
    milestone: "Left Kotak Mahindra after a long banking career and founded Nykaa in 2012, later leading it to IPO.",
    recentActivities: [
      "Continues expanding Nykaa Beauty, Nykaa Fashion, retail stores, and brand partnerships.",
      "Focuses on profitable consumer commerce, content-led beauty discovery, and private labels.",
      "Uses her story to encourage women founders and later-career entrepreneurship."
    ],
    publicStatement: "Often emphasizes customer delight, disciplined profitability, and resilient execution.",
    boardsAndImpact: "Nykaa Foundation and CSR work support women's health, education, and community development.",
    controversy: "Nykaa has faced investor concerns over post-IPO stock moves and consumer complaints, but Nayar's personal reputation remains strong.",
    avatarColor: "bg-pink-600",
    sourceUrl: "https://www.nykaa.com/board-of-director-falguni-nayar/lp",
    sourceLabel: "Nykaa official"
  },
  {
    id: '12',
    name: "Harshil Mathur",
    role: "CEO & Co-founder",
    company: "Razorpay",
    social: "X: @harshilmathur | LinkedIn | Razorpay newsroom",
    expertises: ["Fintech", "B2B SaaS", "Payments", "SMB Infrastructure"],
    rating: 4.8,
    reviews: 0,
    experience: 'Advanced',
    availability: "Public profile",
    bio: "CEO and co-founder of Razorpay, one of India's most prominent fintech infrastructure companies.",
    milestone: "IIT Roorkee alumnus who co-founded Razorpay in 2014 with Shashank Kumar and joined Y Combinator in 2015.",
    recentActivities: [
      "Expanded RazorpayX, Capital, merchant payment devices, payroll, and SME financial products.",
      "Led Razorpay through strong profitability and continued fintech regulatory engagement.",
      "Continues pushing digital payments infrastructure for Indian businesses."
    ],
    publicStatement: "Advocates trust, transparent culture, and regulation that enables Indian fintech growth.",
    boardsAndImpact: "Supports education and digital inclusion through Razorpay Foundation and startup mentorship.",
    controversy: "Razorpay has handled merchant account-hold and fraud-control complaints, but Mathur has no major personal legal controversy.",
    avatarColor: "bg-indigo-600",
    sourceUrl: "https://razorpay.com/newsroom/leadership-team/",
    sourceLabel: "Razorpay official"
  }
];

export default function AINetworking() {
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showChat, setShowChat] = useState<Mentor | null>(null);
  const [showBooking, setShowBooking] = useState<Mentor | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<Mentor | null>(null);
  const [matchingStep, setMatchingStep] = useState(1);
  
  const [matchData, setMatchData] = useState({
    skills: '',
    goal: '',
    experience: 'Beginner'
  });

  const [filteredMentors, setFilteredMentors] = useState(MENTORS);
  const [isMatching, setIsMatching] = useState(false);
  
  // Manual Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  // Derive unique expertise list for filters
  const allExpertises = useMemo(() => {
    const skills = new Set<string>();
    MENTORS.forEach(m => m.expertises.forEach(s => skills.add(s)));
    return ['All', ...Array.from(skills)];
  }, []);

  // Filtering Logic
  const displayMentors = useMemo(() => {
    return filteredMentors.filter(mentor => {
      const matchesSearch = 
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.social.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.milestone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.publicStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.recentActivities.some(activity => activity.toLowerCase().includes(searchQuery.toLowerCase())) ||
        mentor.expertises.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesExpertise = selectedExpertise === 'All' || mentor.expertises.includes(selectedExpertise);
      const matchesExperience = selectedExperience === 'All' || mentor.experience === selectedExperience;
      
      const matchesAvailability = selectedAvailability === 'All' || 
        (selectedAvailability === 'Official' && mentor.sourceLabel.toLowerCase().includes('official')) ||
        (selectedAvailability === 'Investor Relations' && mentor.sourceLabel.toLowerCase().includes('ir'));

      return matchesSearch && matchesExpertise && matchesExperience && matchesAvailability;
    });
  }, [filteredMentors, searchQuery, selectedExpertise, selectedExperience, selectedAvailability]);

  const leaderNames = useMemo(() => MENTORS.map(mentor => mentor.name), []);
  const leaderNameList = leaderNames.join(', ');

  const copyLeaderText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedName(key);
    window.setTimeout(() => setCopiedName(current => current === key ? null : current), 1500);
  };

  // Outreach assistant state. This is not a direct chat with the listed public leader.
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [currentInput, setCurrentInput] = useState('');
  
  // Real-time Booking State
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(24);
  const [selectedTime, setSelectedTime] = useState<string | null>("04:30 PM");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSendMessage = () => {
    if (!currentInput.trim() || !showChat) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      mentorId: showChat.id,
      sender: 'user',
      text: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [showChat.id]: [...(prev[showChat.id] || []), newMessage]
    }));
    setCurrentInput('');

    setTimeout(() => {
      const reply: Message = {
        id: Math.random().toString(36).substr(2, 9),
        mentorId: showChat.id,
        sender: 'mentor',
        text: `Good angle. For ${showChat.name}, keep the outreach specific: mention ${showChat.company}, connect it to ${showChat.expertises[0]}, and ask one clear question instead of requesting a generic call.`,
        timestamp: new Date()
      };
      setMessages(prev => ({
        ...prev,
        [showChat.id]: [...(prev[showChat.id] || []), reply]
      }));
    }, 1500);
  };

  const handleConfirmBooking = () => {
    if (!showBooking || !selectedDate || !selectedTime) return;

    const newBooking: UserBooking = {
      id: Math.random().toString(36).substr(2, 9),
      mentorId: showBooking.id,
      mentorName: showBooking.name,
      date: `April ${selectedDate}, 2026`,
      time: selectedTime,
      status: 'confirmed'
    };

    setBookings(prev => [...prev, newBooking]);
    setBookingSuccess(true);
    
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBooking(null);
    }, 2500);
  };

  const handleMatchSubmit = () => {
    setIsMatching(true);
    setMatchingStep(2);
    
    setTimeout(() => {
      const results = MENTORS.filter(m => 
        m.expertises.some(e => e.toLowerCase().includes(matchData.skills.toLowerCase())) ||
        m.bio.toLowerCase().includes(matchData.goal.toLowerCase()) ||
        m.milestone.toLowerCase().includes(matchData.goal.toLowerCase()) ||
        m.recentActivities.some(activity => activity.toLowerCase().includes(matchData.goal.toLowerCase()))
      );
      setFilteredMentors(results.length > 0 ? results : MENTORS.slice(0, 3));
      setIsMatching(false);
      setShowMatchForm(false);
      setMatchingStep(1);
    }, 2000);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full w-fit">
            <Sparkles className="text-accent" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent italic">AI Powered Matching</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-primary flex items-center gap-3">
            <Users className="text-accent" size={32} />
            Leader Networking
          </h1>
          <p className="text-text-secondary text-lg">Explore verified public CEOs, startup founders, and career role models with clean source links.</p>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="px-4 md:px-0">
        <div className="glass p-1 rounded-[3rem] border border-border bg-accent/5 overflow-hidden group">
          <div className="p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none">
                <BrainCircuit size={300} />
            </div>

            <div className="flex-1 space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-bg-primary ${MENTORS[i-1].avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}>
                      {MENTORS[i-1].name[0]}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-text-muted">Official public profiles</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">STUDY THE PEOPLE <br/><span className="text-accent">BUILDING WHAT'S NEXT.</span></h2>
              <p className="text-text-secondary text-lg max-w-xl">Research leaders from big tech and high-growth startups, then draft smarter outreach without fake profiles or silent dead buttons.</p>
              <button 
                onClick={() => setShowMatchForm(true)}
                className="group flex items-center gap-3 px-10 py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all text-sm shadow-xl shadow-accent/20"
              >
                Find Relevant Leaders <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0">
        <section className="glass rounded-[2rem] border border-border p-5 md:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-black text-text-primary flex items-center gap-2">
                <Users className="text-accent" size={22} />
                Leader Names
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">
                {leaderNames.length} names used in Networking
              </p>
            </div>
            <button
              onClick={() => copyLeaderText(leaderNameList, 'all-leader-names')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
            >
              {copiedName === 'all-leader-names' ? <Check size={16} /> : <Clipboard size={16} />}
              {copiedName === 'all-leader-names' ? 'Copied' : 'Copy All'}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {leaderNames.map(name => (
              <button
                key={name}
                onClick={() => copyLeaderText(name, name)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg-secondary/70 px-4 py-2 text-sm font-black text-text-primary transition-all hover:border-accent/40 hover:bg-bg-hover"
                title={`Copy ${name}`}
              >
                <span>{name}</span>
                {copiedName === name ? (
                  <Check size={14} className="text-success" />
                ) : (
                  <Clipboard size={14} className="text-text-muted" />
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-0">
        {[
          { label: 'Leaders profiled', value: MENTORS.length, detail: 'Big tech, AI, fintech, mobility, commerce' },
          { label: 'Recent activity notes', value: MENTORS.reduce((total, mentor) => total + mentor.recentActivities.length, 0), detail: 'Launches, transitions, regulation, strategy' },
          { label: 'Research fields', value: 7, detail: 'Role, profiles, milestones, activity, impact, risks' }
        ].map(item => (
          <div key={item.label} className="glass rounded-2xl border border-border p-5">
            <div className="text-3xl font-black text-accent">{item.value}</div>
            <div className="text-xs font-black uppercase tracking-widest text-text-primary mt-2">{item.label}</div>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* MENTOR CARDS */}
      <div className="px-4 md:px-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
           <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3 shrink-0">
              <Users size={18} className="text-accent" /> Public Leader Profiles
           </h3>
           
           <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Search leaders, skills, or companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-secondary border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-accent outline-none transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto scrollbar-hide">
                <div className="relative group min-w-[120px]">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={12} />
                  <select 
                    value={selectedExpertise}
                    onChange={(e) => setSelectedExpertise(e.target.value)}
                    className="w-full bg-bg-secondary border border-border rounded-xl pl-8 pr-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent appearance-none cursor-pointer"
                  >
                    {allExpertises.map(exp => <option key={exp} value={exp} className="bg-bg-primary">{exp}</option>)}
                  </select>
                </div>

                <select 
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="bg-bg-secondary border border-border rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent appearance-none cursor-pointer min-w-[120px]"
                >
                  <option value="All">Experience</option>
                  <option value="Beginner" className="bg-bg-primary">Beginner</option>
                  <option value="Intermediate" className="bg-bg-primary">Intermediate</option>
                  <option value="Advanced" className="bg-bg-primary">Advanced</option>
                </select>

                <select 
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="bg-bg-secondary border border-border rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent appearance-none cursor-pointer min-w-[120px]"
                >
                  <option value="All">Sources</option>
                  <option value="Official" className="bg-bg-primary">Official</option>
                  <option value="Investor Relations" className="bg-bg-primary">Investor Relations</option>
                </select>
              </div>
           </div>
        </div>

        <div className="flex justify-between items-center mb-6">
           <div className="h-[1px] flex-1 bg-border" />
           <span className="text-[10px] font-black uppercase tracking-widest text-text-muted whitespace-nowrap ml-6 italic">
             Showing {displayMentors.length} Experts {searchQuery && `matching "${searchQuery}"`}
           </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayMentors.map((mentor, i) => (
              <motion.div
                key={mentor.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-8 rounded-[2.5rem] border border-border hover:border-accent/30 transition-all group flex flex-col h-full bg-gradient-to-b from-transparent to-accent/5"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] ${mentor.avatarColor} flex items-center justify-center text-2xl font-black text-white italic group-hover:scale-110 transition-transform shadow-xl`}>
                    {mentor.name[0]}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-yellow-500 font-black text-xs px-2 py-1 bg-yellow-500/10 rounded-lg">
                      <Star size={12} fill="currentColor" /> {mentor.rating}
                    </div>
                    <span className="text-[10px] font-bold text-text-muted">Public profile</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-black mb-1 group-hover:text-accent transition-colors text-text-primary">{mentor.name}</h3>
                  <p className="text-text-secondary text-xs flex items-center gap-2">
                    <span className="font-bold">{mentor.role}</span>
                    <span className="w-1 h-1 bg-text-muted rounded-full" />
                    <span className="font-medium text-text-muted">{mentor.company}</span>
                  </p>
                </div>

                <p className="text-text-muted text-xs leading-relaxed mb-5 flex-grow italic">"{mentor.bio}"</p>

                <div className="mb-5 rounded-2xl border border-border bg-bg-secondary/70 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Recent focus</div>
                  <ul className="space-y-2">
                    {mentor.recentActivities.slice(0, 2).map(activity => (
                      <li key={activity} className="flex gap-2 text-xs leading-relaxed text-text-secondary">
                        <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" />
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {mentor.expertises.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-bg-secondary rounded-lg text-[10px] font-black uppercase tracking-widest text-text-muted border border-border">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-6 p-4 bg-bg-secondary rounded-2xl border border-border">
                   <Clock size={14} className="text-accent" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Source</span>
                      <span className="text-xs font-bold text-text-primary">{mentor.sourceLabel}</span>
                   </div>
                </div>

                <button
                  onClick={() => setSelectedBrief(mentor)}
                  className="mb-6 w-full rounded-2xl border border-border bg-bg-secondary/50 p-4 text-left text-[10px] font-black uppercase tracking-widest text-accent transition-all hover:border-accent/40 hover:bg-bg-hover"
                >
                  Full profile brief <ChevronRight size={14} className="inline ml-1" />
                </button>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowChat(mentor)}
                    className="flex-1 py-4 glass border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-bg-hover text-text-primary transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <MessageSquare size={16} /> Outreach
                  </button>
                  <button 
                    onClick={() => window.open(mentor.sourceUrl, '_blank', 'noopener,noreferrer')}
                    className="flex-1 py-4 bg-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20"
                  >
                    Source <ExternalLink size={14} className="inline ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER BANNER */}
      <div className="px-4 md:px-0 mt-20">
        <div className="glass p-12 rounded-[3.5rem] border border-border text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 opacity-50" />
           <ShieldCheck className="mx-auto text-success mb-6 relative z-10" size={56} />
           <h2 className="text-3xl font-black mb-4 italic tracking-tighter uppercase relative z-10 text-text-primary">PUBLIC LEADER SOURCES</h2>
           <p className="text-text-secondary max-w-2xl mx-auto text-base leading-relaxed mb-10 relative z-10">
             Profiles are based on official company, investor relations, or public leadership pages, so users can research real people without fake availability claims.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <button
                onClick={() => setShowMatchForm(true)}
                className="w-full sm:w-auto px-12 py-5 bg-text-primary text-bg-primary rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl"
              >
                Match By Goal
              </button>
              <button
                onClick={() => {
                  const firstMentor = MENTORS[0];
                  if (firstMentor) window.open(firstMentor.sourceUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full sm:w-auto px-12 py-5 border border-border rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-bg-hover transition-all text-text-primary"
              >
                Open Sample Source
              </button>
           </div>
        </div>
      </div>

      {/* MATCHING FORM MODAL */}
      <AnimatePresence>
        {showMatchForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isMatching && setShowMatchForm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              layoutId="match-form"
              className="relative w-full max-w-xl glass rounded-[3rem] border border-border overflow-hidden shadow-2xl"
            >
              {matchingStep === 1 ? (
                <div className="p-10 md:p-14 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black italic tracking-tighter uppercase text-text-primary">Intelligent Match</h3>
                       <p className="text-sm text-text-secondary">Tell us what you're looking for, we'll handle the rest.</p>
                    </div>
                    <button onClick={() => setShowMatchForm(false)} className="p-2 hover:bg-bg-hover rounded-full transition-colors text-text-muted">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Target Skills</label>
                      <input 
                        type="text" 
                        value={matchData.skills}
                        onChange={(e) => setMatchData({...matchData, skills: e.target.value})}
                        placeholder="e.g. System Design, React, Leadership"
                        className="w-full bg-bg-secondary border border-border rounded-2xl px-6 py-4 outline-none focus:border-accent transition-all text-sm text-text-primary"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Your Main Goal</label>
                      <select 
                        value={matchData.goal}
                        onChange={(e) => setMatchData({...matchData, goal: e.target.value})}
                        className="w-full bg-bg-secondary border border-border rounded-2xl px-6 py-4 outline-none focus:border-accent transition-all text-sm appearance-none text-text-primary"
                      >
                        <option value="">Select a Goal</option>
                        <option value="internship" className="bg-bg-primary">Secure an Internship</option>
                        <option value="job" className="bg-bg-primary">Crack FAANG Interviews</option>
                        <option value="switch" className="bg-bg-primary">Career Pivot</option>
                        <option value="startup" className="bg-bg-primary">Build a Startup</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Experience Level</label>
                      <div className="grid grid-cols-3 gap-3">
                         {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                           <button
                            key={lvl}
                            onClick={() => setMatchData({...matchData, experience: lvl as any})}
                            className={`py-3 rounded-2xl border text-[10px] font-black uppercase transition-all ${
                              matchData.experience === lvl ? 'bg-accent border-accent text-white shadow-lg' : 'bg-bg-secondary border-border text-text-muted hover:bg-bg-hover'
                            }`}
                           >
                            {lvl}
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleMatchSubmit}
                    className="w-full py-5 bg-text-primary text-bg-primary rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                  >
                    Start AI Match
                  </button>
                </div>
              ) : (
                <div className="p-20 flex flex-col items-center justify-center space-y-10 text-center">
                   <div className="relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        className="w-32 h-32 rounded-full border-4 border-dashed border-accent/30"
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center text-accent"
                      >
                         <BrainCircuit size={48} />
                      </motion.div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black italic tracking-tighter uppercase">Finding relevant leaders...</h3>
                      <p className="text-text-secondary max-w-xs mx-auto">Our AI agent is scanning verified public profiles to match your skills and career goal.</p>
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROFILE BRIEF MODAL */}
      <AnimatePresence>
        {selectedBrief && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBrief(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.96 }}
              className="relative w-full max-w-3xl max-h-[86vh] overflow-y-auto glass rounded-[2.5rem] border border-border shadow-2xl custom-scrollbar"
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-bg-primary/90 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${selectedBrief.avatarColor} flex items-center justify-center text-xl font-black text-white shadow-xl`}>
                    {selectedBrief.name[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter text-text-primary">{selectedBrief.name}</h3>
                    <p className="text-xs font-bold text-text-muted">{selectedBrief.role} • {selectedBrief.company}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBrief(null)} className="p-2 hover:bg-bg-hover rounded-full transition-colors text-text-muted">
                  <X size={22} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="rounded-2xl border border-border bg-bg-secondary/70 p-5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Profile summary</div>
                  <p className="text-sm leading-relaxed text-text-secondary">{selectedBrief.bio}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['Profiles', selectedBrief.social],
                    ['Career milestone', selectedBrief.milestone],
                    ['Public statement angle', selectedBrief.publicStatement],
                    ['Boards and impact', selectedBrief.boardsAndImpact],
                    ['Risk notes', selectedBrief.controversy],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-border bg-bg-secondary/60 p-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{label}</div>
                      <p className="text-xs leading-relaxed text-text-secondary">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-bg-secondary/70 p-5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Recent activities</div>
                  <div className="space-y-3">
                    {selectedBrief.recentActivities.map(activity => (
                      <div key={activity} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowChat(selectedBrief);
                      setSelectedBrief(null);
                    }}
                    className="flex-1 rounded-2xl border border-border bg-bg-secondary px-6 py-4 text-xs font-black uppercase tracking-widest text-text-primary hover:bg-bg-hover transition-all"
                  >
                    Draft outreach
                  </button>
                  <button
                    onClick={() => window.open(selectedBrief.sourceUrl, '_blank', 'noopener,noreferrer')}
                    className="flex-1 rounded-2xl bg-accent px-6 py-4 text-xs font-black uppercase tracking-widest text-white hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Open source <ExternalLink size={14} className="inline ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHAT MODAL */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end p-4 md:p-12 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowChat(null)}
            />
            
            <motion.div
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md h-[600px] glass rounded-[2.5rem] border border-border flex flex-col shadow-2xl pointer-events-auto"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${showChat.avatarColor} flex items-center justify-center font-bold text-white shadow-lg`}>
                    {showChat.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">{showChat.name}</h4>
                    <span className="text-[10px] text-success font-black uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Research mode
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowChat(null)} className="p-2 hover:bg-bg-hover rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                {/* Initial research assistant greeting */}
                <div className="flex gap-3">
                   <div className={`w-8 h-8 rounded-lg ${showChat.avatarColor} flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white`}>
                    {showChat.name[0]}
                   </div>
                   <div className="max-w-[80%] p-4 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none">
                      <p className="text-xs text-text-secondary leading-relaxed">
                        This is an outreach assistant for researching {showChat.name}. Ask for leadership lessons, career angles, or a respectful message draft. This is not a direct chat with {showChat.name}.
                      </p>
                      <p className="hidden">
                        Hey there! 👋 I saw you're interested in {showChat.expertises[0]}. How can I help you accelerate your growth today?
                      </p>
                   </div>
                </div>

                {/* dynamic messages */}
                {(messages[showChat.id] || []).map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                    {msg.sender === 'mentor' && (
                      <div className={`w-8 h-8 rounded-lg ${showChat.avatarColor} flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                        {showChat.name[0]}
                      </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-accent text-white rounded-br-none' 
                        : 'bg-bg-secondary border border-border text-text-secondary rounded-tl-none'
                    }`}>
                      <p className="text-xs leading-relaxed font-medium">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-border space-y-4">
                 <div className="flex gap-2 text-[10px] font-bold text-text-muted overflow-x-auto pb-2 scrollbar-hide">
                    {["Draft outreach", "Career lessons", "Skills to study"].map(q => (
                       <button 
                        key={q} 
                        onClick={() => setCurrentInput(q)}
                        className="whitespace-nowrap px-3 py-1.5 glass border border-border rounded-full hover:border-accent/40 hover:text-accent transition-all"
                       >
                          {q}
                       </button>
                    ))}
                 </div>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about outreach, skills, or career lessons..."
                      className="flex-1 bg-bg-secondary border border-border rounded-2xl px-5 py-3 text-xs text-text-primary outline-none focus:border-accent/50 transition-all"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-accent/20"
                    >
                      <Send size={18} />
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {showBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBooking(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              layoutId="booking-form"
              className="relative w-full max-w-2xl glass rounded-[3rem] border border-border overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/3 bg-accent/10 p-10 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center text-center md:text-left">
                  <div className={`w-20 h-20 rounded-[2rem] ${showBooking.avatarColor} mx-auto md:mx-0 flex items-center justify-center text-3xl font-black text-white italic mb-6 shadow-2xl`}>
                    {showBooking.name[0]}
                  </div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-text-primary">{showBooking.name}</h3>
                  <p className="text-text-muted text-xs mb-6">{showBooking.role} @ {showBooking.company}</p>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-text-primary">
                        <Star size={16} className="text-accent" />
                        <span className="text-sm font-bold">45 min session</span>
                     </div>
                     <div className="flex items-center gap-3 text-text-primary">
                        <MessageSquare size={16} className="text-accent" />
                        <span className="text-sm font-bold">Video call + Notes</span>
                     </div>
                  </div>
              </div>

              <div className="flex-1 p-10 space-y-8">
                 <AnimatePresence mode="wait">
                  {bookingSuccess ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center text-success">
                        <CheckCircle2 size={40} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase">Slot Secured</h4>
                        <p className="text-text-secondary text-sm">Your meeting with {showBooking.name} is confirmed for {selectedDate}th Apr at {selectedTime}.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="form" className="space-y-8">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xl font-black italic tracking-tighter uppercase">Select Time</h4>
                        <button onClick={() => setShowBooking(null)} className="p-2 hover:bg-white/10 rounded-full">
                           <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-text-muted mb-2">
                           <Calendar size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Available Dates</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                           {[24, 25, 26, 27, 28].map(day => (
                             <button 
                              key={day} 
                              onClick={() => setSelectedDate(day)}
                              className={`flex-shrink-0 w-16 h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${selectedDate === day ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20'}`}
                             >
                                <span className="text-[10px] font-bold uppercase">Apr</span>
                                <span className="text-xl font-black">{day}</span>
                             </button>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-text-muted mb-2">
                           <Clock size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Morning & Evening Slots</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                           {["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM", "08:30 PM"].map(time => (
                             <button 
                              key={time} 
                              onClick={() => setSelectedTime(time)}
                              className={`py-4 rounded-xl border text-[10px] font-black uppercase transition-all ${selectedTime === time ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                             >
                                {time}
                             </button>
                           ))}
                        </div>
                      </div>

                      <button 
                        onClick={handleConfirmBooking}
                        disabled={!selectedDate || !selectedTime}
                        className="w-full py-5 bg-accent text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                         Confirm Booking <CheckCircle2 size={18} />
                      </button>
                    </motion.div>
                  )}
                 </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
