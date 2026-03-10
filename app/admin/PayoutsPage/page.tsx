'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Pending')

  async function fetchPayouts() {
    setLoading(true)
    
    // Fetch all payout requests AND all providers so we can match the names
    const [payoutsRes, providersRes] = await Promise.all([
      supabase.from('payout_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('providers').select('*')
    ])

    if (payoutsRes.data && providersRes.data) {
      // Attach the provider's name and details to the payout request
      const enhancedPayouts = payoutsRes.data.map(payout => {
        const providerInfo = providersRes.data.find(p => p.id === payout.provider_id)
        return { ...payout, provider: providerInfo }
      })
      setPayouts(enhancedPayouts)
    }
    setLoading(false)
  }

  useEffect(() => { fetchPayouts() }, [])

  // Admin action to pay or reject
  async function updatePayoutStatus(id: number, newStatus: string) {
    if (confirm(`Are you sure you want to mark this request as ${newStatus.toUpperCase()}?`)) {
      const { error } = await supabase.from('payout_requests').update({ status: newStatus }).eq('id', id)
      
      if (!error) {
        // Update UI instantly
        setPayouts(payouts.map(p => p.id === id ? { ...p, status: newStatus } : p))
      } else {
        alert("Error updating status: " + error.message)
      }
    }
  }

  const filteredPayouts = payouts.filter(p => p.status === activeTab)

  return (
    <div className="space-y-8 relative">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Withdrawal Requests</h1>
          <p className="text-gray-500 mt-1">Manage, review bank details, and pay out your stylists.</p>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-[#0B3D2E] text-white px-6 py-3 rounded-2xl shadow-md flex items-center gap-4 border border-[#D4AF37]/30">
          <div>
            <p className="text-xs text-white/70 font-bold uppercase tracking-wider">Total Pending</p>
            <p className="text-2xl font-black text-[#D4AF37]">
              ${payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-1">
        {['Pending', 'Paid', 'Rejected'].map((tab) => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition duration-300 ${
              activeTab === tab ? 'bg-[#0B3D2E] text-[#D4AF37] shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-[#D4AF37] text-[#0B3D2E]' : 'bg-gray-200 text-gray-500'}`}>
              {payouts.filter(p => p.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
           <div className="p-10 text-center text-gray-500 font-bold">Loading Requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-[#F8F9FA] text-[#0B3D2E] text-xs uppercase tracking-widest font-bold border-b border-gray-100">
                 
               <tr>
                    <th className="p-6">Provider Details</th>
                    <th className="p-6">Requested Amount</th>
                    <th className="p-6">Bank Details</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                </tr>
                
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                      No {activeTab.toLowerCase()} requests found.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition duration-200 group">
                      
                      {/* Provider Info */}
                      <td className="p-6 align-top">
                        <div className="flex items-center gap-3 mt-1">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.provider?.full_name || 'Unknown'}&backgroundColor=0B3D2E&textColor=ffffff`} alt="avatar" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0B3D2E] leading-tight">{p.provider?.full_name || 'Unknown Provider'}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-0.5">{p.provider?.provider_type || 'Stylist'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Amount & Date */}
                      <td className="p-6 align-top">
                        <span className="text-xl font-black text-gray-800">${Number(p.amount).toFixed(2)}</span>
                        <div className="mt-1">
                          <p className="font-medium text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </td>

                      {/* 👇 THE NEW BANK DETAILS COLUMN */}
                      <td className="p-6 align-top">
                        {p.bank_details ? (
                          <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-700 font-mono leading-relaxed whitespace-pre-wrap">
                            {p.bank_details}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 text-yellow-700 text-xs p-3 rounded-xl border border-yellow-200 italic">
                            No bank details provided (Old request)
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-6 align-top pt-8">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full uppercase tracking-wider border
                          ${p.status === 'Paid' ? 'bg-green-50 text-green-800 border-green-200' : 
                            p.status === 'Pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 
                            'bg-red-50 text-red-800 border-red-200'}`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-6 text-right align-top pt-6">
                        {p.status === 'Pending' ? (
                          <div className="flex flex-col gap-2 items-end">
                            <button 
                              onClick={() => updatePayoutStatus(p.id, 'Paid')}
                              className="w-28 py-2 text-xs font-bold text-white bg-[#0B3D2E] rounded-lg shadow-md hover:shadow-lg transition flex justify-center items-center gap-2"
                            >
                              <span className="text-[#D4AF37]">✔</span> Mark Paid
                            </button>
                            <button 
                              onClick={() => updatePayoutStatus(p.id, 'Rejected')}
                              className="w-28 py-2 text-xs font-bold text-red-600 bg-white rounded-lg hover:bg-red-50 border border-red-200 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest italic block mt-2">Actioned</span>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}