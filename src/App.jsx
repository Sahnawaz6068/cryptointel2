import React, { useState, useEffect } from 'react';
// Changed to HashRouter to fix URL errors in sandboxed environments
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { BarChart, Search, Shield, Bell, LayoutDashboard, Database, Copy, AlertTriangle, ExternalLink, Filter, X, Eye, ArrowLeft, MoreHorizontal, Plus, FileDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Sankey } from 'recharts';

// --- Mock Data ---
const mockData = {
  kpis: {
    totalAddresses: "1,345,678",
    highRiskEntities: "2,987",
    newAddresses24h: "432",
    scraperStatus: 'Active'
  },
  illicitActivity: [
    { name: 'Scam', value: 450, color: '#EF4444' },
    { name: 'Money Laundering', value: 300, color: '#A855F7' },
    { name: 'Darknet Market', value: 150, color: '#F97316' },
    { name: 'Terror Financing', value: 50, color: '#DC2626' },
    { name: 'Other', value: 50, color: '#6B7280' },
  ],
  threatTimeline: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleString('en-US', { month: 'short', day: 'numeric' }),
      scam: Math.floor(Math.random() * 20 + 10),
      laundering: Math.floor(Math.random() * 15 + 5),
      darknet: Math.floor(Math.random() * 10 + 2),
    };
  }),
  recentAlerts: [
    { id: 1, address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', category: 'Scam', source: 'darkweb-forum-1.onion', time: '2m ago' },
    { id: 2, address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', category: 'Money Laundering', source: 'CryptoScamDB.org', time: '15m ago' },
    { id: 3, address: '44d21i361aV537b9g71b3e9aB6CEc5b3c5a639bB', category: 'Darknet Market', source: 'dark-market-alpha.onion', time: '1h ago' },
    { id: 4, address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', category: 'Terror Financing', source: 'News Outlet', time: '3h ago' },
    { id: 5, address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', category: 'Scam', source: 'Telegram Channel', time: '5h ago' },
  ],
  investigationResults: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    address: `bc1q${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`,
    cryptoType: ['BTC', 'ETH', 'XMR'][Math.floor(Math.random() * 3)],
    riskScore: (Math.random() * 8 + 2).toFixed(1),
    category: ['Scam', 'Money Laundering', 'Darknet Market', 'Suspicious', 'Terror Financing'][Math.floor(Math.random() * 5)],
    pii: 'Partial Match',
    source: ['darkweb-forum-1.onion', 'Telegram Channel', 'CryptoScamDB.org', 'News Outlet'][Math.floor(Math.random() * 4)],
    lastScan: new Date(Date.now() - Math.random() * 1000000000).toLocaleString(),
    confidence: (Math.random() * 30 + 70).toFixed(1),
  })),
  addressDetail: {
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    riskScore: 9.8,
    category: 'Terror Financing',
    pii: {
      name: 'John Doe (Alias)',
      phone: '+1-XXX-XXX-5678',
      email: 'j.doe***@proton.me',
      bankInfo: 'Bank of S.A. - Acct# ...9876'
    },
    summary: { received: '15.4 BTC', sent: '15.1 BTC', balance: '0.3 BTC' },
    sourceHistory: [
      { date: '2024-07-25', source: 'intelligence-report.gov' },
      { date: '2024-07-22', source: 'dark-web-forum-alpha.onion' },
      { date: '2024-07-19', source: 'telegram-channel-xyz' },
    ],
    transactionFlow: {
      nodes: [
        { name: 'Source A (Unverified)' }, { name: 'Source B (High-Risk)' }, { name: 'Suspect Wallet' },
        { name: 'Destination X (Mixer)' }, { name: 'Destination Y (Exchange)' }, { name: 'Destination Z (Unverified)' }
      ],
      links: [
        { source: 0, target: 2, value: 8 }, { source: 1, target: 2, value: 7.4 }, { source: 2, target: 3, value: 9.1 },
        { source: 2, target: 4, value: 3 }, { source: 2, target: 5, value: 3 },
      ]
    }
  },
  dataSources: [
      { id: 1, name: 'darkweb-forum-1.onion', type: 'Darknet Forum', status: 'Active', lastScraped: '2 min ago' },
      { id: 2, name: 'CryptoScamDB.org', type: 'Public Database', status: 'Active', lastScraped: '15 min ago' },
      { id: 3, name: 'Telegram Intel Channel', type: 'Social Media', status: 'Active', lastScraped: '1 hour ago' },
      { id: 4, name: 'dark-market-alpha.onion', type: 'Darknet Market', status: 'Offline', lastScraped: '5 hours ago' },
  ]
};

