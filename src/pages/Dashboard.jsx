import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const API = import.meta.env.VITE_API_URL

export default function Dashboard() {
    const [data, setData] = useState(null)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        axios.get(`${API}/api/dashboard/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setData(res.data))
            .catch(() => navigate('/login'))
    }, [])

    const logout = () => {
        localStorage.clear()
        navigate('/login')
    }

    if (!data) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-purple-400 text-xl animate-pulse">Loading...</div>
        </div>
    )

    const chartData = data.recentAnalyses?.map((a, i) => ({
        name: `#${i + 1} ${a.jobTitle?.slice(0, 10) || 'Analysis'}`,
        Match: a.matchPercentage,
        ATS: a.atsScore,
    })) || []

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-purple-400">ResuMatch</h1>
                    <button onClick={logout} className="text-gray-400 hover:text-white">Logout</button>
                </div>
                <p className="text-gray-400 mb-6">Welcome, {data.name} 👋</p>

                {/* Stats Grid */}
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

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8 flex-wrap">
                    <Link to="/upload" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">Upload Resume</Link>
                    <Link to="/analyze" className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold">Analyze Resume</Link>
                    <Link to="/history" className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold">View History</Link>
                    <Link to="/resumes" className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold">My Resumes</Link>
                </div>

                {/* Charts */}
                {chartData.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                            <h2 className="text-xl font-bold mb-4">Match & ATS Score Trend</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="Match" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
                                    <Line type="monotone" dataKey="ATS" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                            <h2 className="text-xl font-bold mb-4">Score Comparison</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                                    <Bar dataKey="Match" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="ATS" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Recent Analyses */}
                {data.recentAnalyses?.length > 0 && (
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                        <h2 className="text-xl font-bold mb-4">Recent Analyses</h2>
                        {data.recentAnalyses.map((a, i) => (
                            <div key={i} className="border-b border-gray-800 py-3 last:border-0">
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