'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function FleetManagementPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [providerType, setProviderType] = useState('In-Home Stylist') 
  const [isAdding, setIsAdding] = useState(false)

  // Drawer & History State
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [providerBookings, setProviderBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => { fetchProviders() }, [])

  async function fetchProviders() {
    setLoading(true)
    const { data, error } = await supabase.from('providers').select('*').order('created_at', { ascending: false })
    if (!error) setProviders(data || [])
    setLoading(false)
  }

  // --- FETCH JOB HISTORY FOR SELECTED PROVIDER ---
  async function fetchProviderHistory(providerId: string) {
    setLoadingBookings(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(name, price)')
      .eq('assigned_stylist_id', providerId)
      .order('booking_date', { ascending: false })

    if (!error && data) {
      setProviderBookings(data)
    } else {
      setProviderBookings([])
    }
    setLoadingBookings(false)
  }

  async function addProvider(e: React.FormEvent) {
    e.preventDefault()
    if (!newName) return alert("Name is required")

    const dummyId = crypto.randomUUID() 

    await supabase.from('providers').insert({
      id: dummyId,
      full_name: newName,
      phone: newPhone,
      email: newEmail,
      provider_type: providerType, 
      is_online: false,          
    })

    setNewName(''); setNewPhone(''); setNewEmail(''); setProviderType('In-Home Stylist')
    setIsAdding(false)
    fetchProviders()
  }

  async function deleteProvider(id: string) {
    if(!confirm("Are you sure you want to remove this provider permanently?")) return
    await supabase.from('providers').delete().eq('id', id)
    fetchProviders()
  }

  function openDrawer(provider: any) {
    setSelectedProvider(provider)
    setIsDrawerOpen(true)
    // Fetch their history the moment the drawer opens!
    fetchProviderHistory(provider.id)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setTimeout(() => {
      setSelectedProvider(null)
      setProviderBookings([])
    }, 300)
  }

  const filteredProviders = providers.filter(p =>
    (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.provider_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone || '').includes(searchQuery)
  )

  // Calculate earnings dynamically from completed jobs
  const totalEarned = providerBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.services?.price || 0), 0)

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Fleet Management</h1>
          <p className="text-gray-500 mt-1">Manage your registered App Providers, Vans, and Stylists.</p>
        </div>

        <div className="flex gap-4">
          <div className="relative w-full md:w-64">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm"
            />
          </div>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-[#0B3D2E] text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg transition">
            {isAdding ? 'Cancel' : '+ Add Provider'}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D4AF37] animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-[#0B3D2E] mb-4">Add Provider Manually</h2>
          <form onSubmit={addProvider} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
              <input required className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#0B3D2E] outline-none" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
              <input className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#0B3D2E] outline-none" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="555-0000" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input type="email" className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#0B3D2E] outline-none" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="stylist@example.com" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service Fleet Type</label>
              <select className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#0B3D2E] outline-none bg-white font-medium text-[#0B3D2E]" value={providerType} onChange={e => setProviderType(e.target.value)}>
                <option value="In-Home Stylist">In-Home Stylist</option>
                <option value="Luxury Van">Luxury Van</option>
              </select>
            </div>
            <button type="submit" className="bg-[#D4AF37] text-[#0B3D2E] px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#c29f31] transition">
              Save Profile
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center p-10 text-gray-500 font-bold">Loading Fleet...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-4">
          {filteredProviders.length === 0 ? (
            <div className="col-span-full p-10 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
              No providers registered yet.
            </div>
          ) : (
            filteredProviders.map(p => {
              const isVan = p.provider_type === 'Luxury Van';
              return (
                <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col items-center text-center relative group">
                  <button onClick={() => deleteProvider(p.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100" title="Remove Provider">🗑️</button>

                  <div className="relative w-20 h-20 mb-4">
                    <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.full_name || 'U'}&backgroundColor=0B3D2E&textColor=ffffff`} alt={p.full_name} className="w-full h-full object-cover" />
                    </div>
                    <span className={`absolute bottom-0 right-0 w-5 h-5 border-2 border-white rounded-full ${p.is_online ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}></span>
                  </div>

                  <h3 className="font-bold text-xl text-[#0B3D2E]">{p.full_name || 'Unknown'}</h3>
                  
                  <div className="mt-2">
                    {isVan ? (
                       <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-blue-200 flex items-center gap-1">
                         <span>🚐</span> Luxury Van
                       </span>
                    ) : (
                       <span className="px-3 py-1 bg-[#E6F4EA] text-[#0B3D2E] text-[10px] font-black rounded-full uppercase tracking-wider border border-green-200 flex items-center gap-1">
                         <span>🏠</span> In-Home Stylist
                       </span>
                    )}
                  </div>

                  <button 
                    onClick={() => openDrawer(p)} 
                    className="w-full mt-6 py-2.5 bg-gray-50 text-[#0B3D2E] text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-100 transition"
                  >
                    View Full Profile
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* --- DRAWER COMPONENT --- */}
      {isDrawerOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDrawer}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-8 bg-[#0B3D2E] text-white flex flex-col items-center relative text-center shrink-0">
              <button onClick={closeDrawer} className="absolute top-4 right-6 text-white hover:text-[#D4AF37] text-3xl">&times;</button>
              
              <div className="relative w-24 h-24 mb-4">
                <div className="w-full h-full bg-white rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-lg">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedProvider.full_name || 'U'}&backgroundColor=0B3D2E&textColor=ffffff`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                {selectedProvider.is_online && <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#0B3D2E] rounded-full"></span>}
              </div>
              
              <h2 className="text-2xl font-bold">{selectedProvider.full_name || 'No Name'}</h2>
              <p className="text-gray-300 text-xs font-mono mt-1 mb-3">ID: {selectedProvider.id.substring(0,8)}...</p>
              
              <span className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Fleet: {selectedProvider.provider_type}
              </span>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-gray-50">
              
              {/* --- EARNINGS DASHBOARD --- */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Earnings</h3>
                 <div className="text-4xl font-black text-green-600">
                   ${totalEarned.toFixed(2)}
                 </div>
                 <p className="text-xs text-gray-500 mt-2">From {providerBookings.filter(b => b.status === 'completed').length} completed jobs</p>
              </div>

              {/* --- JOB HISTORY LIST --- */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-200 pb-2">Job History ({providerBookings.length})</h3>
                
                {loadingBookings ? (
                  <div className="text-center py-6 text-sm font-bold text-gray-400 animate-pulse">Loading history...</div>
                ) : providerBookings.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-xl border border-gray-100 text-sm text-gray-400">
                    No jobs assigned yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providerBookings.map(job => (
                      <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-[#0B3D2E]">{job.services?.name || 'Unknown Service'}</p>
                          <span className="font-black text-[#D4AF37]">${job.services?.price || 0}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">
                            {new Date(job.booking_date).toLocaleDateString()}
                          </span>
                          
                          <span className={`px-2 py-1 font-bold rounded uppercase tracking-wider text-[9px]
                            ${job.status === 'completed' ? 'bg-[#E6F4EA] text-green-800' : 
                              job.status === 'confirmed' ? 'bg-blue-50 text-blue-800' : 
                              job.status === 'cancelled' ? 'bg-red-50 text-red-800' : 
                              'bg-gray-100 text-gray-600'}`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* --- CONTACT INFO --- */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-200 pb-2">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <span className="text-lg">📞</span>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                      <p className="font-bold text-gray-800 text-sm">{selectedProvider.phone || 'Not Provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <span className="text-lg">✉️</span>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                      <p className="font-bold text-gray-800 text-sm truncate">{selectedProvider.email || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 bg-white shrink-0">
               <button onClick={closeDrawer} className="w-full py-4 bg-[#0B3D2E] text-[#D4AF37] font-black rounded-xl hover:bg-[#072a20] transition shadow-md">
                 Close Profile
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}