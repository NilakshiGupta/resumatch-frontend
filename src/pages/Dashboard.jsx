import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Area, AreaChart,
} from 'recharts'

const API = import.meta.env.VITE_API_URL

/* ── Score Ring ─────────────────────────────────────── */
function ScoreRing({ value, color, size = 90, label }) {
    const r = 36; const circ = 2 * Math.PI * r
    const [animated, setAnimated] = useState(0)
    useEffect(() => {
        const t = setTimeout(() => setAnimated(value), 200)
        return () => clearTimeout(t)
    }, [value])
    const offset = circ - (animated / 100) * circ
    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
            <div style={{ position:'relative', width:size, height:size }}>
                <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform:'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 8px ${color})` }}
                    />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'20px', color, lineHeight:1 }}>{value}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'var(--text-3)', textTransform:'uppercase' }}>%</span>
                </div>
            </div>
            <span style={{ fontSize:'11px', color:'var(--text-3)', fontFamily:'var(--font-mono)', letterSpacing:'0.05em' }}>{label}</span>
        </div>
    )
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ label, value, suffix = '', color, icon, delay = 0 }) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        const end = parseFloat(value) || 0
        const dur = 1200; const step = 16
        const inc = end / (dur / step)
        let cur = 0
        const t = setInterval(() => {
            cur = Math.min(cur + inc, end)
            setCount(Math.round(cur))
            if (cur >= end) clearInterval(t)
        }, step)
        return () => clearInterval(t)
    }, [value])

    return (
        <div className="stat-card page-enter" style={{ animationDelay: `${delay}s` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                <span style={{ fontSize:'22px' }}>{icon}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</span>
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'42px', lineHeight:1, color, marginBottom:'4px' }}>
                {count}<span style={{ fontSize:'22px', color:'var(--text-3)', fontWeight:400 }}>{suffix}</span>
            </div>
        </div>
    )
}