// Main App component wrapper with Router
const AppWrapper = () => (
  <Router>
    <CryptoIntelApp />
  </Router>
);

// --- Main App Component ---
const CryptoIntelApp = () => {
  return (
    <div className="bg-gray-100 text-gray-800 font-sans flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50/50">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/investigate" element={<InvestigateView />} />
          <Route path="/database" element={<DatabaseView />} />
          <Route path="/address/:addressId" element={<AddressDetailView />} />
          {/* Add a route for alerts page */}
          <Route path="/alerts" element={<AlertsView />} /> 
        </Routes>
      </main>
    </div>
  );
};

// --- Reusable Components ---
const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { id: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'investigate', path: '/investigate', icon: Search, label: 'Investigate' },
    { id: 'database', path: '/database', icon: Database, label: 'Database' },
    { id: 'alerts', path: '/alerts', icon: Bell, label: 'Alerts' },
  ];

  return (
    <nav className="w-16 hover:w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out group shadow-lg z-10">
       <div className="flex items-center h-20 px-4 border-b border-gray-200">
        <Shield className="text-cyan-600 w-8 h-8 flex-shrink-0" />
        <span className="text-xl font-bold ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-900">Crypto-Intel</span>
      </div>
      <ul className="flex-1 mt-4">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.id}>
              <Link to={item.path} className={`flex items-center h-12 px-4 text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 relative ${isActive ? 'bg-cyan-50 text-cyan-600' : ''}`}>
                {isActive && <span className="absolute left-0 top-0 h-full w-1 bg-cyan-500 rounded-r-full"></span>}
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://placehold.co/40x40/E2E8F0/475569?text=SH" alt="User" className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="font-semibold text-sm text-gray-700">Sahnawaz Hussain</p>
            <p className="text-xs text-gray-500">Investigator</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

const KpiCard = ({ title, value, icon: Icon, color = 'text-cyan-600' }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center space-x-4 shadow-sm">
        <div className={`p-3 rounded-full bg-gray-100 ${color}`}><Icon className="w-6 h-6" /></div>
        <div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div>
    </div>
);

const AlertItem = ({ alert }) => {
    const categoryColor = {
        'Scam': 'text-red-600',
        'Money Laundering': 'text-purple-600',
        'Darknet Market': 'text-orange-600',
        'Terror Financing': 'text-red-800'
    };
    return (
        <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100">
            <div className="flex items-center space-x-3 overflow-hidden">
                <AlertTriangle className={`${categoryColor[alert.category]} w-5 h-5 flex-shrink-0`} />
                <div>
                     <p className="font-mono text-sm text-gray-700 truncate">{alert.address}</p>
                     <p className={`text-xs font-bold ${categoryColor[alert.category]}`}>{alert.category}</p>
                </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs text-gray-600 truncate max-w-[150px]">{alert.source}</p>
                <p className="text-xs text-gray-500">{alert.time}</p>
            </div>
        </div>
    );
};


