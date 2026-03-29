import React, { useState, useEffect, useRef } from 'react';
import './HostelSmartOS.css';

// ============================================================
// MOCK DATA 
// ============================================================
const DEMO_ARTICLES = {
  general:[
    {title:"G20 Leaders Reach Historic Climate Agreement on Carbon Emissions",description:"World leaders at the G20 summit have agreed to cut carbon emissions by 50% before 2040.",source:{name:"Reuters"},publishedAt:new Date().toISOString(),url:"#"},
    {title:"New UN Report: Global Poverty Rates Hit Record Low Since 1990",description:"The United Nations released a comprehensive report showing extreme global poverty has dropped to under 5%.",source:{name:"UN News"},publishedAt:new Date().toISOString(),url:"#"},
  ],
  technology:[
    {title:"OpenAI Launches GPT-5 with Real-Time Reasoning Capabilities",description:"OpenAI's latest model achieves near-human reasoning on complex scientific and mathematical tasks.",source:{name:"TechCrunch"},publishedAt:new Date().toISOString(),url:"#"},
    {title:"India's Semiconductor Industry Surges: ₹2 Lakh Crore Investment",description:"Major global chipmakers commit to building fabrication plants in India.",source:{name:"Economic Times"},publishedAt:new Date().toISOString(),url:"#"},
  ]
};

const HOSTEL_ROOMS = [
  {id:'204',type:'AC Double',floor:2,rent:'₹6,500/mo',near:'Study Hall',status:'occupied'},
  {id:'209',type:'AC Single',floor:2,rent:'₹8,000/mo',near:'Library',status:'available'},
  {id:'215',type:'Non-AC',floor:2,rent:'₹4,000/mo',near:'Garden',status:'maintenance'},
  {id:'101',type:'AC Suite',floor:1,rent:'₹10,000/mo',near:'Reception',status:'occupied'},
  {id:'401',type:'AC Double',floor:4,rent:'₹6,500/mo',near:'Terrace',status:'available'},
  {id:'312',type:'Non-AC',floor:3,rent:'₹4,000/mo',near:'Mess Hall',status:'available'},
];

const HOSTEL_EVENTS = [
  {title:'Coding Hackathon',when:'Sat, Mar 29 · 10:00 AM',where:'Common Hall',icon:'💻',tag:'Tech',tagClass:'tech'},
  {title:'Cultural Night',when:'Sun, Mar 30 · 6:00 PM',where:'Open Air Stage',icon:'🎭',tag:'Culture',tagClass:'culture'},
  {title:'Yoga Morning',when:'Wed, Apr 2 · 7:00 AM',where:'Terrace Garden',icon:'🧘',tag:'Health',tagClass:'health'},
];