/* ── Custom Tooltip ─────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background:'rgba(8,8,18,0.95)', border:'1px solid var(--border)', borderRadius:'12px', padding:'12px 16px', backdropFilter:'blur(20px)' }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-3)', marginBottom:'8px' }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, fontFamily:'var(--font-display)', fontWeight:700, fontSize:'14px' }}>
                    {p.name}: <span>{p.value}%</span>
                </p>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const [data, setData]       = useState(null)
    const [active, setActive]   = useState('overview')
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        axios.get(`${API}/api/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setData(res.data))
            .catch(() => navigate('/login'))
    }, [])

    const logout = () => { localStorage.clear(); navigate('/login') }

    if (!data) return (
        <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'16px' }}>
            <div className="bg-grid" /><div className="orb orb-1" /><div className="orb orb-2" />
            <div className="spinner" style={{ width:'50px', height:'50px' }} />
            <p style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>loading workspace...</p>
        </div>
    )

    const chartData = data.recentAnalyses?.map((a, i) => ({
        name: a.jobTitle?.slice(0, 12) || `#${i+1}`,
        Match: a.matchPercentage,
        ATS:   a.atsScore,
    })) || []

    const navItems = [
        { to:'/upload',       icon:'⬆', label:'Upload' },
        { to:'/analyze',      icon:'◎', label:'Analyze' },
        { to:'/history',      icon:'◷', label:'History' },
        { to:'/resumes',      icon:'◻', label:'Resumes' },
        { to:'/cover-letter', icon:'✉', label:'Cover Letter' },
    ]

    return (
        <div className="page" style={{ minHeight:'100vh', padding:'0 0 60px' }}>
            <div className="bg-grid" />
            <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

            {/* ── TOP NAV ─────────────────────────────────── */}
            <nav style={{
                position:'sticky', top:0, zIndex:100,
                background:'rgba(4,4,10,0.8)', backdropFilter:'blur(20px)',
                borderBottom:'1px solid var(--border)',
                padding:'0 40px',
                display:'flex', alignItems:'center', gap:'16px', height:'64px',
            }}>
                <div className="logo-text" style={{ marginRight:'24px', flexShrink:0 }}>ResuMatch</div>
                <div style={{ display:'flex', gap:'4px', flex:1, overflowX:'auto' }}>
                    {navItems.map(n => (
                        <Link key={n.to} to={n.to} className="nav-link" style={{ whiteSpace:'nowrap' }}>
                            <span>{n.icon}</span> {n.label}
                        </Link>
                    ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
                    <div className="pulse-dot" />
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-2)' }}>{data.name}</span>
                    <button onClick={logout} className="btn-ghost" style={{ padding:'7px 14px', fontSize:'12px' }}>Logout</button>
                </div>
            </nav>

            <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 40px 0' }}>

                {/* ── GREETING ─────────────────────────────── */}
                <div className="page-enter" style={{ marginBottom:'40px' }}>
                    <p style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-3)', marginBottom:'6px' }}>
                        // WELCOME BACK
                    </p>
                    <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'38px', letterSpacing:'-0.02em', lineHeight:1.1 }}>
                        Hey, <span style={{ background:'linear-gradient(135deg, var(--purple), var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{data.name}</span> 👋
                    </h1>
                    <p style={{ color:'var(--text-3)', marginTop:'8px' }}>Here's your career progress at a glance.</p>
                </div>

                {/* ── STAT CARDS ───────────────────────────── */}
                <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px' }}>
                    <StatCard label="Resumes"   value={data.totalResumes}          icon="📄" color="var(--purple)" delay={0.05} />
                    <StatCard label="Analyses"  value={data.totalAnalyses}         icon="◎"  color="var(--cyan)"   delay={0.1} />
                    <StatCard label="Avg ATS"   value={data.averageAtsScore}       icon="✓"  color="var(--green)"  suffix="%" delay={0.15} />
                    <StatCard label="Avg Match" value={data.averageMatchPercentage} icon="⚡" color="var(--yellow)" suffix="%" delay={0.2} />
                </div>

                {/* ── CHARTS ───────────────────────────────── */}
                {chartData.length > 0 && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'32px' }}>
                        <div className="glass page-enter" style={{ padding:'28px', animationDelay:'0.25s' }}>
                            <div className="section-label">Score Trend</div>
                            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'20px', fontSize:'16px' }}>
                                Match & ATS Over Time
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="gMatch" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                                        </linearGradient>
                                        <linearGradient id="gATS" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}   />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-3)', fontFamily:'var(--font-mono)' }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Match" stroke="#8b5cf6" fill="url(#gMatch)" strokeWidth={2} dot={{ fill:'#8b5cf6', r:3 }} />
                                    <Area type="monotone" dataKey="ATS"   stroke="#22d3ee" fill="url(#gATS)"   strokeWidth={2} dot={{ fill:'#22d3ee', r:3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="glass page-enter" style={{ padding:'28px', animationDelay:'0.3s' }}>
                            <div className="section-label">Comparison</div>
                            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'20px', fontSize:'16px' }}>
                                Score Breakdown
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-3)', fontFamily:'var(--font-mono)' }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="Match" fill="#8b5cf6" radius={[6,6,0,0]} />
                                    <Bar dataKey="ATS"   fill="#22d3ee" radius={[6,6,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ── RECENT ANALYSES ──────────────────────── */}
                {data.recentAnalyses?.length > 0 && (
                    <div className="glass page-enter" style={{ padding:'28px', animationDelay:'0.35s' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                            <div>
                                <div className="section-label">Activity</div>
                                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'16px' }}>Recent Analyses</h3>
                            </div>
                            <Link to="/history" className="btn-ghost" style={{ fontSize:'12px', padding:'7px 14px' }}>View All →</Link>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                            {data.recentAnalyses.map((a, i) => (
                                <div key={i} style={{
                                    display:'flex', alignItems:'center', justifyContent:'space-between',
                                    padding:'14px 16px', borderRadius:'12px',
                                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                    transition:'background 0.2s',
                                }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                                        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'var(--purple-glow)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>◎</div>
                                        <div>
                                            <p style={{ fontWeight:600, fontSize:'14px', marginBottom:'2px' }}>{a.jobTitle || 'Analysis'}</p>
                                            <p style={{ color:'var(--text-3)', fontSize:'12px', fontFamily:'var(--font-mono)' }}>{a.industry}</p>
                                        </div>
                                    </div>
                                    <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
                                        <ScoreRing value={a.matchPercentage} color="#8b5cf6" size={52} label="Match" />
                                        <ScoreRing value={a.atsScore}        color="#22d3ee" size={52} label="ATS"   />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── QUICK ACTIONS ────────────────────────── */}
                <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginTop:'24px' }}>
                    {[
                        { to:'/upload',       icon:'⬆', title:'Upload Resume',    desc:'Add a new resume or version',   color:'#8b5cf6' },
                        { to:'/analyze',      icon:'◎', title:'Run Analysis',     desc:'Match against a job description', color:'#22d3ee' },
                        { to:'/cover-letter', icon:'✉', title:'Cover Letter',     desc:'AI-generated, personalized',     color:'#4ade80' },
                    ].map(item => (
                        <Link key={item.to} to={item.to} style={{ textDecoration:'none' }}>
                            <div className="glass" style={{ padding:'22px', cursor:'pointer', transition:'all 0.3s var(--ease-out)' }}
                                 onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}44`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3)` }}
                                 onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                            >
                                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:`${item.color}18`, border:`1px solid ${item.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', marginBottom:'14px' }}>
                                    {item.icon}
                                </div>
                                <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'15px', marginBottom:'4px' }}>{item.title}</p>
                                <p style={{ color:'var(--text-3)', fontSize:'12px' }}>{item.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}