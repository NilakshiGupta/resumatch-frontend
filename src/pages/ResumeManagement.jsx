import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

export default function ResumeManagement() {
    const [resumes, setResumes] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchResumes()
    }, [])

    const fetchResumes = () => {
        axios.get(`${API}/api/resume/list`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setResumes(res.data))
            .finally(() => setLoading(false))
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this resume?')) return
        try {
            await axios.delete(`${API}/api/resume/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setResumes(resumes.filter(r => r.id !== id))
        } catch {
            alert('Delete failed')
        }
    }

    const handleToggle = async (id) => {
        try {
            await axios.put(`${API}/api/resume/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchResumes()
        } catch {
            alert('Toggle failed')
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">My Resumes</h2>
                    <div className="flex gap-4">
                        <Link to="/upload" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold">+ Upload New</Link>
                        <Link to="/dashboard" className="text-gray-400 hover:text-white">← Dashboard</Link>
                    </div>
                </div>

                {loading && <p className="text-gray-400">Loading...</p>}

                {!loading && resumes.length === 0 && (
                    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 text-center">
                        <p className="text-gray-400">No resumes uploaded yet.</p>
                        <Link to="/upload" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
                            Upload your first resume →
                        </Link>
                    </div>
                )}

                <div className="space-y-4">
                    {resumes.map(resume => (
                        <div key={resume.id} className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-lg">{resume.fileName}</p>
                                    <p className="text-gray-400 text-sm">
                                        Version {resume.versionNumber} • {resume.versionLabel} • {new Date(resume.uploadedAt).toLocaleDateString()}
                                    </p>
                                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${resume.active ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                                        {resume.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleToggle(resume.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${resume.active ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-700 hover:bg-green-600'}`}>
                                        {resume.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(resume.id)}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-900 hover:bg-red-800 text-red-300">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}