// ============================================================
// COMPONENTS
// ============================================================
const Sidebar = ({ activePanel, setActivePanel }) => {
  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard', section: 'Main' },
    { id: 'rooms', icon: '🛏', label: 'Rooms', badge: { text: '12', type: 'green' }, section: 'Main' },
    { id: 'events', icon: '📅', label: 'Events', badge: { text: '3', type: 'blue' }, section: 'Main' },
    { id: 'news', icon: '🌍', label: 'Global News', badge: { text: 'Live' }, section: 'Information' },
    { id: 'digest', icon: '📰', label: 'Daily Digest', section: 'Information' },
    { id: 'ai', icon: '🤖', label: 'AI Assistant', section: 'Information' },
    { id: 'preferences', icon: '⚙️', label: 'Preferences', section: 'Settings' },
    { id: 'analytics', icon: '📊', label: 'Analytics', section: 'Settings' },
  ];

  const renderSection = (sectionName) => (
    <div className="nav-section" key={sectionName}>
      <div className="nav-label">{sectionName}</div>
      {navItems.filter(i => i.section === sectionName).map(item => (
        <div key={item.id} className={`nav-item ${activePanel === item.id ? 'active' : ''}`} onClick={() => setActivePanel(item.id)}>
          <span className="icon">{item.icon}</span> {item.label}
          {item.badge && <span className={`nav-badge ${item.badge.type || ''}`}>{item.badge.text}</span>}
        </div>
      ))}
    </div>
  );

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">🏠</div>
        <div>
          <div className="logo-text">HostelOS</div>
          <div className="logo-sub">v2.4.1 · SMART</div>
        </div>
      </div>
      <nav className="nav-menu">
        {['Main', 'Information', 'Settings'].map(renderSection)}
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">RK</div>
          <div className="user-info">
            <div className="user-name">Rahul Kumar</div>
            <div className="user-role">Room 204 · Block A</div>
          </div>
          <span style={{color:'var(--text3)',fontSize:'14px'}}>⋯</span>
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ activePanel, setActivePanel }) => {
  const titles = {
    dashboard: <>Dashboard <span>Overview</span></>, rooms: <>Room <span>Management</span></>,
    events: <>Hostel <span>Events</span></>, news: <>Global <span>News Hub</span></>,
    ai: <>AI <span>Assistant</span></>
  };
  return (
    <div className="topbar">
      <div className="topbar-title">{titles[activePanel] || <span style={{textTransform:'capitalize'}}>{activePanel}</span>}</div>
      <div className="topbar-actions">
        <div className="search-bar">
          <span style={{color:'var(--text3)',fontSize:'14px'}}>🔍</span>
          <input type="text" placeholder="Search rooms, news, events…" />
        </div>
        <div className="icon-btn" onClick={() => setActivePanel('ai')} style={{position:'relative'}}>
          🤖<span className="notif-dot"></span>
        </div>
        <div className="icon-btn">🔔<span className="notif-dot"></span></div>
      </div>
    </div>
  );
};

