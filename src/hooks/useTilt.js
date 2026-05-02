import { useEffect } from 'react'

export default function useTilt(ref) {
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
        return () => {
            el.removeEventListener('mousemove', onMove)
            el.removeEventListener('mouseleave', onLeave)
        }
    }, [])
}