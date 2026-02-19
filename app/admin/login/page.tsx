'use client'
import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // Successfully logged in, go to admin dashboard
      router.push('/admin/services')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-[#0B3D2E] p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-white/20">
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Admin Portal</h1>
          <p className="text-[#D4AF37] text-sm uppercase tracking-widest mt-2 font-bold">Secure Access</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-6 text-center">{error}</div>}
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email</label>
              <input 
                type="email" 
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B3D2E] outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B3D2E] outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#D4AF37] text-[#0B3D2E] py-4 rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}