import SidebarTemp from './SidebarTemp.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

const PAGE_META = {
    '/dashboard':    { title: 'Dashboard',        sub: 'Overview'            },
    '/resumes':      { title: 'My Resumes',        sub: 'File Manager'        },
    '/upload':       { title: 'Upload Resume',     sub: 'Resume Management'   },
    '/analyze':      { title: 'Analyze Match',     sub: 'AI-Powered'          },
    '/tailor':       { title: 'Tailor Resume',     sub: 'AI Customization'    },
    '/cover-letter': { title: 'Cover Letter',      sub: 'AI Writing Assistant'},
    '/history':      { title: 'Analysis History',  sub: 'Resume Analytics'    },
}

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

    if (isAuthPage) return <>{children}</>;

    const meta = PAGE_META[location.pathname] || { title: 'ResuMatch', sub: '' }
    const name = localStorage.getItem('name') || 'User'
    const logout = () => { localStorage.clear(); navigate('/login') }

    return (
        <div style={{ display: 'flex' }}>
            <SidebarTemp />

            {/* Mobile hamburger */}
            <button
                className="sidebar-toggle"
                onClick={() => document.body.classList.toggle('sidebar-open')}
                aria-label="Toggle sidebar"
            >
                <Menu size={20} color="var(--text)" />
            </button>

            <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', position: 'relative' }}>

                {/* Global Top Nav */}
                <nav style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    height: '64px',
                    background: 'rgba(4,4,10,0.88)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--border)',
                    padding: '0 36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    {/* Left: page title + sub */}
                    <div>
                        <p style={{
                            fontFamily: 'var(--font-mono)', fontSize: '10px',
                            color: 'var(--text-3)', letterSpacing: '0.1em',
                            textTransform: 'uppercase', lineHeight: 1, marginBottom: '3px',
                        }}>
                            {meta.sub}
                        </p>
                        <h2 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 700,
                            fontSize: '17px', color: 'var(--text)', lineHeight: 1, margin: 0,
                        }}>
                            {meta.title}
                        </h2>
                    </div>
                </nav>

                {children}
            </main>
        </div>
    );
}