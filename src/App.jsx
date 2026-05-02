import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Layout           from './pages/Layout'
import Login            from './pages/Login'
import Register         from './pages/Register'
import Dashboard        from './pages/Dashboard'
import Upload           from './pages/Upload'
import Analyze          from './pages/Analyze.jsx'
import AnalysisHistory  from './pages/AnalysisHistory.jsx'
import ResumeManagement from './pages/ResumeManagement'
import CoverLetter      from './pages/CoverLetter'
import TailoredResume   from './pages/TailoredResume'

/* Scroll to top on route change */
function ScrollReset() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

/* Protected route — token nahi hai toh login pe redirect */
function PrivateRoute({ children }) {
    const token = localStorage.getItem('token')
    if (!token) return <Navigate to="/login" replace />
    return children
}

/* Public route — already logged in hai toh dashboard pe redirect */
function PublicRoute({ children }) {
    const token = localStorage.getItem('token')
    if (token) return <Navigate to="/dashboard" replace />
    return children
}

function App() {
    return (
        <BrowserRouter>
            <ScrollReset />
            <Layout>
                <Routes>
                    <Route path="/" element={
                        localStorage.getItem('token')
                            ? <Navigate to="/dashboard" replace />
                            : <Navigate to="/login" replace />
                    } />

                    {/* Public routes */}
                    <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    {/* Protected routes */}
                    <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/upload"       element={<PrivateRoute><Upload /></PrivateRoute>} />
                    <Route path="/analyze"      element={<PrivateRoute><Analyze /></PrivateRoute>} />
                    <Route path="/history"      element={<PrivateRoute><AnalysisHistory /></PrivateRoute>} />
                    <Route path="/resumes"      element={<PrivateRoute><ResumeManagement /></PrivateRoute>} />
                    <Route path="/cover-letter" element={<PrivateRoute><CoverLetter /></PrivateRoute>} />
                    <Route path="/tailor"       element={<PrivateRoute><TailoredResume /></PrivateRoute>} />

                    {/* 404 fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

export default App