import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

/* ── tiny particle canvas ──────────────────────────── */
function ParticleCanvas() {
    const ref = useRef(null)
    useEffect(() => {
        const canvas = ref.current
        const ctx = canvas.getContext('2d')
        let raf, W, H
        const particles = []

        const resize = () => {
            W = canvas.width  = window.innerWidth
            H = canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 1.5 + 0.3,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                a: Math.random() * 0.5 + 0.1,
            })
        }

        const draw = () => {
            ctx.clearRect(0, 0, W, H)
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(139,92,246,${p.a})`
                ctx.fill()
            })
            // draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.sqrt(dx*dx + dy*dy)
                    if (dist < 120) {
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(139,92,246,${0.06 * (1 - dist/120)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }
            raf = requestAnimationFrame(draw)
        }
        draw()
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
    }, [])
    return <canvas ref={ref} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />
}

/* ── 3D tilt hook ───────────────────────────────────── */
function useTilt(ref) {
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const onMove = (e) => {
            const rect = el.getBoundingClientRect()
            const cx = rect.left + rect.width  / 2
            const cy = rect.top  + rect.height / 2
            const dx = (e.clientX - cx) / (rect.width  / 2)
            const dy = (e.clientY - cy) / (rect.height / 2)
            el.style.transform = `perspective(900px) rotateY(${dx * 8}deg) rotateX(${-dy * 6}deg) scale3d(1.02,1.02,1.02)`
            const shine = el.querySelector('.card-shine')
            if (shine) {
                const px = ((e.clientX - rect.left) / rect.width)  * 100
                const py = ((e.clientY - rect.top)  / rect.height) * 100
                shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
                shine.style.opacity = '1'
            }
        }
        const onLeave = () => {
            el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)'
            const shine = el.querySelector('.card-shine')
            if (shine) shine.style.opacity = '0'
        }
        el.addEventListener('mousemove', onMove)
        el.addEventListener('mouseleave', onLeave)
        return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
    }, [])
}

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