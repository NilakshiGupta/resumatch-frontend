import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const name = localStorage.getItem('name') || 'User';

    const menuItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/resumes', icon: '📂', label: 'My Resumes' },
        { path: '/upload', icon: '⬆️', label: 'Upload New' },
        { path: '/analyze', icon: '◎', label: 'Analyze Match' },
        { path: '/tailor', icon: '✦', label: 'Tailor Resume' },
        { path: '/cover-letter', icon: '✉', label: 'Cover Letter' },
        { path: '/history', icon: '📜', label: 'History' },
    ];

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{
            width: '260px', height: '100vh', background: 'var(--bg-2)',
            borderRight: '1px solid var(--border)', display: 'flex',
            flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 100
        }}>
            {/* Logo Section */}
            <div style={{ padding: '30px 24px' }}>
                <div className="logo-text" style={{ fontSize: '24px' }}>ResuMatch</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    v2.0 // AI POWERED
                </div>
            </div>

            {/* Menu Items */}
            <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} className="nav-link" style={{
                            background: isActive ? 'var(--purple-glow)' : 'transparent',
                            color: isActive ? 'var(--text)' : 'var(--text-2)',
                            border: isActive ? '1px solid var(--purple-glow)' : '1px solid transparent',
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                            textDecoration: 'none', borderRadius: '12px', transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                            <span style={{ fontSize: '14px', textTransform: 'none', letterSpacing: '0' }}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Profile Section */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--cyan))' }} />
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                            <span style={{ fontSize: '10px', color: 'var(--green)' }}>Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={logout} className="btn-ghost" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                    Logout ↪
                </button>
            </div>
        </div>
    );
}