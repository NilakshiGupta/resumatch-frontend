import { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
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