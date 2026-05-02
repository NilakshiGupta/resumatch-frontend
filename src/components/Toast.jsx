import { useState, useEffect, useCallback, useRef } from 'react'
import { createContext, useContext } from 'react'

const ToastContext = createContext(null)

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}

const ICONS = { success: '✓', error: '⚠', info: '◎', warning: '!' }

const COLORS = {
    success: { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)',  color: 'var(--green)'  },
    error:   { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', color: 'var(--red)'    },
    info:    { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.25)',  color: 'var(--purple)' },
    warning: { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',  color: 'var(--yellow)' },
}

function ToastItem({ id, message, type = 'info', onRemove }) {
    const [visible, setVisible] = useState(false)
    const c = COLORS[type]

    useEffect(() => {
        const tin  = setTimeout(() => setVisible(true), 10)
        const tout = setTimeout(() => {
            setVisible(false)
            setTimeout(() => onRemove(id), 300)
        }, 3500)
        return () => { clearTimeout(tin); clearTimeout(tout) }
    }, [id, onRemove])

    return (
        <div
            onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 300) }}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '14px 16px', borderRadius: '12px',
                border: `1px solid ${c.border}`, background: c.bg,
                backdropFilter: 'blur(12px)', cursor: 'pointer',
                maxWidth: '360px', width: '100%',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.95)',
                pointerEvents: 'all',
            }}
        >
            <span style={{ color: c.color, fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>
                {ICONS[type]}
            </span>
            <span style={{ color: 'var(--text)', fontSize: '13px', lineHeight: 1.5 }}>
                {message}
            </span>
        </div>
    )
}

function ToastContainer({ toasts, onRemove }) {
    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            zIndex: 9999, display: 'flex', flexDirection: 'column',
            gap: '10px', pointerEvents: 'none',
        }}>
            {toasts.map(t => <ToastItem key={t.id} {...t} onRemove={onRemove} />)}
        </div>
    )
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const counter = useRef(0)

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = useCallback((message, type = 'info') => {
        const id = ++counter.current
        setToasts(prev => [...prev, { id, message, type }])
    }, [])

    toast.success = (msg) => toast(msg, 'success')
    toast.error   = (msg) => toast(msg, 'error')
    toast.warning = (msg) => toast(msg, 'warning')
    toast.info    = (msg) => toast(msg, 'info')

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={remove} />
        </ToastContext.Provider>
    )
}