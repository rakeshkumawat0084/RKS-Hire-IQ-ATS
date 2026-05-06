import { 
  TrendingUp, 
  Users, 
  Zap, 
  MessageSquare,
  ArrowUpRight,
  MoreVertical,
  BarChart3 as BarChart3Icon,
  ShieldCheck,
  Cpu,
  Database,
  Download,
  FileText,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';

const barData = [
  { name: 'Mon', leads: 40, users: 24 },
  { name: 'Tue', leads: 30, users: 13 },
  { name: 'Wed', leads: 20, users: 98 },
  { name: 'Thu', leads: 27, users: 39 },
  { name: 'Fri', leads: 18, users: 48 },
  { name: 'Sat', leads: 23, users: 38 },
  { name: 'Sun', leads: 34, users: 43 },
];

const pieData = [
  { name: 'Google Search', value: 400 },
  { name: 'Direct', value: 300 },
  { name: 'Referral', value: 300 },
  { name: 'Social', value: 200 },
];

const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b'];

const signupData = [
  { name: 'Apr 19', signups: 12 },
  { name: 'Apr 20', signups: 18 },
  { name: 'Apr 21', signups: 15 },
  { name: 'Apr 22', signups: 25 },
  { name: 'Apr 23', signups: 22 },
  { name: 'Apr 24', signups: 30 },
  { name: 'Apr 25', signups: 28 },
];

export default function AdminDashboard() {
  const [adminStats, setAdminStats] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/leads')
        ]);
        setAdminStats(statsRes.data);
        setRecentLeads(leadsRes.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
    if (recentLeads.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    // Creating CSV structure from latest leads
    const headers = ["Name", "Email", "Source", "Status", "Date"];
    const rows = recentLeads.map(lead => [
      lead.name || 'N/A',
      lead.email || 'N/A',
      lead.source || 'Inquiry',
      lead.status || 'New',
      new Date(lead.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "admin_leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateReport = () => {
    window.print();
  };

  const stats = [
    { label: 'Total Leads', value: adminStats?.leadCount?.toString() || 'Loading...', icon: <Zap className="text-accent" />, color: 'bg-accent/10' },
    { label: 'Total Users', value: adminStats?.userCount?.toString() || 'Loading...', icon: <Users className="text-blue-400" />, color: 'bg-blue-400/10' },
    { label: 'Total Resumes', value: adminStats?.resumeCount?.toString() || 'Loading...', icon: <TrendingUp className="text-success" />, color: 'bg-success/10' },
    { label: 'Total Interviews', value: adminStats?.interviewCount?.toString() || 'Loading...', icon: <MessageSquare className="text-yellow-400" />, color: 'bg-yellow-400/10' },
  ];

  return (
    <div className="space-y-6 md:space-y-10 relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/4"></div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
           <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">Performance Overview</h1>
           <p className="text-text-secondary text-sm font-medium opacity-70">Global metrics and real-time system status.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <button 
             onClick={handleExportCSV}
             className="flex-1 md:flex-initial px-4 md:px-6 py-3 bg-bg-secondary hover:bg-bg-hover text-text-primary rounded-xl text-xs font-bold border border-white/5 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
           >
             <Download size={16} /> <span className="hidden xs:inline uppercase tracking-widest">Export CSV</span><span className="xs:hidden">Export</span>
           </button>
           <button 
             onClick={handleGenerateReport}
             className="flex-1 md:flex-initial px-4 md:px-6 py-3 bg-accent rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-accent/20 flex items-center justify-center gap-2 hover:bg-accent/90 transition-all active:scale-95 text-white"
           >
             <FileText size={16} /> <span className="hidden xs:inline">Generate Report</span><span className="xs:hidden">Report</span>
           </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
        {stats.map((stat, i) => (
          <div key={i} className="card-modern p-5 md:p-8 rounded-3xl border border-white/5 group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${stat.color} flex items-center justify-center border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all`}>
                {stat.icon}
              </div>
              <div className="p-1.5 bg-success/10 rounded-lg">
                <TrendingUp size={14} className="text-success" />
              </div>
            </div>
            <div className="text-2xl md:text-4xl font-black mb-1 tracking-tight text-text-primary italic">{stat.value}</div>
            <div className="text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest opacity-60">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 relative z-10">
        {/* Growth Trends */}
        <div className="card-modern p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] min-w-0">
          <div className="flex justify-between items-center mb-6 md:mb-10">
             <h3 className="text-lg md:text-xl font-black italic uppercase tracking-wider text-text-primary">User Activity Vector</h3>
             <select className="bg-bg-secondary border border-white/5 text-text-primary rounded-lg px-3 py-1.5 text-[10px] md:text-xs outline-none input-glow font-bold uppercase tracking-widest">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
             </select>
          </div>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} className="text-text-muted" />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} className="text-text-muted" />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(14, 17, 26, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '16px',
                    color: 'var(--text-primary)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
                />
                <Bar dataKey="users" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="leads" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Signups Line Chart */}
        <div className="card-modern p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] min-w-0">
          <div className="flex justify-between items-center mb-6 md:mb-10">
             <h3 className="text-lg md:text-xl font-black italic uppercase tracking-wider text-text-primary">Registrations Flow</h3>
             <div className="w-10 h-10 rounded-full bg-success/5 flex items-center justify-center border border-success/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <TrendingUp size={20} className="text-success" />
             </div>
          </div>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={signupData}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} className="text-text-muted" />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} className="text-text-muted" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(14, 17, 26, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '16px',
                  }}
                />
                <Area type="monotone" dataKey="signups" stroke="var(--accent)" strokeWidth={4} fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
        {/* Source Pie */}
        <div className="lg:col-span-1 card-modern p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] flex flex-col items-center min-w-0">
            <h3 className="text-lg md:text-xl font-black italic uppercase tracking-wider mb-6 md:mb-10 self-start text-text-primary">Source Distribution</h3>
            <div className="h-[250px] w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ 
                             backgroundColor: 'rgba(14, 17, 26, 0.95)', 
                             backdropFilter: 'blur(10px)',
                             border: '1px solid rgba(255, 255, 255, 0.1)', 
                             borderRadius: '16px',
                           }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2 md:space-y-4 mt-6">
                {pieData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs transition-all hover:translate-x-1 group">
                        <div className="flex items-center gap-3">
                           <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[i], color: COLORS[i] }}></div>
                           <span className="text-text-secondary font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100">{d.name}</span>
                        </div>
                        <span className="font-black text-text-primary italic">{(d.value / 12).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>

        {/* System Health */}
        <div className="lg:col-span-2 card-modern p-6 md:p-10 rounded-2xl md:rounded-[2.5rem]">
             <h3 className="text-lg md:text-xl font-black italic uppercase tracking-wider mb-6 md:mb-8 text-text-primary text-gradient">Core System Status</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "API Gateway", status: "Operational", color: "text-success", icon: <Zap size={14} />, detail: "45ms latency" },
                  { label: "Auth Service", status: "Operational", color: "text-success", icon: <ShieldCheck size={14} />, detail: "0.01% error rate" },
                  { label: "AI Engine", status: "High Load", color: "text-yellow-500", icon: <Cpu size={14} />, detail: "89% utilization" },
                  { label: "Database", status: "Operational", color: "text-success", icon: <Database size={14} />, detail: "Healthy" }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 md:p-5 bg-bg-secondary/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-accent/30 transition-all group shadow-sm">
                     <div className="flex items-center gap-3 md:gap-4">
                        <div className={`p-2.5 md:p-3 rounded-xl bg-bg-primary border border-white/5 shadow-inner ${s.color} group-hover:scale-110 transition-transform`}>
                           {s.icon}
                        </div>
                        <div>
                          <div className="text-sm font-black uppercase tracking-tight text-text-primary italic">{s.label}</div>
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-50">{s.detail}</div>
                        </div>
                     </div>
                     <div className="text-right">
                       <div className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${s.color} mb-1`}>{s.status}</div>
                       <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full ${s.status === 'Operational' ? 'bg-success' : 'bg-yellow-500'}`} style={{ width: s.status === 'Operational' ? '100%' : '80%' }}></div>
                       </div>
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-8 p-6 bg-accent/5 rounded-[2rem] border border-accent/20 flex items-center justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center glow-pulse">
                    <Zap className="text-accent fill-accent" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest italic">All systems nominal</h4>
                    <p className="text-xs text-text-muted font-bold opacity-60 uppercase">Last checked 2 minutes ago</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="px-5 py-2 bg-accent/20 hover:bg-accent text-accent hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10"
                >
                  Full Audit
                </button>
             </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card-modern rounded-[2.5rem] overflow-hidden relative z-10">
        <div className="p-8 md:p-10 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card/40 backdrop-blur-md">
           <div>
             <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-text-primary">Live Activity Feed</h3>
             <p className="text-text-muted text-xs font-bold uppercase tracking-widest opacity-60 mt-1">Real-time system interactions</p>
           </div>
           <Link to="/admin/leads" className="px-6 py-2.5 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-full text-xs font-black uppercase tracking-widest transition-all border border-accent/20 flex items-center gap-2 group">
             Global Registry <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
           </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-bg-secondary/40 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic">
                <tr>
                  <th className="px-4 py-4 sm:px-6 sm:py-5">Identity</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5">Interaction</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5">Integrity Status</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5">Timestamp</th>
                  <th className="px-4 py-4 sm:px-6 sm:py-5"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-bg-card/20 backdrop-blur-sm">
                  {recentLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 sm:px-6 sm:py-16 text-center text-text-muted italic font-bold uppercase tracking-widest opacity-40">Zero interactions detected.</td>
                    </tr>
                  ) : recentLeads.map((row, i) => (
                    <tr key={row._id} className="hover:bg-accent/5 transition-all group cursor-pointer" onClick={() => navigate('/admin/leads')}>
                        <td className="px-4 py-5 sm:px-6 sm:py-8">
                          <div className="font-black text-text-primary uppercase tracking-tight italic text-base">{row.name}</div>
                          <div className="text-xs text-text-muted font-bold opacity-60 tracking-wider">{row.email}</div>
                        </td>
                        <td className="px-4 py-5 sm:px-6 sm:py-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-50">Event</span>
                            <span className="text-sm font-bold text-text-secondary italic">Inquiry submitted from {row.source}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 sm:px-6 sm:py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] italic shadow-sm flex items-center w-fit gap-2 ${
                            row.status === 'qualified' ? 'bg-success/20 text-success border border-success/30' : 
                            row.status === 'contacted' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-accent/20 text-accent border border-accent/30'
                          }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                row.status === 'qualified' ? 'bg-success' : 
                                row.status === 'contacted' ? 'bg-blue-400' :
                                'bg-accent shadow-[0_0_8px_rgba(99,102,241,1)]'
                              }`}></span>
                              {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-5 sm:px-6 sm:py-8">
                          <div className="flex items-center gap-2 text-text-muted opacity-60">
                            <Clock size={12} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{formatDate(new Date(row.createdAt))}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 sm:px-6 sm:py-8 text-right">
                          <div className="p-3 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:bg-accent transition-all text-accent group-hover:text-white group-hover:rotate-12">
                            <ArrowUpRight size={20} />
                          </div>
                        </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
