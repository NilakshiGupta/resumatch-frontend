import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import jsPDF from 'jspdf'

const API = import.meta.env.VITE_API_URL

/* ── Score Ring ─────────────────────────────────────── */
function ScoreRing({ value, color, label, size = 110 }) {
    const r = 42; const circ = 2 * Math.PI * r
    const [v, setV] = useState(0)
    useEffect(() => { const t = setTimeout(() => setV(value), 300); return () => clearTimeout(t) }, [value])
    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
            <div style={{ position:'relative', width:size, height:size }}>
                <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform:'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={circ - (v/100)*circ}
                            style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 10px ${color})` }}
                    />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'24px', color, lineHeight:1 }}>{v}</span>
                    <span style={{ fontSize:'11px', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>%</span>
                </div>
            </div>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
        </div>
    )
}

/* ── Keyword Tags ───────────────────────────────────── */
function KeywordList({ text, variant }) {
    if (!text) return <span style={{ color:'var(--text-3)', fontSize:'13px' }}>None</span>
    return (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {text.split(/[,;]/).map(k => k.trim()).filter(Boolean).map((k, i) => (
                <span key={i} className={`tag tag-${variant}`} style={{ animationDelay:`${i*0.05}s` }}>{k}</span>
            ))}
        </div>
    )
}

/* ── Section Block ──────────────────────────────────── */
function Section({ label, children }) {
    return (
        <div style={{ marginBottom:'20px' }}>
            <div className="section-label" style={{ marginBottom:'10px' }}>{label}</div>
            {children}
        </div>
    )
}

/* ── Inline Error Banner ────────────────────────────── */
function ErrorBanner({ message, onClose }) {
    if (!message) return null
    return (
        <div style={{
            background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)',
            borderRadius:'12px', padding:'14px 18px', marginBottom:'20px',
            color:'var(--red)', fontSize:'13px', display:'flex',
            justifyContent:'space-between', alignItems:'center',
            animation:'page-in 0.3s var(--ease-out)',
        }}>
            <span>⚠ {message}</span>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:'16px', lineHeight:1 }}>✕</button>
        </div>
    )
}

export default function Analyze() {
    const [resumes, setResumes]        = useState([])
    const [resumeId, setResumeId]      = useState('')
    const [jobDescription, setJobDesc] = useState('')
    const [result, setResult]          = useState(null)
    const [loading, setLoading]        = useState(false)
    const [stage, setStage]            = useState(0)
    const [error, setError]            = useState('')

    const token  = localStorage.getItem('token')
    const stages = ['Parsing resume...', 'Analyzing keywords...', 'Computing ATS score...', 'Generating insights...']
    const jdRef  = useRef(null)   // ← ref for auto-focus

    useEffect(() => {
        if (!token) return
        axios.get(`${API}/api/resume/list`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setResumes(res.data))
            .catch(() => setError('Failed to load resumes. Please refresh.'))
    }, [])

    useEffect(() => {
        if (!loading) { setStage(0); return }
        const t = setInterval(() => setStage(s => (s + 1) % stages.length), 1100)
        return () => clearInterval(t)
    }, [loading])

    // Auto-focus JD textarea when a resume is selected
    const handleResumeChange = (e) => {
        setResumeId(e.target.value)
        if (e.target.value && jdRef.current) {
            setTimeout(() => jdRef.current?.focus(), 50)
        }
    }

    const handleAnalyze = async () => {
        if (!resumeId)       { setError('Please select a resume'); return }
        if (!jobDescription.trim()) { setError('Please paste the job description'); return }
        if (jobDescription.trim().length < 50) { setError('Job description seems too short. Please paste the full JD.'); return }

        setLoading(true); setResult(null); setError('')
        try {
            const res = await axios.post(
                `${API}/api/analysis/analyze`,
                { resumeId, jobDescription },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setResult(res.data)
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Analysis failed. Please try again.'
            setError(typeof msg === 'string' ? msg : 'Analysis failed. Please try again.')
        }
        setLoading(false)
    }

    const downloadPDF = () => {
        if (!result) return
        const doc = new jsPDF(); const W = doc.internal.pageSize.getWidth(); let y = 20
        doc.setFontSize(22); doc.setTextColor(139, 92, 246)
        doc.text('ResuMatch Analysis Report', W/2, y, { align:'center' }); y += 10
        doc.setDrawColor(139, 92, 246); doc.line(20, y, W-20, y); y += 10
        doc.setFontSize(13); doc.setTextColor(50,50,50)
        doc.text(`Job: ${result.jobTitle || 'N/A'}`, 20, y); y += 8
        doc.text(`Industry: ${result.industry || 'N/A'}`, 20, y); y += 12
        doc.setFontSize(14); doc.setTextColor(139,92,246)
        doc.text(`Match: ${result.matchPercentage}%`, 20, y); y += 8
        doc.setTextColor(34,197,94); doc.text(`ATS: ${result.atsScore}%`, 20, y); y += 12
        const secs = [
            { label:'Matched Keywords', val:result.matchedKeywords, color:[34,197,94]  },
            { label:'Missing Keywords', val:result.missingKeywords, color:[239,68,68]  },
            { label:'Suggestions',      val:result.suggestions,     color:[50,50,50]   },
            { label:'Improvement Tips', val:result.improvementTips, color:[50,50,50]   },
            { label:'Skills Gap',       val:result.skillsGap,       color:[234,179,8]  },
            { label:'Experience Gap',   val:result.experienceGap,   color:[234,179,8]  },
        ]
        secs.forEach(s => {
            doc.setFontSize(11); doc.setTextColor(100,100,100); doc.text(`${s.label}:`, 20, y); y += 7
            doc.setFontSize(10); doc.setTextColor(...s.color)
            const lines = doc.splitTextToSize(s.val || 'N/A', W-40)
            doc.text(lines, 20, y); y += lines.length*6+6
            if (y > 270) { doc.addPage(); y = 20 }
        })
        doc.setFontSize(9); doc.setTextColor(150,150,150)
        doc.text(`Generated by ResuMatch • ${new Date().toLocaleDateString()}`, W/2, 290, { align:'center' })
        doc.save(`ResuMatch_${result.jobTitle || 'Report'}.pdf`)
    }

    return (
        <div className="page" style={{ minHeight:'100vh', padding:'40px' }}>
            <div className="bg-grid" /><div className="orb orb-1" /><div className="orb orb-2" />

            <div style={{ maxWidth:'820px', margin:'0 auto', position:'relative', zIndex:1 }}>
                <div className="page-enter" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'36px' }}>
                    <div>
                        <div className="section-label">AI-Powered</div>
                        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'28px' }}>Resume Analyzer</h2>
                    </div>
                    <Link to="/dashboard" className="btn-ghost">← Dashboard</Link>
                </div>

                <ErrorBanner message={error} onClose={() => setError('')} />

                {/* ── INPUT CARD ─── */}
                <div className="glass page-enter" style={{ padding:'32px', marginBottom:'24px', animationDelay:'0.1s' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'20px' }}>
                        <div>
                            <div className="section-label">Select Resume</div>
                            {resumes.length === 0 ? (
                                <div style={{ padding:'14px 18px', borderRadius:'12px', border:'1px solid var(--border)', color:'var(--text-3)', fontSize:'13px' }}>
                                    No resumes found. <Link to="/upload" style={{ color:'var(--purple)' }}>Upload one →</Link>
                                </div>
                            ) : (
                                <select
                                    value={resumeId}
                                    onChange={handleResumeChange}
                                    className="input-field"
                                    style={{ cursor:'pointer' }}
                                >
                                    <option value="">— Choose a resume —</option>
                                    {resumes.map(r => <option key={r.id} value={r.id}>{r.fileName} (v{r.versionNumber})</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <div className="section-label">
                                Job Description
                                <span style={{ color:'var(--text-3)', fontWeight:400, marginLeft:'8px' }}>
                                    ({jobDescription.trim().split(/\s+/).filter(Boolean).length} words)
                                </span>
                                {resumeId && !jobDescription && (
                                    <span style={{ marginLeft:'8px', color:'var(--purple)', fontSize:'10px', fontWeight:500 }}>
                                        ← paste JD here
                                    </span>
                                )}
                            </div>
                            <textarea
                                ref={jdRef}
                                value={jobDescription}
                                onChange={e => setJobDesc(e.target.value)}
                                rows={6}
                                className="input-field"
                                placeholder="Paste the full job description here..."
                                style={{ resize:'vertical', lineHeight:1.6 }}
                            />
                        </div>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleAnalyze}
                        disabled={loading || resumes.length === 0}
                        style={{ marginTop:'20px', width:'100%', justifyContent:'center', padding:'15px', fontSize:'15px' }}
                    >
                        {loading ? (
                            <><span className="spinner" style={{ width:'18px', height:'18px', borderWidth:'2px' }} /> {stages[stage]}</>
                        ) : (
                            <><span>◎</span> Analyze Resume</>
                        )}
                    </button>
                </div>

                {/* ── RESULT CARD ─── */}
                {result && (
                    <div className="glass page-enter" style={{ padding:'32px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
                            <div>
                                <div className="section-label">Analysis Complete</div>
                                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'22px' }}>{result.jobTitle}</h3>
                                <span className="tag tag-purple" style={{ marginTop:'6px' }}>{result.industry}</span>
                            </div>
                            <div style={{ display:'flex', gap:'24px', alignItems:'center' }}>
                                <ScoreRing value={result.matchPercentage} color="#8b5cf6" label="Match Score" />
                                <ScoreRing value={result.atsScore}        color="#22d3ee" label="ATS Score"   />
                            </div>
                        </div>

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'28px' }}>
                            {[
                                { label:'Match Score', value:result.matchPercentage, color:'var(--purple)' },
                                { label:'ATS Score',   value:result.atsScore,        color:'var(--cyan)'   },
                            ].map(p => (
                                <div key={p.label}>
                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                                        <span style={{ fontSize:'12px', color:'var(--text-3)' }}>{p.label}</span>
                                        <span style={{ fontSize:'12px', color:p.color, fontFamily:'var(--font-mono)', fontWeight:700 }}>{p.value}%</span>
                                    </div>
                                    <div className="progress-bar"><div className="progress-fill" style={{ width:`${p.value}%`, background:`linear-gradient(90deg, ${p.color}, ${p.color}aa)` }} /></div>
                                </div>
                            ))}
                        </div>

                        <div className="divider" />

                        <Section label="✓ Matched Keywords"><KeywordList text={result.matchedKeywords} variant="green"  /></Section>
                        <Section label="✗ Missing Keywords"><KeywordList text={result.missingKeywords} variant="red"    /></Section>
                        <Section label="⚡ Skills Gap">      <KeywordList text={result.skillsGap}       variant="yellow" /></Section>
                        <Section label="◷ Experience Gap">
                            <p style={{ color:'var(--yellow)', fontSize:'14px', lineHeight:1.7, background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.12)', borderRadius:'10px', padding:'12px 16px' }}>
                                {result.experienceGap || 'No gap detected'}
                            </p>
                        </Section>
                        <Section label="💡 Suggestions">
                            <p style={{ color:'var(--text-2)', fontSize:'14px', lineHeight:1.8 }}>{result.suggestions}</p>
                        </Section>
                        <Section label="🚀 Improvement Tips">
                            <p style={{ color:'var(--text-2)', fontSize:'14px', lineHeight:1.8 }}>{result.improvementTips}</p>
                        </Section>

                        <div className="divider" />
                        <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
                            <button onClick={downloadPDF} className="btn-primary" style={{ gap:'8px' }}>
                                <span>↓</span> Download PDF Report
                            </button>
                            <Link to="/tailor" className="btn-ghost" style={{ gap:'8px' }}>
                                <span>✦</span> Tailor This Resume
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}