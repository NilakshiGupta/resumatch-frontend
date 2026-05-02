import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import {
    FileText, BarChart2, Target, Zap,
    TrendingUp, TrendingDown,
    ArrowRight, Sparkles,
    Upload, Search, Wand2
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { useToast } from '../components/Toast.jsx'

const API = import.meta.env.VITE_API_URL

function ScoreRing({ value, color, size = 52, label }) {
    const r = 36; const circ = 2 * Math.PI * r
    const [animated, setAnimated] = useState(0)
    useEffect(() => {
        const t = setTimeout(() => setAnimated(value), 200)
        return () => clearTimeout(t)
    }, [value])
    const offset = circ - (animated / 100) * circ
    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
            <div style={{ position:'relative', width:size, height:size }}>
                <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform:'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 6px ${color})` }}
                    />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'13px', color }}>{value}</span>
                </div>
            </div>
            <span style={{ fontSize:'10px', color:'var(--text-3)', fontFamily:'var(--font-mono)', letterSpacing:'0.05em' }}>{label}</span>
        </div>
    )
}

function StatCard({ label, value, suffix = '', color, icon: Icon, delay = 0, trend, trendLabel, showProgress = false, accentBorder = false }) {
    const navigate = useNavigate()
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

    const hasTrend = trend !== 0 && trend !== undefined
    const TrendIcon = trend > 0 ? TrendingUp : TrendingDown
    const trendColor = trend > 0 ? 'var(--green)' : 'var(--red)'

    return (
        <div
            className="stat-card page-enter"
            style={{
                animationDelay:`${delay}s`,
                borderColor: accentBorder ? `${color}30` : 'var(--border)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${color}60`;
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${color}20`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = accentBorder ? `${color}30` : 'var(--border)';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
            }}
        >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                <div style={{
                    width:'42px', height:'42px', borderRadius:'12px',
                    background:`${color}18`, border:`1px solid ${color}30`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                    <Icon size={18} color={color} strokeWidth={2} />
                </div>
                <span style={{
                    fontFamily:'var(--font-mono)', fontSize:'10px',
                    color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.1em',
                    paddingTop:'4px'
                }}>{label}</span>
            </div>

            <div style={{
                fontFamily:'var(--font-display)', fontWeight:800,
                fontSize:'40px', lineHeight:1, color, marginBottom:'12px',
            }}>
                {count}
                <span style={{ fontSize:'20px', color:'var(--text-3)', fontWeight:400 }}>{suffix}</span>
            </div>

            {showProgress && (
                <div className="progress-bar" style={{ marginBottom:'10px' }}>
                    <div className="progress-fill" style={{
                        width:`${Math.min(count, 100)}%`,
                        background:`linear-gradient(90deg, ${color}, ${color}99)`,
                    }} />
                </div>
            )}

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'4px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                    {hasTrend ? (
                        <>
                            <TrendIcon size={12} color={trendColor} />
                            <span style={{ fontSize:'11px', color:trendColor, fontFamily:'var(--font-mono)' }}>
                                {trend > 0 ? '+' : ''}{trend}% vs last
                            </span>
                        </>
                    ) : (
                        <span style={{ fontSize:'11px', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
                            {trendLabel}
                        </span>
                    )}
                </div>
                {hasTrend && trend < 0 && (
                    <button
                        onClick={() => navigate('/analyze')}
                        style={{
                            fontSize:'10px', color:'var(--purple)',
                            fontFamily:'var(--font-mono)', background:'none',
                            border:'none', cursor:'pointer', padding:0,
                            opacity: 0.8, transition:'opacity 0.2s',
                            whiteSpace:'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                    >
                        improve →
                    </button>
                )}
            </div>
        </div>
    )
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background:'rgba(8,8,18,0.95)', border:'1px solid var(--border)',
            borderRadius:'12px', padding:'12px 16px', backdropFilter:'blur(20px)',
        }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-3)', marginBottom:'8px' }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color:p.color, fontFamily:'var(--font-display)', fontWeight:700, fontSize:'13px' }}>
                    {p.name}: {p.value}%
                </p>
            ))}
        </div>
    )
}

function EmptyDashboard({ name }) {
    const steps = [
        { num: '01', to: '/upload',       icon: Upload,  color: '#8b5cf6', title: 'Upload Your Resume',    desc: 'Start by uploading your PDF resume to the system.' },
        { num: '02', to: '/analyze',      icon: Search,  color: '#22d3ee', title: 'Run an Analysis',       desc: 'Match your resume against any job description.'     },
        { num: '03', to: '/cover-letter', icon: Wand2,   color: '#4ade80', title: 'Generate Cover Letter', desc: 'Get a tailored cover letter in seconds.'            },
    ]
    return (
        <div className="page-enter" style={{ padding: '20px 0 60px' }}>
            <div style={{ marginBottom: '48px' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '99px', padding: '6px 14px', marginBottom: '16px',
                }}>
                    <Sparkles size={13} color="var(--purple)" />
                    <span style={{ fontSize: '12px', color: 'var(--purple)', fontFamily: 'var(--font-mono)' }}>Welcome to ResuMatch</span>
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '12px' }}>
                    Hey, <span style={{ background:'linear-gradient(135deg, var(--purple), var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{name}</span> 👋
                </h1>
                <p style={{ color: 'var(--text-2)', fontSize: '16px', maxWidth: '480px', lineHeight: 1.6 }}>
                    Let's get your resume working harder. Follow these 3 steps to get started.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {steps.map(({ num, to, icon: Icon, color, title, desc }) => (
                    <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                        <div className="glass" style={{
                            padding: '28px', cursor: 'pointer', height: '100%',
                            transition: 'all 0.3s var(--ease-out)',
                        }}
                             onMouseEnter={e => {
                                 e.currentTarget.style.borderColor = `${color}44`;
                                 e.currentTarget.style.transform = 'translateY(-6px)';
                                 e.currentTarget.style.boxShadow = `0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px ${color}22`;
                             }}
                             onMouseLeave={e => {
                                 e.currentTarget.style.borderColor = 'var(--border)';
                                 e.currentTarget.style.transform = 'none';
                                 e.currentTarget.style.boxShadow = 'none';
                             }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: `${color}18`, border: `1px solid ${color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={20} color={color} strokeWidth={1.8} />
                                </div>
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700,
                                    color: 'rgba(255,255,255,0.05)', lineHeight: 1,
                                }}>
                                    {num}
                                </span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{title}</p>
                            <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{desc}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color, fontSize: '13px', fontWeight: 600 }}>
                                <span>Get started</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{
                background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)',
                borderRadius: '16px', padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: '16px',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Sparkles size={16} color="var(--purple)" />
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text)' }}>Pro tip:</strong> Upload a text-based PDF resume (not a scanned image) for the best ATS analysis results. The AI reads your resume content directly.
                </p>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const toast = useToast()

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        axios.get(`${API}/api/dashboard/summary`, { headers:{ Authorization:`Bearer ${token}` } })
            .then(res => setData(res.data))
            .catch(err => {
                if (err?.response?.status === 401) {
                    navigate('/login')
                } else {
                    setError('Could not load dashboard data. Please try refreshing.')
                    toast.error('Failed to load dashboard. Check your connection.')
                }
            })
    }, [])

    const logout = () => { localStorage.clear(); navigate('/login') }

    if (!data && !error) return (
        <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'16px' }}>
            <div className="bg-grid" /><div className="orb orb-1" /><div className="orb orb-2" />
            <div className="spinner" style={{ width:'50px', height:'50px' }} />
            <p style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>loading workspace...</p>
        </div>
    )

    if (error) return (
        <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'16px' }}>
            <div className="bg-grid" /><div className="orb orb-1" />
            <div style={{ textAlign:'center', maxWidth:'360px' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>⚠</div>
                <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'18px', marginBottom:'8px' }}>Something went wrong</p>
                <p style={{ color:'var(--text-3)', fontSize:'13px', marginBottom:'20px' }}>{error}</p>
                <button className="btn-primary" onClick={() => window.location.reload()}>Try Again</button>
            </div>
        </div>
    )

    const isEmpty = !data.totalResumes && !data.totalAnalyses
    const chartData = data.recentAnalyses?.map((a, i) => ({
        name: a.jobTitle?.slice(0,12) || `#${i+1}`,
        Match: a.matchPercentage,
        ATS:   a.atsScore,
    })) || []

    const analyses = data.recentAnalyses || []

    // ← FIXED: Real trend calculation
    const atsTrend = (() => {
        if (analyses.length < 2) return 0
        return Math.round(analyses[0].atsScore - analyses[1].atsScore)
    })()

    const matchTrend = (() => {
        if (analyses.length < 2) return 0
        return Math.round(analyses[0].matchPercentage - analyses[1].matchPercentage)
    })()

    return (
        <div className="page" style={{ minHeight:'100vh', paddingBottom:'60px' }}>
            <div className="bg-grid" />
            <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

            <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 40px 0' }}>
                {isEmpty ? (
                    <EmptyDashboard name={data.name} />
                ) : (
                    <>
                        <div className="page-enter" style={{ marginBottom:'36px' }}>
                            <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-3)', marginBottom:'6px', letterSpacing:'0.1em' }}>// WELCOME BACK</p>
                            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'36px', letterSpacing:'-0.02em', lineHeight:1.1 }}>
                                Hey, <span style={{ background:'linear-gradient(135deg, var(--purple), var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{data.name}</span> 👋
                            </h1>
                            <p style={{ color:'var(--text-3)', marginTop:'8px', fontSize:'14px' }}>Here's your career progress at a glance.</p>
                        </div>

                        <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'28px' }}>
                            <StatCard label="Resumes"   value={data.totalResumes}             icon={FileText}  color="var(--purple)" delay={0.05} trendLabel="total uploaded" />
                            <StatCard label="Analyses"  value={data.totalAnalyses}             icon={BarChart2} color="var(--purple)" delay={0.1}  trendLabel="total run" />
                            <StatCard label="Avg ATS"   value={data.averageAtsScore}   suffix="%" icon={Target} color="var(--green)" delay={0.15} showProgress trend={atsTrend}   trendLabel="no change" accentBorder />
                            <StatCard label="Avg Match" value={data.averageMatchPercentage} suffix="%" icon={Zap} color="var(--green)" delay={0.2} showProgress trend={matchTrend} trendLabel="no change" accentBorder />
                        </div>

                        {chartData.length > 0 && (
                            <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:'20px', marginBottom:'28px' }}>
                                <div className="glass page-enter" style={{ padding:'28px', animationDelay:'0.25s' }}>
                                    <div className="section-label">Score Trend</div>
                                    <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'20px', fontSize:'15px' }}>Match & ATS Over Time</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="gMatch" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gATS" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-3)', fontFamily:'var(--font-mono)' }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="Match" stroke="#8b5cf6" fill="url(#gMatch)" strokeWidth={2} dot={{ fill:'#8b5cf6', r:3 }} />
                                            <Area type="monotone" dataKey="ATS"   stroke="#4ade80" fill="url(#gATS)"   strokeWidth={2} dot={{ fill:'#4ade80', r:3 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="glass page-enter" style={{ padding:'28px', animationDelay:'0.3s' }}>
                                    <div className="section-label">Comparison</div>
                                    <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'20px', fontSize:'15px' }}>Score Breakdown</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={chartData} barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--text-3)', fontFamily:'var(--font-mono)' }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="Match" fill="#8b5cf6" radius={[6,6,0,0]} />
                                            <Bar dataKey="ATS"   fill="#4ade80" radius={[6,6,0,0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {data.recentAnalyses?.length > 0 && (
                            <div className="glass page-enter" style={{ padding:'28px', marginBottom:'28px', animationDelay:'0.35s' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                                    <div>
                                        <div className="section-label">Activity</div>
                                        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'15px' }}>Recent Analyses</h3>
                                    </div>
                                    <Link to="/history" className="btn-ghost" style={{ fontSize:'12px', padding:'7px 14px', textDecoration:'none' }}>
                                        View All →
                                    </Link>
                                </div>
                                <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                                    {data.recentAnalyses.map((a, i) => (
                                        <div key={i} style={{
                                            display:'flex', alignItems:'center', justifyContent:'space-between',
                                            padding:'12px 14px', borderRadius:'12px',
                                            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                                            transition:'background 0.2s',
                                        }}
                                             onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.06)'}
                                             onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}
                                        >
                                            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                                                <div style={{
                                                    width:'36px', height:'36px', borderRadius:'10px',
                                                    background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)',
                                                    display:'flex', alignItems:'center', justifyContent:'center',
                                                }}>
                                                    <BarChart2 size={15} color="var(--purple)" />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight:600, fontSize:'13px', marginBottom:'2px' }}>{a.jobTitle || 'Analysis'}</p>
                                                    <p style={{ color:'var(--text-3)', fontSize:'11px', fontFamily:'var(--font-mono)' }}>{a.industry}</p>
                                                </div>
                                            </div>
                                            <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
                                                <ScoreRing value={a.matchPercentage} color="#8b5cf6" size={52} label="Match" />
                                                <ScoreRing value={a.atsScore}        color="#4ade80" size={52} label="ATS"   />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}