// ============================================================
// PANELS
// ============================================================
const DashboardPanel = ({ setActivePanel }) => {
  const [alertOpen, setAlertOpen] = useState(true);
  return (
    <div className="panel active">
      {alertOpen && (
        <div className="alerts-banner">
          <div className="alerts-banner-icon">⚡</div>
          <div className="alerts-banner-text">
            <strong>Breaking:</strong> New hostel welfare scheme — <span style={{color:'var(--accent)',cursor:'pointer'}} onClick={()=>setActivePanel('news')}>Read more →</span>
          </div>
          <span className="alerts-dismiss" onClick={() => setAlertOpen(false)}>✕</span>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card blue"><div className="stat-icon">🏠</div><div className="stat-value">248</div><div className="stat-label">Total Rooms</div></div>
        <div className="stat-card green"><div className="stat-icon">✅</div><div className="stat-value">12</div><div className="stat-label">Available Now</div></div>
        <div className="stat-card purple"><div className="stat-icon">👥</div><div className="stat-value">486</div><div className="stat-label">Residents</div></div>
        <div className="stat-card orange"><div className="stat-icon">🎉</div><div className="stat-value">3</div><div className="stat-label">Events</div></div>
      </div>

      <div className="grid-2" style={{marginBottom:'16px'}}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">📅 Upcoming Events</div>
            <span className="card-action" onClick={() => setActivePanel('events')}>View all →</span>
          </div>
          <div className="event-list">
            {HOSTEL_EVENTS.map((e,i) => (
              <div className="event-item" key={i}>
                <div className="event-date-box"><div className="event-day">29</div><div className="event-month">Mar</div></div>
                <div className="event-info"><div className="event-title">{e.title}</div><div className="event-meta">{e.when} · {e.where}</div></div>
                <div className={`event-tag ${e.tagClass}`}>{e.tag}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">📢 Announcements</div><span className="card-action">Mark all read</span></div>
          <div className="announcement info"><div className="announcement-title">🔧 Maintenance: Block B</div><div className="announcement-text">Elevators offline 9–11 AM on March 30.</div></div>
          <div className="announcement success"><div className="announcement-title">✅ Mess Menu Updated</div><div className="announcement-text">New April menu is available. Sunday brunch added.</div></div>
        </div>
      </div>
    </div>
  );
};

const RoomsPanel = () => {
  const [filter, setFilter] = useState('all');
  const [rooms, setRooms] = useState(HOSTEL_ROOMS);

  const bookRoom = (id, rent, floor) => {
    if(window.confirm(`Book Room ${id} (Floor ${floor})?\nRent: ${rent}`)) {
      setRooms(prev => prev.map(r => r.id === id ? {...r, status:'occupied'} : r));
      alert(`✅ Room ${id} booked successfully!`);
    }
  };

  return (
    <div className="panel active">
      <div className="section-title">Room Management</div>
      <div className="section-sub">Browse and book available rooms across all blocks</div>
      <div className="stats-row" style={{gridTemplateColumns:'repeat(4,1fr)', marginBottom:'20px'}}>
        <div className="stat-card green"><div className="stat-icon">🟢</div><div className="stat-value">{rooms.filter(r=>r.status==='available').length}</div><div className="stat-label">Available</div></div>
        <div className="stat-card" style={{borderColor:'rgba(240,82,82,.3)'}}><div className="stat-icon">🔴</div><div className="stat-value">{rooms.filter(r=>r.status==='occupied').length}</div><div className="stat-label">Occupied</div></div>
      </div>
      <div className="tabs" style={{marginBottom:'20px'}}>
        {['all', '1', '2', '3', '4'].map(f => (
          <div key={f} className={`tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Floors' : `Floor ${f}`}
          </div>
        ))}
      </div>
      <div className="card">
        <div className="legend">
          <div className="legend-item"><div className="legend-dot available"></div>Available</div>
          <div className="legend-item"><div class="legend-dot occupied"></div>Occupied</div>
          <div className="legend-item"><div className="legend-dot maintenance"></div>Maintenance</div>
        </div>
        <div className="room-grid">
          {rooms.filter(r=> filter==='all' || r.floor.toString()===filter).map(r => (
            <div key={r.id} onClick={()=>r.status==='available'&&bookRoom(r.id, r.rent, r.floor)} className={`room-cell ${r.status}`}>
              <div className="room-num">{r.id}</div><div>{r.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NewsPanel = () => {
  const [cat, setCat] = useState('general');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);

  const loadNews = async (category = cat) => {
    setLoading(true);
    try {
      const endpoint = category === 'general' ? 'trending' : `category/${category}`;
      const response = await fetch(`http://localhost:5000/api/news/${endpoint}`);
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.articles || []);
      } else {
        // Fallback to demo data
        setArticles(DEMO_ARTICLES[category] || DEMO_ARTICLES.general);
      }
    } catch (error) {
      console.error('News API Error:', error);
      // Fallback to demo data
      setArticles(DEMO_ARTICLES[category] || DEMO_ARTICLES.general);
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    loadNews();
  };

  const handleCategoryChange = (newCat) => {
    setCat(newCat);
    loadNews(newCat);
  };

  // Load news on component mount
  React.useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="panel active">
      <div className="section-title">Global News Hub 🌍</div>
      <div className="section-sub">Stay informed with personalized, real-time news</div>
      <div className="news-controls">
        <div className="filter-chips">
          {[
            { id: 'general', label: '🌐 World' },
            { id: 'technology', label: '💻 Tech' },
            { id: 'sports', label: '⚽ Sports' },
            { id: 'health', label: '🏥 Health' },
            { id: 'science', label: '🔬 Science' },
            { id: 'business', label: '💼 Business' }
          ].map(c => (
            <div key={c.id} className={`chip ${cat===c.id?'active':''}`} onClick={() => handleCategoryChange(c.id)}>
              {c.label}
            </div>
          ))}
        </div>
        <button className="news-refresh-btn" onClick={handleRefresh} disabled={loading}>
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {loading ? (
        <div className="news-loading"><div className="spinner"></div>Fetching headlines…</div>
      ) : (
        <>
          {articles.length > 0 && (
            <div className="news-featured">
              <div className="news-featured-body">
                <div>
                  <div className="news-featured-label">FEATURED · LIVE</div>
                  <div className="news-featured-title">{articles[0].title}</div>
                  <div className="news-featured-desc">{articles[0].description}</div>
                </div>
                <div className="news-featured-footer">
                  <span className="info-pill">📰 {articles[0].source}</span>
                  <span className="info-pill">🕐 {new Date(articles[0].publishedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="news-featured-img"><div className="news-featured-placeholder">🌐</div></div>
            </div>
          )}
          <div className="news-grid">
            {articles.slice(1).map((a,i) => (
              <div className="news-card" key={i} onClick={() => window.open(a.url, '_blank')}>
                <div className="news-card-img">
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt={a.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                  ) : (
                    <div className="news-card-img-placeholder">📰</div>
                  )}
                </div>
                <div className="news-card-body">
                  <div className="news-card-cat" style={{color:'var(--accent)', fontSize:'10px', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px'}}>
                    {cat === 'general' ? '🌐 WORLD' : `${cat.toUpperCase()}`}
                  </div>
                  <div className="news-card-title">{a.title}</div>
                  <div className="news-card-desc">{a.description}</div>
                  <div className="news-card-footer">
                    <div className="news-source">
                      <span className="news-source-dot"></span>
                      {a.source}
                    </div>
                    <div className="news-time">
                      {new Date(a.publishedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {articles.length === 0 && (
            <div style={{textAlign:'center', padding:'40px', color:'var(--text2)'}}>
              <p>No articles found. Try refreshing or check your connection.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const AIPanel = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([{role:'ai', text:"👋 Hi! I'm HostelOS Assistant. Ask me about Rooms, Events, or Global News!"}]);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [chat]);

  const sendChat = () => {
    if(!input.trim()) return;
    setChat(prev => [...prev, {role:'user', text:input}]);
    const userText = input;
    setInput('');
    
    // Simulate thinking delay then mock response
    setTimeout(() => {
      let reply = "I can surely help with that! Let me know if you need specific details.";
      if(userText.toLowerCase().includes('room')) reply = "We currently have 12 rooms available. Check the Rooms tab to book one! 🛏";
      if(userText.toLowerCase().includes('news')) reply = "Tech is booming today! Check the Global News Hub for the OpenAI announcements 💻";
      if(userText.toLowerCase().includes('event')) reply = "Don't miss the Coding Hackathon on Mar 29! 📅";
      setChat(prev => [...prev, {role:'ai', text:reply}]);
    }, 800);
  };

  return (
    <div className="panel active" style={{display:'flex', flexDirection:'column', height:'calc(100vh - 120px)'}}>
      <div className="chat-header">
        <div className="ai-avatar">🤖</div>
        <div className="ai-info">
          <div className="ai-name">HostelOS Assistant</div>
          <div className="ai-status">● Online</div>
        </div>
      </div>
      <div className="chat-messages" style={{flex:1, overflowY:'auto'}}>
        {chat.map((m,i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="msg-avatar">{m.role==='ai'?'🤖':'RK'}</div>
            <div>
              <div className="msg-bubble">{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-row" style={{marginTop:'auto'}}>
        <div className="chat-input-wrap">
          <textarea className="chat-input" value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}}
            placeholder="Ask about rooms, events, news..." rows="1" />
        </div>
        <button className="chat-send-btn" onClick={sendChat}>➤</button>
      </div>
    </div>
  );
};

// ============================================================
// MAIN LAYOUT EXPORT
// ============================================================
export default function HostelSmartOS() {
  const [activePanel, setActivePanel] = useState('dashboard');

  return (
    <div className="hostelos-ui">
      <div className="shell">
        <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
        <main className="main">
          <Topbar activePanel={activePanel} setActivePanel={setActivePanel} />
          <div className="content">
            {activePanel === 'dashboard' && <DashboardPanel setActivePanel={setActivePanel} />}
            {activePanel === 'rooms' && <RoomsPanel />}
            {activePanel === 'events' && <div style={{padding:'20px', color:'var(--text2)'}}><h3>Events Panel (Demo)</h3><p>See dashboard for upcoming events.</p></div>}
            {activePanel === 'news' && <NewsPanel />}
            {activePanel === 'ai' && <AIPanel />}
            {['preferences', 'analytics', 'digest'].includes(activePanel) && (
              <div style={{color: 'var(--text3)', textAlign: 'center', padding: '50px'}}>
                <div style={{fontSize: '40px', marginBottom: '10px'}}>🚧</div>
                <h3>{activePanel.charAt(0).toUpperCase() + activePanel.slice(1)} Panel under construction</h3>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
