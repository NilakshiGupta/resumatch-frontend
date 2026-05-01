import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

// Sahi paths (Kyunki tumhari files pages folder mein hain)
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

/* scroll to top on route change */
function ScrollReset() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

function App() {
    const token = localStorage.getItem('token')
    return (
        <BrowserRouter>
            <ScrollReset />
            <Layout> {/* Sab kuch Layout ke andar */}
                <Routes>
                    <Route path="/"             element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                    <Route path="/login"        element={<Login />} />
                    <Route path="/register"     element={<Register />} />
                    <Route path="/dashboard"    element={<Dashboard />} />
                    <Route path="/upload"       element={<Upload />} />
                    <Route path="/analyze"      element={<Analyze />} />
                    <Route path="/history"      element={<AnalysisHistory />} />
                    <Route path="/resumes"      element={<ResumeManagement />} />
                    <Route path="/cover-letter" element={<CoverLetter />} />
                    <Route path="/tailor"       element={<TailoredResume />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

export default App