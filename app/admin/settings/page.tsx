'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function AdminSettingsPage() {
  const [primePrice, setPrimePrice] = useState('19.00')
  const [taxRate, setTaxRate] = useState('10')
  const [loading, setLoading] = useState(false)

  // In a real app, fetch these from a 'settings' table in Supabase
  // useEffect(() => { fetchSettings() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Example: await supabase.from('settings').update({ prime_price: primePrice, tax_rate: taxRate }).eq('id', 1)
    
    // Simulate save
    setTimeout(() => {
      alert("System Settings Updated Successfully!")
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0B3D2E]">System Settings</h1>
        <p className="text-gray-500 mt-1">Manage global pricing, taxes, and subscriptions.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Prime Subscription */}
          <div>
            <h2 className="text-lg font-bold text-[#0B3D2E] mb-4 flex items-center gap-2">
              <span className="text-[#D4AF37]">⭐</span> Prime Membership
            </h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">3-Month Prime Price ($)</label>
              <p className="text-xs text-gray-500 mb-3">Prime members pay $0 in service charges for 3 months.</p>
              <input 
                type="number" step="0.01"
                value={primePrice} onChange={e => setPrimePrice(e.target.value)}
                className="w-full md:w-1/2 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-black text-xl text-[#0B3D2E]"
              />
            </div>
          </div>

          {/* Taxes & Fees */}
          <div>
            <h2 className="text-lg font-bold text-[#0B3D2E] mb-4 flex items-center gap-2">
              <span>🧾</span> Taxes & Service Fees
            </h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">Global Tax Rate (%)</label>
              <p className="text-xs text-gray-500 mb-3">Applied to the total cost at checkout.</p>
              <input 
                type="number" 
                value={taxRate} onChange={e => setTaxRate(e.target.value)}
                className="w-full md:w-1/2 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-black text-xl text-[#0B3D2E]"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 bg-[#0B3D2E] text-[#D4AF37] font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  )
}