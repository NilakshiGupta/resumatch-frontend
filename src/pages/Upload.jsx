import { useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

export default function Upload() {
    const [file, setFile]       = useState(null)
    const [drag, setDrag]       = useState(false)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const navigate = useNavigate()
    const token    = localStorage.getItem('token')
    const inputRef = useRef()

    const handleDrop = (e) => {
        e.preventDefault(); setDrag(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped?.type === 'application/pdf') setFile(dropped)
        else setMessage('Only PDF files are allowed')
    }

    const handleUpload = async () => {
        if (!file) { setMessage('Please select a PDF file'); return }
        setLoading(true); setMessage(''); setProgress(0)
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await axios.post(`${API}/api/resume/upload`, formData, {
                headers: { Authorization: `Bearer ${token}` },
                onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
            })
            setProgress(100)
            setMessage(`✓ Uploaded: ${res.data.fileName}`)
            setTimeout(() => navigate('/analyze'), 1400)
        } catch {
            setMessage('Upload failed. Please try again.')
            setProgress(0)
        }
        setLoading(false)
    }

    return (
        <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
            <div className="bg-grid" /><div className="orb orb-1" /><div className="orb orb-2" />

            <div className="glass page-enter" style={{ width:'100%', maxWidth:'480px', padding:'44px 40px', position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
                    <div>
                        <div className="section-label">Resume Management</div>
                        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'26px' }}>Upload Resume</h2>
                    </div>
                    <Link to="/dashboard" className="btn-ghost" style={{ fontSize:'12px' }}>← Back</Link>
                </div>

                {/* drop zone */}
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={handleDrop}
                    style={{
                        border: `2px dashed ${drag ? 'var(--purple)' : file ? 'rgba(74,222,128,0.5)' : 'var(--border)'}`,
                        borderRadius:'16px',
                        padding:'48px 24px',
                        textAlign:'center',
                        cursor:'pointer',
                        transition:'all 0.3s var(--ease-out)',
                        background: drag ? 'var(--purple-glow)' : file ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)',
                        transform: drag ? 'scale(1.01)' : 'scale(1)',
                        marginBottom:'20px',
                    }}
                >
                    <input ref={inputRef} type="file" accept=".pdf" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
                    <div style={{ fontSize:'48px', marginBottom:'12px', filter: file ? 'none' : 'grayscale(0.5)' }}>
                        {file ? '📄' : drag ? '📥' : '⬆'}
                    </div>
                    {file ? (
                        <div>
                            <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'16px', color:'var(--green)', marginBottom:'4px' }}>{file.name}</p>
                            <p style={{ color:'var(--text-3)', fontSize:'12px', fontFamily:'var(--font-mono)' }}>
                                {(file.size / 1024).toFixed(1)} KB • PDF
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'15px', marginBottom:'6px' }}>
                                {drag ? 'Drop it here!' : 'Drag & drop your PDF'}
                            </p>
                            <p style={{ color:'var(--text-3)', fontSize:'12px' }}>or click to browse files</p>
                        </div>
                    )}
                </div>

                {/* progress */}
                {loading && (
                    <div style={{ marginBottom:'16px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                            <span style={{ fontSize:'12px', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>Uploading...</span>
                            <span style={{ fontSize:'12px', color:'var(--purple)', fontFamily:'var(--font-mono)' }}>{progress}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width:`${progress}%` }} />
                        </div>
                    </div>
                )}

                {message && (
                    <div style={{
                        padding:'12px 16px', borderRadius:'10px', marginBottom:'16px', fontSize:'13px',
                        background: message.startsWith('✓') ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                        border: `1px solid ${message.startsWith('✓') ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                        color: message.startsWith('✓') ? 'var(--green)' : 'var(--red)',
                        animation:'page-in 0.3s var(--ease-out)',
                    }}>
                        {message}
                    </div>
                )}

                {file && (
                    <button className="btn-ghost" onClick={() => setFile(null)} style={{ width:'100%', justifyContent:'center', marginBottom:'10px', color:'var(--red)', borderColor:'rgba(248,113,113,0.2)' }}>
                        ✕ Remove file
                    </button>
                )}

                <button className="btn-primary" onClick={handleUpload} disabled={loading || !file} style={{ width:'100%', justifyContent:'center', padding:'15px', fontSize:'15px' }}>
                    {loading
                        ? <><span className="spinner" style={{ width:'18px', height:'18px', borderWidth:'2px' }} /> Uploading...</>
                        : <><span>⬆</span> Upload Resume</>
                    }
                </button>

                <p style={{ color:'var(--text-3)', fontSize:'11px', textAlign:'center', marginTop:'16px', fontFamily:'var(--font-mono)' }}>
                    PDF format only • Max 10MB • Text-based resumes recommended
                </p>
            </div>
        </div>
    )
}