import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API = 'https://resumatch-backend-95z2.onrender.com'

export default function Analyze() {
    const [resumes, setResumes] = useState([])
    const [resumeId, setResumeId] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        axios.get(`${API}/api/resume/list`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setResumes(res.data))
    }, [])

    const handleAnalyze = async () => {
        if (!resumeId || !jobDescription) { alert('Select resume and enter job description'); return }
        setLoading(true)
        try {
            const res = await axios.post(
                `${API}/api/analysis/analyze?resumeId=${resumeId}&jobDescription=${encodeURIComponent(jobDescription)}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setResult(res.data)
        } catch (e) {
            alert('Analysis failed')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Analyze Resume</h2>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white">← Dashboard</Link>
                </div>
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-6">
                    <label className="text-gray-400 block mb-2">Select Resume</label>
                    <select value={resumeId} onChange={e => setResumeId(e.target.value)} className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 outline-none">
                        <option value="">-- Select --</option>
                        {resumes.map(r => <option key={r.id} value={r.id}>{r.fileName} (v{r.versionNumber})</option>)}
                    </select>
                    <label className="text-gray-400 block mb-2">Job Description</label>
                    <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={5} className="w-full bg-gray-800 text-white p-3 rounded-lg outline-none" placeholder="Paste job description here..." />
                    <button onClick={handleAnalyze} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold mt-4">
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                {result && (
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                        <h3 className="text-xl font-bold mb-4">Results</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-800 p-4 rounded-xl text-center">
                                <p className="text-gray-400 text-sm">Match Score</p>
                                <p className="text-4xl font-bold text-purple-400">{result.matchPercentage}%</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-xl text-center">
                                <p className="text-gray-400 text-sm">ATS Score</p>
                                <p className="text-4xl font-bold text-green-400">{result.atsScore}%</p>
                            </div>
                        </div>
                        <div className="mb-3">
                            <p className="text-gray-400 text-sm mb-1">Matched Keywords</p>
                            <p className="text-green-400">{result.matchedKeywords}</p>
                        </div>
                        <div className="mb-3">
                            <p className="text-gray-400 text-sm mb-1">Missing Keywords</p>
                            <p className="text-red-400">{result.missingKeywords}</p>
                        </div>
                        <div className="mb-3">
                            <p className="text-gray-400 text-sm mb-1">Suggestions</p>
                            <p className="text-gray-300">{result.suggestions}</p>
                        </div>
                        <div className="mb-3">
                            <p className="text-gray-400 text-sm mb-1">Improvement Tips</p>
                            <p className="text-gray-300">{result.improvementTips}</p>
                        </div>
                        <div className="mb-3">
                            <p className="text-gray-400 text-sm mb-1">Skills Gap</p>
                            <p className="text-yellow-400">{result.skillsGap}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Experience Gap</p>
                            <p className="text-yellow-400">{result.experienceGap}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}