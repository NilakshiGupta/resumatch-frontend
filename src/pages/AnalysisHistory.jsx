import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

export default function AnalysisHistory() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        axios.get(`${API}/api/analysis/history`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setHistory(res.data))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Analysis History</h2>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white">← Dashboard</Link>
                </div>

                {loading && <p className="text-gray-400">Loading...</p>}

                {!loading && history.length === 0 && (
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center">
                        <p className="text-gray-400">No analysis done yet.</p>
                        <Link to="/analyze" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
                            Analyze your first resume →
                        </Link>
                    </div>
                )}

                <div className="space-y-4">
                    {history.map(item => (
                        <div key={item.id}
                             onClick={() => setSelected(selected?.id === item.id ? null : item)}
                             className="bg-gray-900 p-5 rounded-2xl border border-gray-800 cursor-pointer hover:border-purple-600 transition">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-lg">{item.jobTitle}</p>
                                    <p className="text-gray-400 text-sm">{item.industry} • {new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-4 text-center">
                                    <div>
                                        <p className="text-purple-400 text-2xl font-bold">{item.matchPercentage}%</p>
                                        <p className="text-gray-400 text-xs">Match</p>
                                    </div>
                                    <div>
                                        <p className="text-green-400 text-2xl font-bold">{item.atsScore}%</p>
                                        <p className="text-gray-400 text-xs">ATS</p>
                                    </div>
                                </div>
                            </div>

                            {selected?.id === item.id && (
                                <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                                    <div>
                                        <p className="text-gray-400 text-sm">Matched Keywords</p>
                                        <p className="text-green-400">{item.matchedKeywords}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Missing Keywords</p>
                                        <p className="text-red-400">{item.missingKeywords}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Suggestions</p>
                                        <p className="text-gray-300">{item.suggestions}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Skills Gap</p>
                                        <p className="text-yellow-400">{item.skillsGap}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Experience Gap</p>
                                        <p className="text-yellow-400">{item.experienceGap}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}