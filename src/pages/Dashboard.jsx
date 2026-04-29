import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Dashboard() {
    const [data, setData] = useState(null)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        axios.get('http://localhost:8080/api/dashboard/summary', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setData(res.data))
            .catch(() => navigate('/login'))
    }, [])

    const logout = () => {
        localStorage.clear()
        navigate('/login')
    }

    if (!data) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-purple-400">ResuMatch</h1>
                    <button onClick={logout} className="text-gray-400 hover:text-white">Logout</button>
                </div>
                <p className="text-gray-400 mb-6">Welcome, {data.name}</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                        <p className="text-gray-400">Total Resumes</p>
                        <p className="text-4xl font-bold text-purple-400">{data.totalResumes}</p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                        <p className="text-gray-400">Total Analyses</p>
                        <p className="text-4xl font-bold text-purple-400">{data.totalAnalyses}</p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                        <p className="text-gray-400">Avg ATS Score</p>
                        <p className="text-4xl font-bold text-green-400">{data.averageAtsScore}%</p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                        <p className="text-gray-400">Avg Match</p>
                        <p className="text-4xl font-bold text-green-400">{data.averageMatchPercentage}%</p>
                    </div>
                </div>
                <div className="flex gap-4 mb-8">
                    <Link to="/upload" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">Upload Resume</Link>
                    <Link to="/analyze" className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold">Analyze Resume</Link>
                </div>
                {data.recentAnalyses?.length > 0 && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                        <h2 className="text-xl font-bold mb-4">Recent Analyses</h2>
                        {data.recentAnalyses.map((a, i) => (
                            <div key={i} className="border-b border-gray-800 py-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">{a.jobTitle || 'Analysis'}</span>
                                    <span className="text-purple-400">{a.matchPercentage}% match</span>
                                </div>
                                <div className="flex gap-4 mt-1">
                                    <span className="text-green-400 text-sm">ATS: {a.atsScore}%</span>
                                    <span className="text-gray-400 text-sm">{a.industry}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}