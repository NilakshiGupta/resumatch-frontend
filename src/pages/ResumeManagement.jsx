import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../components/Toast.jsx'

const API = import.meta.env.VITE_API_URL

export default function ResumeManagement() {
    const [resumes, setResumes]       = useState([])
    const [loading, setLoading]       = useState(true)
    const [deleting, setDeleting]     = useState(null)
    const [toggling, setToggling]     = useState(null)
    const [confirmId, setConfirmId]   = useState(null) // inline confirm state
    const navigate = useNavigate()
    const token    = localStorage.getItem('token')
    const toast    = useToast()

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchResumes()
    }, [])

    const fetchResumes = () => {
        setLoading(true)
        axios.get(`${API}/api/resume/list`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setResumes(res.data))
            .catch(() => toast.error('Failed to load resumes.'))
            .finally(() => setLoading(false))
    }

    const handleDelete = async (id) => {
        setDeleting(id); setConfirmId(null)
        try {
            await axios.delete(`${API}/api/resume/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            setResumes(prev => prev.filter(r => r.id !== id))
            toast.success('Resume deleted.')
        } catch {
            toast.error('Delete failed. Please try again.')
        }
        setDeleting(null)
    }

    const handleToggle = async (id) => {
        setToggling(id)
        try {
            await axios.put(`${API}/api/resume/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } })
            fetchResumes()
            toast.info('Resume status updated.')
        } catch {
            toast.error('Toggle failed. Please try again.')
        }
        setToggling(null)
    }

    const active   = resumes.filter(r => r.isActive)
    const inactive = resumes.filter(r => !r.isActive)

    return (
        <div className="page" style={{ minHeight:'100vh', padding:'40px' }}>
            <div className="bg-grid" /><div className="orb orb-1" /><div className="orb orb-2" />

            <div style={{ maxWidth:'900px', margin:'0 auto', position:'relative', zIndex:1 }}>
                {/* header */}
                <div className="page-enter" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'36px' }}>
                    <div>
                        <div className="section-label">File Manager</div>
                        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'28px' }}>My Resumes</h2>
                    </div>
                    <div style={{ display:'flex', gap:'10px' }}>
                        <Link to="/upload" className="btn-primary" style={{ padding:'9px 18px', fontSize:'13px' }}>+ Upload New</Link>
                        <Link to="/dashboard" className="btn-ghost">← Dashboard</Link>
                    </div>
                </div>

                {/* summary pills */}
                {!loading && resumes.length > 0 && (
                    <div className="page-enter" style={{ display:'flex', gap:'12px', marginBottom:'28px', animationDelay:'0.1s' }}>
                        {[
                            { label:'Total',    value: resumes.length, color:'var(--purple)' },
                            { label:'Active',   value: active.length,   color:'var(--green)'  },
                            { label:'Inactive', value: inactive.length, color:'var(--text-3)' },
                        ].map(s => (
                            <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'10px 20px', display:'flex', gap:'10px', alignItems:'center' }}>
                                <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'20px', color:s.color }}>{s.value}</span>
                                <span style={{ color:'var(--text-3)', fontSize:'12px', fontFamily:'var(--font-mono)' }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {loading && (
                    <div style={{ display:'flex', justifyContent:'center', padding:'80px', flexDirection:'column', alignItems:'center', gap:'16px' }}>
                        <div className="spinner" />
                        <p style={{ color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:'12px' }}>loading resumes...</p>
                    </div>
                )}

                {!loading && resumes.length === 0 && (
                    <div className="glass page-enter" style={{ padding:'60px', textAlign:'center' }}>
                        <div style={{ fontSize:'48px', marginBottom:'16px' }}>📄</div>
                        <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'18px', marginBottom:'8px' }}>No resumes yet</p>
                        <p style={{ color:'var(--text-3)', marginBottom:'20px' }}>Upload your first resume to get started.</p>
                        <Link to="/upload" className="btn-primary">Upload Resume →</Link>
                    </div>
                )}

                <div className="stagger" style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {resumes.map((resume, idx) => (
                        <div key={resume.id} className="glass" style={{
                            padding:'22px 26px', animationDelay:`${idx*0.05}s`,
                            borderColor: resume.isActive ? 'rgba(74,222,128,0.15)' : 'var(--border)',
                            transition:'all 0.3s var(--ease-out)',
                        }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
                                {/* icon + info */}
                                <div style={{ display:'flex', alignItems:'center', gap:'16px', flex:1, minWidth:0 }}>
                                    <div style={{ width:'48px', height:'48px', borderRadius:'14px', flexShrink:0,
                                        background: resume.isActive ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                                        border:`1px solid ${resume.isActive ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`,
                                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
                                    }}>📄</div>
                                    <div style={{ minWidth:0 }}>
                                        <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'15px', marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {resume.fileName}
                                        </p>
                                        <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
                                            <span className="tag tag-purple" style={{ fontSize:'10px', padding:'2px 8px' }}>v{resume.versionNumber}</span>
                                            <span style={{ fontSize:'11px', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>{resume.versionLabel}</span>
                                            <span style={{ fontSize:'11px', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
                                                {new Date(resume.uploadedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* status + actions */}
                                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'5px 12px', borderRadius:'99px',
                                        background: resume.isActive ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)',
                                        border:`1px solid ${resume.isActive ? 'rgba(74,222,128,0.2)' : 'var(--border)'}` }}>
                                        {resume.isActive && <div className="pulse-dot" />}
                                        <span style={{ fontSize:'11px', fontFamily:'var(--font-mono)', color: resume.isActive ? 'var(--green)' : 'var(--text-3)' }}>
                                            {resume.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleToggle(resume.id)}
                                        disabled={toggling === resume.id}
                                        className="btn-ghost"
                                        style={{ fontSize:'12px', padding:'7px 14px',
                                            color: resume.isActive ? 'var(--text-3)' : 'var(--green)',
                                            borderColor: resume.isActive ? 'var(--border)' : 'rgba(74,222,128,0.2)' }}
                                    >
                                        {toggling === resume.id ? '...' : resume.isActive ? 'Deactivate' : 'Activate'}
                                    </button>

                                    {/* Inline confirm delete */}
                                    {confirmId === resume.id ? (
                                        <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                                            <span style={{ fontSize:'11px', color:'var(--red)', fontFamily:'var(--font-mono)' }}>Sure?</span>
                                            <button
                                                onClick={() => handleDelete(resume.id)}
                                                disabled={deleting === resume.id}
                                                style={{ padding:'5px 12px', borderRadius:'8px', fontSize:'12px', cursor:'pointer',
                                                    background:'rgba(248,113,113,0.2)', border:'1px solid rgba(248,113,113,0.4)', color:'var(--red)' }}
                                            >
                                                {deleting === resume.id ? '...' : 'Yes, delete'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmId(null)}
                                                style={{ padding:'5px 12px', borderRadius:'8px', fontSize:'12px', cursor:'pointer',
                                                    background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text-3)' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmId(resume.id)}
                                            style={{ padding:'7px 14px', borderRadius:'10px', fontSize:'12px', fontFamily:'var(--font-body)',
                                                cursor:'pointer', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)',
                                                color:'var(--red)', transition:'all 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                                        >
                                            ✕ Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}