// --- Page Views ---
const DashboardView = () => (
    <div className="space-y-6 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Total Addresses Tracked" value={mockData.kpis.totalAddresses} icon={Database} />
            <KpiCard title="High-Risk Entities" value={mockData.kpis.highRiskEntities} icon={AlertTriangle} color="text-red-600" />
            <KpiCard title="New Addresses (24h)" value={mockData.kpis.newAddresses24h} icon={BarChart} />
            <KpiCard title="Scraper Status" value={mockData.kpis.scraperStatus} icon={Shield} color={mockData.kpis.scraperStatus === 'Active' ? 'text-green-600' : 'text-red-600'} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Threat Discovery Timeline</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockData.threatTimeline} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                         <defs><linearGradient id="colorScam" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/></linearGradient><linearGradient id="colorLaundering" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/><stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="date" stroke="#6B7280" fontSize={12} /><YAxis stroke="#6B7280" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} /><Legend /><Area type="monotone" dataKey="scam" stroke="#EF4444" fill="url(#colorScam)" name="Scam"/><Area type="monotone" dataKey="laundering" stroke="#A855F7" fill="url(#colorLaundering)" name="Laundering"/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Illicit Activity Breakdown</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={mockData.illicitActivity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                            {mockData.illicitActivity.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                         <Legend formatter={(value, entry) => <span className="text-gray-600">{value}</span>} /><Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentAlerts />
            <SourceHotspots />
        </div>
    </div>
);

const AlertsView = () => (
    <div className="space-y-6 animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <RecentAlerts />
    </div>
);


const RecentAlerts = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent High-Risk Alerts</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
            {mockData.recentAlerts.map(alert => <AlertItem key={alert.id} alert={alert} />)}
        </div>
    </div>
);

