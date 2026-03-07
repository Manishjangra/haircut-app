'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [newCode, setNewCode] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newAmount, setNewAmount] = useState<number | ''>('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchVouchers()
  }, [])

  async function fetchVouchers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data && !error) setVouchers(data)
    setLoading(false)
  }

  async function addVoucher(e: React.FormEvent) {
    e.preventDefault()
    if (!newCode || !newAmount) return alert("Code and Amount are required!")

    const { error } = await supabase.from('vouchers').insert({
      code: newCode.toUpperCase().trim(),
      description: newDesc,
      discount_amount: Number(newAmount),
      is_active: true
    })

    if (error) {
      alert(`Error adding voucher: ${error.message}`)
    } else {
      setNewCode(''); setNewDesc(''); setNewAmount(''); setIsAdding(false)
      fetchVouchers()
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    await supabase.from('vouchers').update({ is_active: !currentStatus }).eq('id', id)
    fetchVouchers()
  }

  async function deleteVoucher(id: string) {
    if(!confirm("Are you sure you want to delete this voucher? Users will no longer be able to use it.")) return
    await supabase.from('vouchers').delete().eq('id', id)
    fetchVouchers()
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Voucher Management</h1>
          <p className="text-gray-500 mt-1">Create and manage promotional discount codes.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-[#0B3D2E] text-[#D4AF37] px-6 py-2.5 rounded-xl font-bold hover:shadow-lg transition"
        >
          {isAdding ? 'Cancel' : '+ Add New Voucher'}
        </button>
      </div>

      {/* ADD VOUCHER FORM */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4AF37] animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-[#0B3D2E] mb-4">Create Promo Code</h2>
          <form onSubmit={addVoucher} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Voucher Code</label>
              <input required value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g. SUMMER25" className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none uppercase font-bold" />
            </div>
            <div className="flex-2 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Appears in App)</label>
              <input required value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="e.g. Get $25 off haircuts" className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none" />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount ($)</label>
              <input type="number" step="0.01" required value={newAmount} onChange={e => setNewAmount(Number(e.target.value))} placeholder="0.00" className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none font-bold text-[#0B3D2E]" />
            </div>
            <button type="submit" className="bg-[#D4AF37] text-[#0B3D2E] px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#c29f31] transition">
              Save Code
            </button>
          </form>
        </div>
      )}

      {/* VOUCHERS LIST */}
      {loading ? (
        <div className="text-center p-10 text-gray-500 font-bold">Loading Vouchers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.length === 0 ? (
            <div className="col-span-full p-10 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
              No active vouchers. Click 'Add New Voucher' to create one.
            </div>
          ) : (
            vouchers.map(v => (
              <div key={v.id} className={`p-6 rounded-2xl border transition duration-200 shadow-sm relative group ${v.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                
                <button onClick={() => deleteVoucher(v.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100" title="Delete Code">
                  🗑️
                </button>

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#0B3D2E] text-white px-3 py-1 rounded-lg font-black tracking-widest border border-[#D4AF37]/50 shadow-inner">
                    {v.code}
                  </div>
                  <div className="text-2xl font-black text-[#D4AF37]">
                    {/* 👇 THIS LINE IS FIXED WITH A SAFE NUMBER WRAPPER 👇 */}
                    -${Number(v.discount_amount || 0).toFixed(2)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 font-medium mb-6 h-10">{v.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`text-xs font-bold uppercase tracking-wider ${v.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                    {v.is_active ? '🟢 Active in App' : '⚫ Disabled'}
                  </span>
                  
                  <button 
                    onClick={() => toggleActive(v.id, v.is_active)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${v.is_active ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                  >
                    {v.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}