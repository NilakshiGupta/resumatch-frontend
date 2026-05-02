import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import ParticleCanvas from '../components/ParticleCanvas'
import useTilt from '../hooks/useTilt'
const API = import.meta.env.VITE_API_URL


export default function Login() {
    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)
    const [showPass, setShowPass] = useState(false)
    const navigate = useNavigate()
    const cardRef  = useRef(null)
    useTilt(cardRef)

    const handleLogin = async () => {
        if (!email || !password) { setError('Please fill all fields'); return }
        setLoading(true); setError('')
        try {
            const res = await axios.post(`${API}/api/auth/login`, { email, password })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('name',  res.data.name)
            navigate('/dashboard')
        } catch {
            setError('Invalid email or password')
        }
        setLoading(false)
    }

    return (
        <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
            <ParticleCanvas />
            <div className="bg-grid" />
            <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

            {/* card */}
            <div ref={cardRef} className="page-enter glass" style={{
                width:'100%', maxWidth:'420px', padding:'44px 40px',
                transition:'transform 0.15s ease, box-shadow 0.3s',
                position:'relative', zIndex:1,
            }}>
                {/* shine overlay */}
                <div className="card-shine" style={{
                    position:'absolute', inset:0, borderRadius:'inherit',
                    opacity:0, pointerEvents:'none', transition:'opacity 0.2s', zIndex:0,
                }} />

                {/* header */}
                <div style={{ marginBottom:'36px', position:'relative', zIndex:1 }}>
                    <div className="logo-text" style={{ fontSize:'32px', marginBottom:'4px' }}>ResuMatch</div>
                    <p style={{ color:'var(--text-3)', fontSize:'13px', fontFamily:'var(--font-mono)' }}>
                        // sign in to your workspace
                    </p>
                </div>

                {error && (
                    <div style={{
                        background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)',
                        borderRadius:'10px', padding:'12px 16px', marginBottom:'20px',
                        color:'#f87171', fontSize:'13px', display:'flex', gap:'8px', alignItems:'center',
                        animation:'page-in 0.3s var(--ease-out)',
                    }}>
                        <span>⚠</span> {error}
                    </div>
                )}

                {/* fields */}
                <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'24px', position:'relative', zIndex:1 }}>
                    <div>
                        <div className="section-label">Email</div>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                    <div>
                        <div className="section-label">Password</div>
                        <div style={{ position:'relative' }}>
                            <input
                                className="input-field"
                                type={showPass ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                style={{ paddingRight:'48px' }}
                            />
                            <button
                                onClick={() => setShowPass(!showPass)}
                                style={{
                                    position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
                                    background:'none', border:'none', color:'var(--text-3)', cursor:'pointer',
                                    fontSize:'16px', transition:'color 0.2s',
                                }}
                            >
                                {showPass ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    className="btn-primary"
                    onClick={handleLogin}
                    disabled={loading}
                    style={{ width:'100%', justifyContent:'center', padding:'15px', fontSize:'15px', position:'relative', zIndex:1 }}
                >
                    {loading ? (
                        <><span className="spinner" style={{ width:'18px', height:'18px', borderWidth:'2px' }} /> Signing in...</>
                    ) : (
                        <><span>→</span> Sign In</>
                    )}
                </button>

                <div className="divider" style={{ position:'relative', zIndex:1 }} />

                <p style={{ color:'var(--text-3)', fontSize:'13px', textAlign:'center', position:'relative', zIndex:1 }}>
                    No account?{' '}
                    <Link to="/register" style={{ color:'var(--purple)', textDecoration:'none', fontWeight:600, transition:'color 0.2s' }}>
                        Create one →
                    </Link>
                </p>
            </div>
        </div>
    )
}