const SourceHotspots = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Intelligence Sources</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockData.dataSources
                .sort((a, b) => b.status.localeCompare(a.status)) // Show active first
                .map(source => (
                <div key={source.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                    <div>
                        <p className="font-semibold text-gray-700 truncate max-w-xs">{source.name}</p>
                        <p className="text-xs text-gray-500">{source.type}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                         <div className="flex items-center gap-2 justify-end">
                             <span className={`w-3 h-3 rounded-full ${source.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                             <span className="text-sm text-gray-600">{source.status}</span>
                         </div>
                         <p className="text-xs text-gray-500">Last: {source.lastScraped}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const InvestigateView = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        searchTerm: '',
        categories: [],
        riskScore: 0,
    });
    const [results, setResults] = useState(mockData.investigationResults);

    useEffect(() => {
        let filteredData = mockData.investigationResults;

        if (filters.searchTerm) {
            filteredData = filteredData.filter(item =>
                item.address.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        if (filters.categories.length > 0) {
            filteredData = filteredData.filter(item =>
                filters.categories.includes(item.category)
            );
        }

        if (filters.riskScore > 0) {
            filteredData = filteredData.filter(item =>
                parseFloat(item.riskScore) >= filters.riskScore
            );
        }

        setResults(filteredData);
    }, [filters]);
    
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleCategoryChange = (category) => {
        setFilters(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const resetFilters = () => {
        setFilters({ searchTerm: '', categories: [], riskScore: 0 });
    };
    
    const handleExport = (format) => {
        const dataToExport = results;
        let fileContent = '';
        let fileName = '';

        if (format === 'json') {
            fileContent = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
            fileName = "crypto_intel_export.json";
        } else if (format === 'csv') {
            if (dataToExport.length === 0) return;
            const headers = Object.keys(dataToExport[0]).join(',');
            const rows = dataToExport.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n');
            fileContent = `data:text/csv;charset=utf-8,${encodeURIComponent(`${headers}\n${rows}`)}`;
            fileName = "crypto_intel_export.csv";
        }

        const link = document.createElement("a");
        link.href = fileContent;
        link.download = fileName;
        link.click();
    };
    
    const onAddressSelect = (address) => {
        navigate(`/address/${address.id}`);
    };

    return (
        <div className="h-full flex flex-col animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Investigation Hub</h1>
                <div className="flex gap-2">
                    <button onClick={() => handleExport('csv')} className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300">
                        <FileDown className="w-4 h-4 mr-2" /> Export CSV
                    </button>
                    <button onClick={() => handleExport('json')} className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300">
                        <FileDown className="w-4 h-4 mr-2" /> Export JSON
                    </button>
                </div>
            </div>
            <div className="flex-1 flex gap-6 overflow-hidden">
                <FilterPanel 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onCategoryChange={handleCategoryChange}
                    onReset={resetFilters}
                />
                <ResultsTable results={results} onAddressSelect={onAddressSelect} />
            </div>
        </div>
    );
};

const FilterPanel = ({ filters, onFilterChange, onCategoryChange, onReset }) => (
    <div className="w-full max-w-xs bg-white p-6 rounded-lg border border-gray-200 flex flex-col shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Filters</h2>
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 -mr-2">
            <div>
                <label className="text-sm font-medium text-gray-700">Address / PII</label>
                <input 
                    type="text" 
                    placeholder="Search address..." 
                    className="mt-1 w-full bg-gray-50 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={filters.searchTerm}
                    onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Crime Type</label>
                <div className="space-y-2">
                    {['Scam', 'Money Laundering', 'Darknet Market', 'Terror Financing', 'Suspicious'].map(type => (
                        <label key={type} className="flex items-center text-sm text-gray-600">
                            <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded bg-gray-200 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                checked={filters.categories.includes(type)}
                                onChange={() => onCategoryChange(type)}
                            />
                            <span className="ml-2">{type}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700">Min. Risk Score: {filters.riskScore}</label>
                <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={filters.riskScore}
                    onChange={(e) => onFilterChange('riskScore', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" 
                />
            </div>
        </div>
        <div className="mt-6 flex gap-2">
            <button onClick={onReset} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300">Reset</button>
        </div>
    </div>
);

const ResultsTable = ({ results, onAddressSelect }) => {
    const getCategoryChip = (category) => {
        const styles = { 'Scam': 'bg-red-100 text-red-700', 'Money Laundering': 'bg-purple-100 text-purple-700', 'Darknet Market': 'bg-orange-100 text-orange-700', 'Terror Financing': 'bg-red-200 text-red-800 font-bold', 'Suspicious': 'bg-yellow-100 text-yellow-700',};
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[category] || 'bg-gray-100 text-gray-700'}`}>{category}</span>;
    };
    return (
        <div className="bg-white rounded-lg border border-gray-200 flex-1 overflow-hidden flex flex-col shadow-sm">
            <div className="overflow-y-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Address</th>
                            <th scope="col" className="px-6 py-3">Risk</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Last Scan</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {results.length > 0 ? results.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs text-gray-600 flex items-center">
                                    <span className="truncate max-w-[200px]">{item.address}</span>
                                    <Copy className="w-3 h-3 ml-2 cursor-pointer hover:text-gray-900" onClick={() => document.execCommand('copy', true, item.address)} />
                                </td>
                                <td className="px-6 py-4 font-bold" style={{ color: `hsl(${100 - item.riskScore * 10}, 60%, 40%)` }}>{item.riskScore}</td>
                                <td className="px-6 py-4">{getCategoryChip(item.category)}</td>
                                <td className="px-6 py-4">{item.lastScan}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onAddressSelect(item)} className="p-1 hover:bg-gray-200 rounded-full">
                                        <Eye className="w-4 h-4 text-cyan-600" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center py-10 text-gray-500">No results found for your query.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AddressDetailView = () => {
    const navigate = useNavigate();
    const { addressId } = useParams();
    
    // In a real app, you'd fetch this data. Here we find it in mock data.
    const detail = mockData.investigationResults.find(item => item.id === parseInt(addressId)) || mockData.addressDetail;
    
    const onBack = () => navigate('/investigate');

    return (
        <div className="space-y-6 animate-fadeIn">
            <button onClick={onBack} className="flex items-center text-sm text-cyan-600 hover:text-cyan-700 font-medium"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Investigations</button>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                 <h1 className="text-xl font-bold font-mono break-all text-gray-800">{detail.address}</h1>
                 <div className="mt-2 flex items-center gap-2"><span className="px-3 py-1 text-sm font-bold rounded-full bg-red-200 text-red-800">{detail.category}</span><span className="px-3 py-1 text-sm font-bold rounded-full bg-red-100 text-red-700">Risk Score: {detail.riskScore}</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                     <div className="bg-white p-6 rounded-lg border border-red-300 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center text-red-700"><AlertTriangle className="w-5 h-5 mr-2"/> Linked PII</h2>
                        <p className="text-xs text-yellow-800 mb-4 bg-yellow-50 p-2 rounded">Access to PII is logged and restricted to authorized personnel.</p>
                        <div className="space-y-2 text-sm text-gray-600"><p><strong>Name:</strong> {mockData.addressDetail.pii.name}</p><p><strong>Phone:</strong> {mockData.addressDetail.pii.phone}</p><p><strong>Email:</strong> {mockData.addressDetail.pii.email}</p></div>
                     </div>
                </div>
                 <div className="md:col-span-2 space-y-6">
                     <div className="bg-white p-6 rounded-lg border border-gray-200 h-[350px] shadow-sm">
                         <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Flow</h2>
                         <ResponsiveContainer width="100%" height="90%"><Sankey data={mockData.addressDetail.transactionFlow} node={{ stroke: '#0891B2', strokeWidth: 2, fill: '#F0F9FF' }} link={{ stroke: '#9CA3AF', strokeOpacity: 0.5, strokeWidth: '1px' }} width={700} height={280}><Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}/></Sankey></ResponsiveContainer>
                     </div>
                 </div>
            </div>
        </div>
    );
};

const DatabaseView = () => {
    const navigate = useNavigate();
    const onAddressSelect = (address) => {
        navigate(`/address/${address.id}`);
    };
    return (
        <div className="space-y-6 animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900">Data Management & Exploration</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataSourceManager />
                <AdvancedQueryBuilder />
            </div>
            <DatabaseResultsTable onAddressSelect={onAddressSelect} />
        </div>
    );
};

const DataSourceManager = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sources, setSources] = useState(mockData.dataSources);

    const handleAddSource = (newSource) => {
        const sourceWithDefaults = {
            id: sources.length + 1,
            status: 'Pending',
            lastScraped: 'Never',
            ...newSource
        };
        setSources([sourceWithDefaults, ...sources]);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Data Source Manager</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded transition duration-300"><Plus className="w-4 h-4 mr-2" /> Add Source</button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {sources.map(source => (
                    <div key={source.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                        <div><p className="font-semibold text-gray-700">{source.name}</p><p className="text-xs text-gray-500">{source.type}</p></div>
                        <div className="text-right">
                             <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${source.status === 'Active' ? 'bg-green-500' : source.status === 'Offline' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                <span className="text-sm text-gray-600">{source.status}</span>
                             </div>
                             <p className="text-xs text-gray-500">Last Scraped: {source.lastScraped}</p>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && <AddSourceModal onClose={() => setIsModalOpen(false)} onAddSource={handleAddSource} />}
        </div>
    );
};

