'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  
  // 1. 👇 UPGRADED TABS: Changed 'confirmed' to 'active' to cover all moving jobs
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  async function fetchBookings() {
    setLoading(true)
    const [bookingsRes, providersRes] = await Promise.all([
      supabase.from('bookings').select('*, services(name, price, duration_minutes)').order('booking_date', { ascending: false }),
      supabase.from('providers').select('*')
    ])

    if (providersRes.data) setProviders(providersRes.data) 

    if (bookingsRes.data) {
      const enhancedBookings = bookingsRes.data.map(b => {
        const stylistId = b.stylist_id 
        const assignedStylist = providersRes.data?.find(p => p.id === stylistId)
        return { ...b, stylist: assignedStylist }
      })
      setBookings(enhancedBookings)
    }
    setLoading(false)
  }

  useEffect(() => { fetchBookings() }, [])

  async function updateStatus(id: number, newStatus: string) {
    if (confirm(`Mark this booking as ${newStatus.toUpperCase()}?`)) {
      await supabase.from('bookings').update({ status: newStatus }).eq('id', id)
      fetchBookings() 
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus })
      }
    }
  }

  async function assignProvider(bookingId: number, providerId: string) {
    const provider = providers.find(p => p.id === providerId)
    if (!provider) return;

    if (confirm(`Assign ${provider.full_name} to this booking?`)) {
      const updatePayload = {
        stylist_id: provider.id,
        stylist_name: provider.full_name,
        status: 'Accepted' 
      }
      const { error } = await supabase.from('bookings').update(updatePayload).eq('id', bookingId)

      if (!error) {
        fetchBookings() 
        setSelectedBooking({ 
          ...selectedBooking, 
          stylist: provider, 
          stylist_id: provider.id, 
          stylist_name: provider.full_name,
          status: 'Accepted' 
        })
      } else {
        alert("Error assigning provider: " + error.message)
      }
    }
  }

  function openDrawer(booking: any) {
    setSelectedBooking(booking)
    setIsDrawerOpen(true)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedBooking(null), 300) 
  }

  // 2. 👇 SMART FILTER LOGIC (Bulletproof Case Insensitivity)
  const getMappedTab = (rawStatus: string) => {
    const status = (rawStatus || '').toLowerCase()
    if (['pending', 'paid'].includes(status)) return 'pending'
    if (['accepted', 'confirmed', 'on the way', 'arrived', 'in progress'].includes(status)) return 'active'
    if (['completed'].includes(status)) return 'completed'
    if (['cancelled', 'failed'].includes(status)) return 'cancelled'
    return 'all' // fallback
  }

  const filteredBookings = bookings.filter(b => {
    const mappedTab = getMappedTab(b.status);
    const matchesTab = activeTab === 'all' || mappedTab === activeTab;
    
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = 
      b.id.toString().includes(searchString) || 
      (b.services?.name || b.service_name || '').toLowerCase().includes(searchString) ||
      (b.stylist?.full_name || '').toLowerCase().includes(searchString) || 
      (b.address || '').toLowerCase().includes(searchString);
    const matchesDate = dateFilter === '' || b.booking_date.startsWith(dateFilter);

    return matchesTab && matchesSearch && matchesDate;
  });

  // SMART BADGE COLORS
  const getBadgeStyle = (rawStatus: string) => {
    const tab = getMappedTab(rawStatus);
    if (tab === 'pending') return 'bg-yellow-50 text-yellow-800 border-yellow-200'
    if (tab === 'active') return 'bg-blue-50 text-blue-800 border-blue-200'
    if (tab === 'completed') return 'bg-green-50 text-green-800 border-green-200'
    if (tab === 'cancelled') return 'bg-red-50 text-red-800 border-red-200'
    return 'bg-gray-100 text-gray-600'
  }

  function exportToCSV() {
    const headers = ['Booking ID', 'Service', 'Date', 'Time', 'Status', 'Base Price', 'Tax (10%)', 'Service Fee', 'Total Paid', 'Provider Assigned', 'Address']
    const csvRows = filteredBookings.map(b => {
      const basePrice = Number(b.price || b.services?.price || 0);
      const tax = Number(b.tax_amount || 0);
      const fee = Number(b.service_charge || 0);
      const total = basePrice + tax + fee;

      return [
        b.id,
        `"${b.service_name || b.services?.name || 'Unknown'}"`,
        new Date(b.booking_date).toLocaleDateString(),
        new Date(b.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        b.status,
        basePrice.toFixed(2),
        tax.toFixed(2),
        fee.toFixed(2),
        total.toFixed(2),
        `"${b.stylist?.full_name || 'Unassigned'}"`,
        `"${b.address || ''}"`
      ]
    })

    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `Bookings_Financial_Export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8 relative">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Booking Management</h1>
          <p className="text-gray-500 mt-1">Review, approve, and track all customer appointments.</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-gray-600 text-sm"
          />
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search ID, Service, Stylist..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none text-sm"
            />
          </div>
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-[#E6F4EA] text-[#0B3D2E] font-bold rounded-xl border border-green-200 hover:bg-green-100 transition flex items-center gap-2 text-sm"
          >
            <span>📥</span> Export Accounting CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-1">
        {/* 👇 UPDATED TABS LIST */}
        {['all', 'pending', 'active', 'completed', 'cancelled'].map((tab) => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition duration-300 ${
              activeTab === tab ? 'bg-[#0B3D2E] text-[#D4AF37] shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
            {tab !== 'all' && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-[#D4AF37] text-[#0B3D2E]' : 'bg-gray-200 text-gray-500'}`}>
                {bookings.filter(b => getMappedTab(b.status) === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
           <div className="p-10 text-center text-gray-500 font-bold">Loading Bookings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-[#F8F9FA] text-[#0B3D2E] text-xs uppercase tracking-widest font-bold border-b border-gray-100">
                <tr>
                  <th className="p-6">Service details</th>
                  <th className="p-6">Schedule</th>
                  <th className="p-6">Assigned Provider</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 font-medium">
                      {searchQuery || dateFilter ? 'No bookings match your search filters.' : 'No bookings found.'}
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition duration-200 group">
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-[#1A1A1A]">{b.service_name || b.services?.name || 'Premium Service'}</p>
                           {b.is_prime_member && <span title="Prime Member" className="text-sm drop-shadow-sm">⭐</span>}
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-1">ID: #{b.id}</p>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 font-bold text-[#0B3D2E]">
                          <span>{new Date(b.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-[#D4AF37]">{b.booking_time_slot || new Date(b.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        
                        {b.service_mode && (
                          <div className="mt-1 text-xs font-bold text-gray-500 flex items-center gap-1">
                            <span>{b.service_mode === 'Luxury Van' ? '🚐' : '🏠'}</span> {b.service_mode}
                          </div>
                        )}
                      </td>
                      
                      <td className="p-6">
                        {b.stylist ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-300">
                              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${b.stylist.full_name}&backgroundColor=0B3D2E&textColor=ffffff`} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#0B3D2E] leading-tight">{b.stylist.full_name}</p>
                              <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">{b.stylist.provider_type}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs px-3 py-1 bg-gray-100 text-gray-500 font-bold rounded-full italic">Unassigned</span>
                        )}
                      </td>

                      <td className="p-6">
                        {/* 👇 UPDATED DYNAMIC BADGE */}
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full uppercase tracking-wider border ${getBadgeStyle(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => openDrawer(b)}
                          className="px-4 py-2 text-sm font-bold text-[#0B3D2E] bg-gray-100 rounded-lg group-hover:bg-[#D4AF37] group-hover:text-white transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- SLIDE-OUT DRAWER --- */}
      {isDrawerOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDrawer}></div>
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 bg-[#0B3D2E] text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Booking #{selectedBooking.id}
                  {selectedBooking.is_prime_member && <span title="Prime Member">⭐</span>}
                </h2>
                <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-wider mt-1">{selectedBooking.status}</p>
              </div>
              <button onClick={closeDrawer} className="text-white hover:text-[#D4AF37] text-3xl leading-none">&times;</button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-8 bg-gray-50">
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Financial Breakdown</h3>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-600">{selectedBooking.service_name || selectedBooking.services?.name}</p>
                    <span className="font-bold text-gray-800">${Number(selectedBooking.price || selectedBooking.services?.price || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Tax (10%)</span>
                    <span>+ ${Number(selectedBooking.tax_amount || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className={selectedBooking.is_prime_member ? "text-green-600 font-bold" : "text-gray-500"}>
                      {selectedBooking.is_prime_member ? '⭐ Prime Fee Waiver' : 'Platform Service Fee'}
                    </span>
                    <span className={selectedBooking.is_prime_member ? "text-green-600 font-bold" : "text-gray-500"}>
                      {selectedBooking.is_prime_member ? "WAIVED" : `+ $${Number(selectedBooking.service_charge || 0).toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center font-black text-[#0B3D2E] text-xl">
                    <span>Total Paid</span>
                    <span>
                      ${(
                        Number(selectedBooking.price || selectedBooking.services?.price || 0) + 
                        Number(selectedBooking.tax_amount || 0) + 
                        Number(selectedBooking.service_charge || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Logistics & Location</h3>
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  
                  <div className="flex gap-3 items-center">
                    <span className="text-xl">{selectedBooking.service_mode === 'Luxury Van' ? '🚐' : '🏠'}</span>
                    <p className="font-bold text-[#1A1A1A]">{selectedBooking.service_mode === 'Luxury Van' ? 'Luxury Van Service' : 'In-Home Service'}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="font-bold text-[#1A1A1A]">{new Date(selectedBooking.booking_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-gray-500 font-medium">{selectedBooking.booking_time_slot || new Date(selectedBooking.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xl">📍</span>
                    <p className="font-medium text-gray-600 text-sm leading-relaxed">{selectedBooking.address}</p>
                  </div>
                  {(!selectedBooking.latitude || !selectedBooking.longitude) && (
                    <div className="mt-2 bg-yellow-50 text-yellow-800 text-[10px] p-2 rounded-lg font-bold">
                        ⚠️ Exact GPS coordinates not captured for this booking.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Assigned Provider</h3>
                
                {selectedBooking.stylist ? (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-200 overflow-hidden shrink-0">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedBooking.stylist.full_name}&backgroundColor=0B3D2E&textColor=ffffff`} alt="avatar" />
                       </div>
                       <div>
                         <p className="font-bold text-blue-900">{selectedBooking.stylist.full_name}</p>
                         <p className="text-xs text-blue-700 font-medium">📞 {selectedBooking.stylist.phone || 'No phone provided'}</p>
                         <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider mt-1">{selectedBooking.stylist.provider_type}</p>
                       </div>
                    </div>
                    <span className="text-2xl drop-shadow-sm">{selectedBooking.stylist.provider_type === 'Luxury Van' ? '🚐' : '🏠'}</span>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800 font-bold text-sm flex items-center gap-3 shadow-sm">
                     <span className="animate-spin text-xl">⏳</span> 
                     <div>
                       <p>Broadcasting to Providers...</p>
                       <p className="text-xs font-medium mt-1 opacity-80">Waiting for a stylist to accept.</p>
                     </div>
                  </div>
                )}

                <div className="mt-3">
                  <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">
                    {selectedBooking.stylist ? "Change Assigned Stylist" : "Assign a Stylist"}
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm cursor-pointer"
                    value={selectedBooking.stylist?.id || ""}
                    onChange={(e) => assignProvider(selectedBooking.id, e.target.value)}
                  >
                    <option value="" disabled>-- Select a Stylist --</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.provider_type || 'Stylist'})
                      </option>
                    ))}
                  </select>
                </div>
                
                {getMappedTab(selectedBooking.status) === 'completed' && selectedBooking.proof_photo_url && (
                  <div className="mt-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2 px-2 pt-2">Completion Proof</p>
                    <img src={selectedBooking.proof_photo_url} alt="Proof" className="w-full h-48 object-cover rounded-xl" />
                  </div>
                )}
              </div>

            </div>

            {/* Drawer Footer / Actions */}
            <div className="p-6 border-t border-gray-100 bg-white flex gap-3 shrink-0">
              {getMappedTab(selectedBooking.status) === 'pending' && (
                <>
                  <button onClick={() => updateStatus(selectedBooking.id, 'cancelled')} className="flex-1 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition">Cancel Job</button>
                </>
              )}
              {getMappedTab(selectedBooking.status) === 'active' && (
                <button onClick={() => updateStatus(selectedBooking.id, 'completed')} className="w-full py-3 bg-[#0B3D2E] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition">Force Complete (Admin)</button>
              )}
              {(getMappedTab(selectedBooking.status) === 'completed' || getMappedTab(selectedBooking.status) === 'cancelled') && (
                <button onClick={closeDrawer} className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Close Panel</button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}