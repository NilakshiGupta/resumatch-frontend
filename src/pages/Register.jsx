import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API = 'https://resumatch-backend-95z2.onrender.com'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleRegister = async () => {
        try {
            const res = await axios.post(`${API}/api/auth/register`, { name, email, password })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('name', res.data.name)
            navigate('/dashboard')
        } catch (e) {
            alert('Registration failed')
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800">
                <h1 className="text-3xl font-bold text-white mb-2">ResuMatch</h1>
                <p className="text-gray-400 mb-6">Create your account</p>
                <input className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 outline-none" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
                <input className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 outline-none" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 outline-none" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button onClick={handleRegister} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">Register</button>
                <p className="text-gray-400 mt-4 text-center">Already have account? <Link to="/login" className="text-purple-400">Login</Link></p>
            </div>
        </div>
    )
}