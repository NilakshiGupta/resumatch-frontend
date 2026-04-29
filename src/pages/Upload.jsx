import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API = 'https://resumatch-backend-95z2.onrender.com'
export default function Upload() {
    const [file, setFile] = useState(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const handleUpload = async () => {
        if (!file) { setMessage('Please select a PDF file'); return }
        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await axios.post(`${API}/api/resume/upload`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMessage(`Resume uploaded: ${res.data.fileName}`)
            setTimeout(() => navigate('/analyze'), 1500)
        } catch (e) {
            setMessage('Upload failed')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Upload Resume</h2>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white">← Back</Link>
                </div>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-4">
                    <p className="text-gray-400 mb-3">Select your PDF resume</p>
                    <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="text-gray-300" />
                </div>
                {file && <p className="text-green-400 mb-4">Selected: {file.name}</p>}
                {message && <p className="text-purple-400 mb-4">{message}</p>}
                <button onClick={handleUpload} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">
                    {loading ? 'Uploading...' : 'Upload Resume'}
                </button>
            </div>
        </div>
    )
}