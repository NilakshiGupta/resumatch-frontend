import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FolderOpen, Upload, ScanSearch,
    Wand2, Mail, ScrollText, LogOut
} from 'lucide-react';

export default function SidebarTemp() {
    const location = useLocation();
    const navigate = useNavigate();
    const name = localStorage.getItem('name') || 'User';

    const menuItems = [
        { path: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
        { path: '/resumes',      icon: FolderOpen,      label: 'My Resumes'    },
        { path: '/upload',       icon: Upload,          label: 'Upload New'    },
        { path: '/analyze',      icon: ScanSearch,      label: 'Analyze Match' },
        { path: '/tailor',       icon: Wand2,           label: 'Tailor Resume' },
        { path: '/cover-letter', icon: Mail,            label: 'Cover Letter'  },
        { path: '/history',      icon: ScrollText,      label: 'History'       },
    ];

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className="sidebar-overlay"
                onClick={() => document.body.classList.remove('sidebar-open')}
            />

            <div className="sidebar">
                {/* Logo area */}
                <div style={{
                    height: '64px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                }}>
                    <span className="logo-text" style={{ fontSize: '20px' }}>ResuMatch</span>
                </div>

                {/* Menu Items */}
                <div style={{ flex: 1, padding: '16px 12px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {menuItems.map(({ path, icon: Icon, label }) => {
                        const isActive = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => document.body.classList.remove('sidebar-open')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s var(--ease-out)',
                                    position: 'relative',
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.08))'
                                        : 'transparent',
                                    border: isActive
                                        ? '1px solid rgba(139,92,246,0.3)'
                                        : '1px solid transparent',
                                    color: isActive ? 'var(--text)' : 'var(--text-2)',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'var(--surface-hover)';
                                        e.currentTarget.style.color = 'var(--text)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-2)';
                                    }
                                }}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '20%',
                                        bottom: '20%',
                                        width: '3px',
                                        borderRadius: '0 3px 3px 0',
                                        background: 'var(--purple)',
                                        boxShadow: '0 0 8px var(--purple)',
                                    }} />
                                )}
                                <Icon
                                    size={17}
                                    strokeWidth={isActive ? 2.2 : 1.8}
                                    color={isActive ? 'var(--purple)' : 'currentColor'}
                                />
                                <span style={{
                                    fontSize: '13.5px',
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: isActive ? 600 : 400,
                                    letterSpacing: 0,
                                    textTransform: 'none',
                                }}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Profile */}
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.2)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--purple), var(--cyan))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 700, color: '#fff',
                        }}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <p style={{
                                fontSize: '13px', fontWeight: 600, margin: 0,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                                <span style={{ fontSize: '10px', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>Online</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '7px', padding: '8px 12px', borderRadius: '8px',
                            background: 'transparent', border: '1px solid var(--border)',
                            color: 'var(--text-3)', fontSize: '12px', cursor: 'pointer',
                            fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)';
                            e.currentTarget.style.color = 'var(--red)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-3)';
                        }}
                    >
                        <LogOut size={13} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}