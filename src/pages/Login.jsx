import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', { email, password })
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('name', res.data.name)
            navigate('/dashboard')
        } catch (e) {
            setError('Invalid email or password')
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800">
                <h1 className="text-3xl font-bold text-white mb-2">ResuMatch</h1>
                <p className="text-gray-400 mb-6">Login to your account</p>
                {error && <p className="text-red-400 mb-4">{error}</p>}
                <input className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 outline-none" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 outline-none" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold">Login</button>
                <p className="text-gray-400 mt-4 text-center">No account? <Link to="/register" className="text-purple-400">Register</Link></p>
            </div>
        </div>
    )
}