const AddSourceModal = ({ onClose, onAddSource }) => {
    const [url, setUrl] = useState('');
    const [type, setType] = useState('Public Database');

    const handleSubmit = () => {
        if (url && type) {
            onAddSource({ name: url, type });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Add New Data Source</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><X className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Source URL</label>
                        <input value={url} onChange={(e) => setUrl(e.target.value)} type="text" placeholder="https://... or darkweb-forum.onion" className="mt-1 w-full bg-gray-50 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Source Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full bg-gray-50 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option>Public Database</option>
                            <option>Social Media</option>
                            <option>Darknet Forum</option>
                            <option>Darknet Market</option>
                            <option>News Outlet</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300">Cancel</button>
                    <button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-300">Add Source</button>
                </div>
            </div>
        </div>
    );
};

const AdvancedQueryBuilder = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Query Builder</h2>
        <div className="space-y-3">
             <div className="flex gap-2 items-center"><select className="flex-1 bg-gray-50 p-2 rounded border border-gray-300 text-sm text-gray-800"><option>Category</option><option>Risk Score</option><option>Source</option></select><select className="flex-1 bg-gray-50 p-2 rounded border border-gray-300 text-sm text-gray-800"><option>Equals</option><option>Contains</option><option>Greater Than</option></select><input type="text" placeholder="Value..." className="flex-1 bg-gray-50 p-2 rounded border border-gray-300 text-sm" /></div>
             <div className="flex items-center justify-center"><button className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-300">AND</button></div>
             <div className="flex gap-2 items-center"><select className="flex-1 bg-gray-50 p-2 rounded border border-gray-300 text-sm text-gray-800"><option>Risk Score</option><option>Category</option><option>Source</option></select><select className="flex-1 bg-gray-50 p-2 rounded border border-gray-300 text-sm text-gray-800"><option>Greater Than</option><option>Equals</option><option>Contains</option></select><input type="text" placeholder="8.0" className="flex-1 bg-gray-50 p-2 rounded border border-gray-300 text-sm" /></div>
        </div>
        <button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-300">Run Query</button>
    </div>
);

