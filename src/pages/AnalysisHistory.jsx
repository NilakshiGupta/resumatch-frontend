import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

function ScoreBar({ value, color, label }) {
    const [v, setV] = useState(0)
    useEffect(() => { const t = setTimeout(() => setV(value), 400); return () => clearTimeout(t) }, [value])
    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                <span style={{ fontSize:'11px', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>{label}</span>
                <span style={{ fontSize:'11px', color, fontFamily:'var(--font-mono)', fontWeight:700 }}>{value}%</span>
            </div>
            <div className="progress-bar" style={{ height:'4px' }}>
                <div className="progress-fill" style={{ width:`${v}%`, background:color }} />
            </div>
        </div>
    )
}

function KeywordChips({ text, variant }) {
    if (!text) return <span style={{ color:'var(--text-3)', fontSize:'12px' }}>—</span>
    return (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
            {text.split(/[,;]/).map(k => k.trim()).filter(Boolean).slice(0, 8).map((k, i) => (
                <span key={i} className={`tag tag-${variant}`} style={{ fontSize:'11px', padding:'3px 10px' }}>{k}</span>
            ))}
        </div>
    )
}

export default function AnalysisHistory() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [filter, setFilter] = useState('all')
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        axios.get(`${API}/api/analysis/history`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setHistory(res.data))
            .finally(() => setLoading(false))
    }, [])

    const industries = ['all', ...new Set(history.map(h => h.industry).filter(Boolean))]
    const filtered = filter === 'all' ? history : history.filter(h => h.industry === filter)

    return (
        <div className="page" style={{ minHeight:'100vh', padding:'40px' }}>
            <div className="bg-grid" /><div className="orb orb-1" /><div className="orb orb-2" />

            <div style={{ maxWidth:'900px', margin:'0 auto', position:'relative', zIndex:1 }}>
                {/* header */}
                <div className="page-enter" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'36px' }}>
                    <div>
                        <div className="section-label">Resume Analytics</div>
                        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'28px' }}>Analysis History</h2>
                    </div>
                    <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                        <Link to="/analyze" className="btn-primary" style={{ padding:'9px 18px', fontSize:'13px' }}>+ New Analysis</Link>
                        <Link to="/dashboard" className="btn-ghost">← Dashboard</Link>
                    </div>
                </div>

                {/* filter pills */}
                {industries.length > 1 && (
                    <div className="page-enter" style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px', animationDelay:'0.1s' }}>
                        {industries.map(ind => (
                            <button key={ind} onClick={() => setFilter(ind)} style={{
                                padding:'6px 16px', borderRadius:'99px', fontSize:'12px', fontFamily:'var(--font-mono)',
                                cursor:'pointer', transition:'all 0.2s', border:'1px solid',
                                background: filter === ind ? 'var(--purple)' : 'transparent',
                                borderColor: filter === ind ? 'var(--purple)' : 'var(--border)',
                                color: filter === ind ? 'white' : 'var(--text-3)',
                            }}>
                                {ind === 'all' ? 'All' : ind}
                            </button>
                        ))}
                    </div>
                )}

                {loading && (
                    <div style={{ display:'flex', justifyContent:'center', padding:'80px', flexDirection:'column', alignItems:'center', gap:'16px' }}>
                        <div className="spinner" />
                        <p style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>loading history...</p>
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="glass page-enter" style={{ padding:'60px', textAlign:'center' }}>
                        <div style={{ fontSize:'48px', marginBottom:'16px' }}>◎</div>
                        <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'18px', marginBottom:'8px' }}>No analyses yet</p>
                        <p style={{ color:'var(--text-3)', marginBottom:'20px' }}>Run your first analysis to see results here.</p>
                        <Link to="/analyze" className="btn-primary">Analyze a Resume →</Link>
                    </div>
                )}

                <div className="stagger" style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {filtered.map((item, idx) => {
                        const isOpen = selected?.id === item.id
                        return (
                            <div key={item.id} className="glass" style={{
                                padding: isOpen ? '28px' : '20px 24px',
                                cursor:'pointer',
                                transition:'all 0.3s var(--ease-out)',
                                borderColor: isOpen ? 'var(--border-glow)' : 'var(--border)',
                                boxShadow: isOpen ? '0 0 40px rgba(139,92,246,0.1)' : 'none',
                            }}
                                 onClick={() => setSelected(isOpen ? null : item)}
                            >
                                {/* collapsed row */}
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                                        <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'var(--purple-glow)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'13px', color:'var(--purple)', flexShrink:0 }}>
                                            {String(idx+1).padStart(2,'0')}
                                        </div>
                                        <div>
                                            <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'15px', marginBottom:'2px' }}>{item.jobTitle}</p>
                                            <p style={{ color:'var(--text-3)', fontSize:'11px', fontFamily:'var(--font-mono)' }}>
                                                {item.industry} • {new Date(item.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
                                        <div style={{ textAlign:'center' }}>
                                            <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'22px', color:'var(--purple)', lineHeight:1 }}>{item.matchPercentage}<span style={{ fontSize:'13px', fontWeight:400 }}>%</span></p>
                                            <p style={{ fontSize:'10px', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>MATCH</p>
                                        </div>
                                        <div style={{ textAlign:'center' }}>
                                            <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'22px', color:'var(--cyan)', lineHeight:1 }}>{item.atsScore}<span style={{ fontSize:'13px', fontWeight:400 }}>%</span></p>
                                            <p style={{ fontSize:'10px', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>ATS</p>
                                        </div>
                                        <div style={{ color:'var(--text-3)', fontSize:'16px', transition:'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</div>
                                    </div>
                                </div>

                                {/* expanded content */}
                                {isOpen && (
                                    <div style={{ marginTop:'24px', borderTop:'1px solid var(--border)', paddingTop:'24px', animation:'page-in 0.3s var(--ease-out)' }}>
                                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
                                            <ScoreBar value={item.matchPercentage} color="var(--purple)" label="Match Score" />
                                            <ScoreBar value={item.atsScore}        color="var(--cyan)"   label="ATS Score"   />
                                        </div>

                                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                                            <div>
                                                <div className="section-label" style={{ marginBottom:'8px' }}>✓ Matched Keywords</div>
                                                <KeywordChips text={item.matchedKeywords} variant="green" />
                                            </div>
                                            <div>
                                                <div className="section-label" style={{ marginBottom:'8px' }}>✗ Missing Keywords</div>
                                                <KeywordChips text={item.missingKeywords} variant="red" />
                                            </div>
                                        </div>

                                        <div style={{ marginBottom:'16px' }}>
                                            <div className="section-label" style={{ marginBottom:'8px' }}>⚡ Skills Gap</div>
                                            <KeywordChips text={item.skillsGap} variant="yellow" />
                                        </div>

                                        <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:'12px', padding:'16px', border:'1px solid var(--border)' }}>
                                            <div className="section-label" style={{ marginBottom:'8px' }}>💡 Suggestions</div>
                                            <p style={{ color:'var(--text-2)', fontSize:'13px', lineHeight:1.7 }}>{item.suggestions}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}