'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function PlatformSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings State
  const [taxRate, setTaxRate] = useState<number>(0)
  const [serviceFee, setServiceFee] = useState<number>(0)
  const [primePrice, setPrimePrice] = useState<number>(0)
  const [primeDuration, setPrimeDuration] = useState<number>(0)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (data && !error) {
      setTaxRate(data.tax_rate_percent)
      setServiceFee(data.service_fee)
      setPrimePrice(data.prime_price)
      setPrimeDuration(data.prime_duration_months)
    } else {
      console.error("Could not load settings. Did you run the SQL script?", error)
    }
    setLoading(false)
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        id: 1, // Always update row 1
        tax_rate_percent: taxRate,
        service_fee: serviceFee,
        prime_price: primePrice,
        prime_duration_months: primeDuration
      })

    setSaving(false)
    if (error) {
      alert(`Error saving settings: ${error.message}`)
    } else {
      alert('✅ Platform settings updated successfully! The Customer App will now use these new rates.')
    }
  }

  if (loading) return <div className="p-10 font-bold text-gray-500 text-center">Loading Settings...</div>

  return (
    <div className="max-w-4xl space-y-8 relative">
      
      <div>
        <h1 className="text-3xl font-bold text-[#0B3D2E]">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Change taxes, fees, and prime membership rules globally.</p>
      </div>

      <form onSubmit={saveSettings} className="space-y-6">
        
        {/* TAX & FEES SECTION */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-[#0B3D2E] mb-4 flex items-center gap-2">
            <span>💳</span> Checkout Fees & Taxes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tax Rate (%)</label>
              <div className="relative">
                <input 
                  type="number" step="0.1" required
                  value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-gray-800"
                />
                <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Applied to the base price of all haircuts.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Platform Service Fee ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                <input 
                  type="number" step="0.01" required
                  value={serviceFee} onChange={e => setServiceFee(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-gray-800"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Flat fee added to standard bookings. (Waived for Prime members).</p>
            </div>
          </div>
        </div>

        {/* PRIME MEMBERSHIP SECTION */}
        <div className="bg-gradient-to-br from-[#0B3D2E] to-[#072a20] p-8 rounded-3xl shadow-md text-white border border-[#D4AF37]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-lg font-bold text-[#D4AF37] mb-6 flex items-center gap-2 relative z-10">
            <span>⭐</span> Prime Subscription Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Prime Price ($)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                <input 
                  type="number" step="0.01" required
                  value={primePrice} onChange={e => setPrimePrice(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Duration (Months)</label>
              <div className="relative">
                <input 
                  type="number" step="1" required
                  value={primeDuration} onChange={e => setPrimeDuration(Number(e.target.value))}
                  className="w-full pl-4 pr-16 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-white"
                />
                <span className="absolute right-4 top-3.5 text-gray-300 text-sm font-bold uppercase">Months</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="px-10 py-4 bg-[#D4AF37] text-[#0B3D2E] font-black rounded-xl hover:bg-[#c29f31] transition shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? '⏳ Saving to Server...' : '💾 Save Global Settings'}
          </button>
        </div>

      </form>
    </div>
  )
}