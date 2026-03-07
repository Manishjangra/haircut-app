'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') 

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => { fetchUsersAndProviders() }, [])

  // 1. IMPROVED FETCH & MERGE LOGIC (Fixes the wrong name bug!)
  async function fetchUsersAndProviders() {
    setLoading(true)
    
    const { data: profilesData } = await supabase.from('profiles').select('*')
    const { data: providersData } = await supabase.from('providers').select('*')

    const allUsersMap = new Map()

    // Load standard profiles first
    profilesData?.forEach(p => {
      allUsersMap.set(p.id, { ...p, role: p.role || 'customer' })
    })

    // OVERRIDE with Provider data if they registered via the App!
    providersData?.forEach(p => {
      const existing = allUsersMap.get(p.id) || {}
      allUsersMap.set(p.id, {
        ...existing,
        id: p.id,
        // Prioritize the name and phone from the provider app!
        full_name: p.full_name || existing.full_name,
        phone_number: p.phone || existing.phone_number,
        email: p.email || existing.email,
        created_at: existing.created_at || p.created_at,
        is_provider: true,
        provider_type: p.provider_type,
        is_online: p.is_online,
        role: 'stylist'
      })
    })

    const finalUsers = Array.from(allUsersMap.values()).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    setUsers(finalUsers)
    setLoading(false)
  }

  function openDrawer(user: any) {
    setSelectedUser(user)
    setIsDrawerOpen(true)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedUser(null), 300)
  }

  const filteredUsers = users.filter(u => {
    let matchesTab = true;
    if (activeTab === 'customer') matchesTab = u.role === 'customer' && !u.is_prime
    if (activeTab === 'prime') matchesTab = u.is_prime
    if (activeTab === 'in-home') matchesTab = u.provider_type === 'In-Home Stylist'
    if (activeTab === 'van') matchesTab = u.provider_type === 'Luxury Van'
    if (activeTab === 'admin') matchesTab = u.role === 'admin'

    const searchString = searchQuery.toLowerCase()
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(searchString) ||
      (u.phone_number || '').includes(searchString) ||
      (u.email || '').toLowerCase().includes(searchString)

    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-8 relative">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">User Profiles</h1>
          <p className="text-gray-500 mt-1">Manage all customers, prime members, and app providers.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <span className="absolute left-4 top-2.5 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search name, phone, email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm transition text-sm"
          />
        </div>
      </div>

      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-1 overflow-x-auto">
        {[
          { id: 'all', label: 'All Users' },
          { id: 'customer', label: 'Customers' },
          { id: 'prime', label: '⭐ Prime' },
          { id: 'in-home', label: '🏠 In-Home' },
          { id: 'van', label: '🚐 Van Stylists' },
          { id: 'admin', label: 'Admins' }
        ].map((tab) => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition duration-300 ${
              activeTab === tab.id ? 'bg-[#0B3D2E] text-[#D4AF37] shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[#0B3D2E] font-bold">Loading Full Database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#F8F9FA] text-[#0B3D2E] text-xs uppercase tracking-widest font-bold border-b border-gray-100">
                <tr>
                  <th className="p-6">Identity</th>
                  <th className="p-6">Contact Info</th>
                  <th className="p-6">Account Type</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-gray-400 font-medium">No users found matching your filters.</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition duration-200">
                      <td className="p-6 flex items-center gap-4">
                        <div className="relative w-10 h-10 shrink-0">
                          <div className="w-full h-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.full_name || 'U'}&backgroundColor=0B3D2E&textColor=ffffff`} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          {u.is_online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1A1A1A]">{u.full_name || 'No Name Provided'}</span>
                            {u.is_prime && <span className="text-xs" title="Prime Member">⭐</span>}
                          </div>
                          <span className="text-xs text-gray-400 font-mono">Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-gray-600 font-medium">
                        <div className="flex items-center gap-2"><span>✉️</span> <span className="truncate max-w-[150px]">{u.email || 'N/A'}</span></div>
                        <div className="mt-1 flex items-center gap-2"><span>📞</span> <span>{u.phone_number || 'N/A'}</span></div>
                      </td>
                      <td className="p-6">
                        {u.role === 'admin' && <span className="px-3 py-1 text-[10px] font-bold rounded-full uppercase bg-[#D4AF37]/20 text-[#0B3D2E]">Admin</span>}
                        {u.role === 'customer' && !u.is_prime && <span className="px-3 py-1 text-[10px] font-bold rounded-full uppercase bg-gray-100 text-gray-600">Standard Customer</span>}
                        {u.is_prime && <span className="px-3 py-1 text-[10px] font-bold rounded-full uppercase bg-[#0B3D2E] text-[#D4AF37] border border-[#D4AF37]">⭐ Prime Customer</span>}
                        {u.provider_type === 'In-Home Stylist' && <span className="px-3 py-1 text-[10px] font-bold rounded-full uppercase bg-[#E6F4EA] text-[#0B3D2E]">🏠 In-Home Stylist</span>}
                        {u.provider_type === 'Luxury Van' && <span className="px-3 py-1 text-[10px] font-bold rounded-full uppercase bg-blue-50 text-blue-700">🚐 Luxury Van</span>}
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => openDrawer(u)} className="px-4 py-2 text-sm font-bold text-[#0B3D2E] bg-gray-100 rounded-lg hover:bg-gray-200 transition">Full Profile</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDrawer}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 bg-[#0B3D2E] text-white flex flex-col items-center relative text-center">
              <button onClick={closeDrawer} className="absolute top-4 right-6 text-white hover:text-[#D4AF37] text-3xl">&times;</button>
              <div className="relative w-24 h-24 mb-4">
                <div className="w-full h-full bg-white rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-lg">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.full_name || 'U'}&backgroundColor=0B3D2E&textColor=ffffff`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                {selectedUser.is_online && <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#0B3D2E] rounded-full"></span>}
              </div>
              <h2 className="text-2xl font-bold">{selectedUser.full_name || 'No Name'}</h2>
              <p className="text-gray-300 text-xs font-mono mt-1 mb-3">ID: {selectedUser.id}</p>
              <span className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                {selectedUser.provider_type ? `Provider: ${selectedUser.provider_type}` : (selectedUser.is_prime ? 'Prime Customer' : selectedUser.role)}
              </span>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {selectedUser.is_prime && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-4 rounded-xl flex items-center gap-4">
                  <div className="text-3xl drop-shadow-sm">⭐</div>
                  <div>
                    <h3 className="font-black text-[#0B3D2E]">Active Prime Member</h3>
                    <p className="text-xs text-[#0B3D2E]/70 font-bold uppercase mt-1">
                      Expires: {selectedUser.prime_expiry ? new Date(selectedUser.prime_expiry).toLocaleDateString() : 'Lifetime Access'}
                    </p>
                  </div>
                </div>
              )}

              {selectedUser.is_provider && (
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                   <h3 className="text-xs font-bold text-blue-800 uppercase mb-3 border-b border-blue-200 pb-2 flex items-center gap-2">
                     {selectedUser.provider_type === 'Luxury Van' ? '🚐 Van Logistics' : '🏠 In-Home Stylist Status'}
                   </h3>
                   <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span className="font-bold text-blue-900">Current Status:</span>
                       <span className={`font-black uppercase ${selectedUser.is_online ? 'text-green-600' : 'text-gray-500'}`}>
                         {selectedUser.is_online ? '● Online & Ready' : '○ Offline'}
                       </span>
                     </div>
                   </div>
                </div>
              )}
              
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-100 pb-2">Contact Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">📞</span>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                      <p className="font-bold text-gray-800">{selectedUser.phone_number || 'Not Provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">✉️</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                      <p className="font-bold text-gray-800 truncate">{selectedUser.email || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
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