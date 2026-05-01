import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

    if (isAuthPage) return <>{children}</>;

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: '260px', // Sidebar ki width
                minHeight: '100vh',
                position: 'relative'
            }}>
                {children}
            </main>
        </div>
    );
}