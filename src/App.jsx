import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Analyze from './pages/Analyze'
import AnalysisHistory from './pages/AnalysisHistory'
import ResumeManagement from './pages/ResumeManagement'
import CoverLetter from './pages/CoverLetter'



function App() {
  const token = localStorage.getItem('token')

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analyze" element={<Analyze />} />
            <Route path="/history" element={<AnalysisHistory />} />
            <Route path="/resumes" element={<ResumeManagement />} />
            <Route path="/cover-letter" element={<CoverLetter />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App