const DatabaseResultsTable = ({ onAddressSelect }) => {
    const getCategoryChip = (category) => {
        const styles = { 'Scam': 'bg-red-100 text-red-700','Money Laundering': 'bg-purple-100 text-purple-700', 'Darknet Market': 'bg-orange-100 text-orange-700', 'Terror Financing': 'bg-red-200 text-red-800 font-bold', 'Suspicious': 'bg-yellow-100 text-yellow-700',};
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[category] || 'bg-gray-100 text-gray-700'}`}>{category}</span>;
    };
    return (<div className="bg-white rounded-lg border border-gray-200 flex-1 overflow-hidden flex flex-col shadow-sm"><div className="p-4 flex justify-between items-center border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Database Explorer</h2><div className="flex items-center gap-2"><span className="text-sm text-gray-600">1-25 of 1,345,678</span><button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded transition duration-300 text-xs">Export Selected</button></div></div><div className="overflow-x-auto"><table className="w-full text-sm text-left text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="p-4"><input type="checkbox" className="h-4 w-4 rounded bg-gray-200 border-gray-300 text-cyan-600 focus:ring-cyan-500" /></th><th scope="col" className="px-6 py-3">Address</th><th scope="col" className="px-6 py-3">Category</th><th scope="col" className="px-6 py-3">Risk</th><th scope="col" className="px-6 py-3">Confidence</th><th scope="col" className="px-6 py-3">Source</th><th scope="col" className="px-6 py-3">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{mockData.investigationResults.slice(0, 15).map(item => (<tr key={item.id} className="hover:bg-gray-50"><td className="p-4"><input type="checkbox" className="h-4 w-4 rounded bg-gray-200 border-gray-300 text-cyan-600 focus:ring-cyan-500" /></td><td className="px-6 py-4 font-mono text-xs text-gray-600 flex items-center"><span className="truncate max-w-[150px]">{item.address}</span><Copy className="w-3 h-3 ml-2 cursor-pointer hover:text-gray-900" onClick={() => document.execCommand('copy', true, item.address)} /></td><td className="px-6 py-4">{getCategoryChip(item.category)}</td><td className="px-6 py-4 font-bold" style={{ color: `hsl(${100 - item.riskScore * 10}, 60%, 40%)` }}>{item.riskScore}</td><td className="px-6 py-4 text-cyan-600 font-medium">{item.confidence}%</td><td className="px-6 py-4 text-xs">{item.source}</td><td className="px-6 py-4"><button onClick={() => onAddressSelect(item)} className="p-1 hover:bg-gray-200 rounded-full"><Eye className="w-4 h-4 text-cyan-600" /></button></td></tr>))}</tbody></table></div><div className="p-4 border-t border-gray-200 text-xs flex justify-between items-center text-gray-600"><span>Page 1 of 53,828</span><div className="flex gap-1"><button className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">Previous</button><button className="px-2 py-1 rounded bg-cyan-600 text-white hover:bg-cyan-700">Next</button></div></div></div>);
}

export default AppWrapper;

