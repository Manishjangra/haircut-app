'use client'
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('PHONE') // 'PHONE' or 'OTP'
  const [loading, setLoading] = useState(false)

  // --- STEP 1: SEND OTP ---
  async function handleSendOtp() {
    if (!phone) return alert("Please enter a phone number")
    setLoading(true)
    
    // We send EXACTLY what the user typed. 
    // Example: User types "+1647..." -> We send "+1647..."
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
    })

    if (error) {
      alert("Error sending OTP: " + error.message)
      setLoading(false)
    } else {
      setStep('OTP')
      setLoading(false)
    }
  }

  // --- STEP 2: VERIFY OTP ---
  async function handleVerifyOtp() {
    if (!otp) return alert("Please enter the code")
    setLoading(true)

    const { error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp,
      type: 'sms',
    })

    if (error) {
      alert("Invalid Code: " + error.message)
      setLoading(false)
    } else {
      router.push('/') 
    }
  }

  return (
    <div className="flex justify-center items-center h-[80vh] bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        
        <h1 className="text-2xl font-bold text-center mb-2">
          {step === 'PHONE' ? 'Welcome Back' : 'Verify Phone'}
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          {step === 'PHONE' 
            ? 'Enter your mobile number to continue.' 
            : `Enter the code sent to ${phone}`
          }
        </p>

        {/* --- VIEW 1: PHONE INPUT --- */}
        {step === 'PHONE' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Phone Number</label>
              <input 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. +15550000000" 
                type="tel"
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
              <p className="text-xs text-gray-400 mt-1">Please include country code (e.g. +1 for Canada)</p>
            </div>
            
            <button 
              onClick={handleSendOtp}
              disabled={loading || phone.length < 5}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        )}

        {/* --- VIEW 2: OTP INPUT --- */}
        {step === 'OTP' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">One-Time Password</label>
              <input 
                className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="000000" 
                maxLength={6}
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
              />
            </div>

            <button 
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>

            <button 
              onClick={() => setStep('PHONE')}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              Change Phone Number
            </button>
          </div>
        )}

      </div>
    </div>
  )
}