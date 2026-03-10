'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function FleetManagerPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // --- DRAWER & FINANCIAL STATE ---
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [providerBookings, setProviderBookings] = useState<any[]>([])
  const [providerPayouts, setProviderPayouts] = useState<any[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  async function fetchProviders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setProviders(data)
    if (error) console.error("Error fetching fleet:", error)
    setLoading(false)
  }

  useEffect(() => { fetchProviders() }, [])

  // --- OPEN DRAWER & FETCH FINANCIAL HISTORY ---
  async function openProviderDetails(provider: any) {
    setSelectedProvider(provider)
    setIsDrawerOpen(true)
    setDetailsLoading(true)

    // Fetch BOTH their job history and their withdrawal history
    const [bookingsRes, payoutsRes] = await Promise.all([
      supabase.from('bookings').select('*').eq('stylist_id', provider.id).order('created_at', { ascending: false }),
      supabase.from('payout_requests').select('*').eq('provider_id', provider.id).order('created_at', { ascending: false })
    ])

    if (bookingsRes.data) setProviderBookings(bookingsRes.data)
    if (payoutsRes.data) setProviderPayouts(payoutsRes.data)
    
    setDetailsLoading(false)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setTimeout(() => {
      setSelectedProvider(null)
      setProviderBookings([])
      setProviderPayouts([])
    }, 300)
  }

  // --- ADMIN PAYOUT ACTION ---
  async function handlePayoutAction(payoutId: number, newStatus: string) {
    if (confirm(`Mark this withdrawal request as ${newStatus}?`)) {
      const { error } = await supabase.from('payout_requests').update({ status: newStatus }).eq('id', payoutId)
      
      if (!error) {
        // Refresh the payouts list instantly
        const updatedPayouts = providerPayouts.map(p => p.id === payoutId ? { ...p, status: newStatus } : p)
        setProviderPayouts(updatedPayouts)
      } else {
        alert("Error updating payout: " + error.message)
      }
    }
  }

  // --- FINANCIAL CALCULATIONS (REAL-TIME) ---
  const completedJobs = providerBookings.filter(b => (b.status || '').toLowerCase() === 'completed')
  
  const totalEarned = completedJobs.reduce((sum, job) => sum + Number(job.price || 0), 0)
  const totalWithdrawn = providerPayouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const totalPendingPayouts = providerPayouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + Number(p.amount || 0), 0)
  
  // What is actually left in their digital wallet right now:
  const availableBalance = totalEarned - totalWithdrawn - totalPendingPayouts

  // Filter logic for the search bar
  const filteredProviders = providers.filter(p => 
    (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.provider_type || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 relative">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Fleet & Stylist Manager</h1>
          <p className="text-gray-500 mt-1">Monitor your vans, home stylists, and manage their payouts.</p>
        </div>
        
        <div className="relative w-full lg:w-72">
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search name, email, or type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
          />
        </div>
      </div>

      {/* Fleet Grid */}
      {loading ? (
        <div className="p-10 text-center text-gray-500 font-bold bg-white rounded-3xl border border-gray-100">Loading Fleet Data...</div>
      ) : filteredProviders.length === 0 ? (
        <div className="p-10 text-center text-gray-500 font-bold bg-white rounded-3xl border border-gray-100">No providers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(provider => (
            <div 
              key={provider.id} 
              onClick={() => openProviderDetails(provider)}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:border-[#D4AF37] transition cursor-pointer group"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${provider.full_name}&backgroundColor=0B3D2E&textColor=ffffff`} alt="avatar" />
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${provider.is_online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0B3D2E] leading-tight group-hover:text-[#D4AF37] transition">{provider.full_name}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{provider.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Type</span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${provider.provider_type === 'Luxury Van' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {provider.provider_type === 'Luxury Van' ? '🚐 Luxury Van' : '🏠 In-Home'}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#0B3D2E]">View Wallet & History &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- FINANCIAL DETAILS SLIDE-OUT DRAWER --- */}
      {isDrawerOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDrawer}></div>
          
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 bg-[#0B3D2E] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-white border-2 border-[#D4AF37] overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedProvider.full_name}&backgroundColor=0B3D2E&textColor=ffffff`} alt="avatar" />
                 </div>
                 <div>
                  <h2 className="text-xl font-bold">{selectedProvider.full_name}</h2>
                  <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mt-1">{selectedProvider.provider_type}</p>
                 </div>
              </div>
              <button onClick={closeDrawer} className="text-white hover:text-[#D4AF37] text-3xl leading-none">&times;</button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-8">
              
              {detailsLoading ? (
                <div className="text-center py-10 text-gray-500 font-bold">Loading Financial History...</div>
              ) : (
                <>
                  {/* --- FINANCIAL SUMMARY CARDS --- */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Wallet Overview</h3>
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Available Balance (BIG) */}
                      <div className="col-span-2 bg-[#0B3D2E] p-5 rounded-2xl shadow-md border border-[#0B3D2E]">
                        <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Available to Withdraw</p>
                        <p className="text-4xl font-black text-[#D4AF37] mt-1">${availableBalance.toFixed(2)}</p>
                      </div>
                      
                      {/* Total Earned */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-400 text-xs font-bold uppercase">Lifetime Earnings</p>
                        <p className="text-xl font-bold text-gray-800 mt-1">${totalEarned.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{completedJobs.length} Jobs Completed</p>
                      </div>

                      {/* Total Withdrawn */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-400 text-xs font-bold uppercase">Total Withdrawn</p>
                        <p className="text-xl font-bold text-green-600 mt-1">${totalWithdrawn.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Sent to Bank</p>
                      </div>

                    </div>
                  </div>

                  {/* --- PAYOUT REQUESTS SECTION --- */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex justify-between">
                      <span>Withdrawal Requests</span>
                      {totalPendingPayouts > 0 && <span className="text-orange-500">Pending: ${totalPendingPayouts.toFixed(2)}</span>}
                    </h3>
                    
                    <div className="space-y-3">
                      {providerPayouts.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-white p-4 rounded-xl border border-gray-200 text-center">No withdrawal requests yet.</p>
                      ) : (
                        providerPayouts.map(payout => (
                          <div key={payout.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-800">${Number(payout.amount).toFixed(2)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{new Date(payout.created_at).toLocaleDateString()} at {new Date(payout.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            
                            {/* Actions or Status Badge */}
                            {payout.status === 'Pending' ? (
                              <div className="flex gap-2">
                                <button onClick={() => handlePayoutAction(payout.id, 'Rejected')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg transition">Reject</button>
                                <button onClick={() => handlePayoutAction(payout.id, 'Paid')} className="px-3 py-1.5 bg-[#0B3D2E] text-[#D4AF37] hover:bg-[#082a1f] text-xs font-bold rounded-lg shadow-sm transition">Mark Paid</button>
                              </div>
                            ) : (
                              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${
                                payout.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {payout.status}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* --- JOB HISTORY SECTION --- */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Completed Job History</h3>
                    <div className="space-y-3">
                      {completedJobs.length === 0 ? (
                         <p className="text-sm text-gray-500 italic bg-white p-4 rounded-xl border border-gray-200 text-center">No completed jobs yet.</p>
                      ) : (
                        completedJobs.map(job => {
                          // Clean the date safely
                          const rawDate = job.booking_date || job.created_at;
                          const cleanDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
                          
                          return (
                            <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                              <div>
                                <p className="font-bold text-[#1A1A1A] text-sm">{job.service_name || 'Haircut'}</p>
                                <p className="text-xs text-gray-500 mt-1">📅 {cleanDate} {job.booking_time_slot && `at ${job.booking_time_slot}`}</p>
                              </div>
                              <span className="font-bold text-green-600">+${Number(job.price || 0).toFixed(2)}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}