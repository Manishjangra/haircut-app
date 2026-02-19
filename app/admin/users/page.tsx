'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      // Fetching from your existing 'profiles' table
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      setUsers(data || [])
      setLoading(false)
    }
    fetchUsers()
  }, [])

  // Filter users based on the search bar
  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.phone_number || '').includes(searchQuery)
  )

  if (loading) return <div className="p-10 text-center text-[#0B3D2E] font-bold">Loading Customer Database...</div>

  return (
    <div className="space-y-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Customer Database</h1>
          <p className="text-gray-500 mt-1">Manage your registered users, admins, and stylists.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <span className="absolute left-4 top-3 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm transition"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0B3D2E] text-white text-xs uppercase tracking-widest font-bold">
              <tr>
                <th className="p-6">Customer Name</th>
                <th className="p-6">Contact Info</th>
                <th className="p-6">Role</th>
                <th className="p-6 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition duration-200 group">
                    
                    {/* Name & Avatar */}
                    <td className="p-6 flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200 group-hover:border-[#D4AF37] transition shrink-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.full_name || 'U'}&backgroundColor=0B3D2E&textColor=ffffff`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-[#1A1A1A]">{u.full_name || 'No Name Provided'}</span>
                    </td>

                    {/* Phone */}
                    <td className="p-6 text-gray-600 font-medium">
                      {u.phone_number || <span className="text-gray-400 italic">Not provided</span>}
                    </td>

                    {/* Role Badge */}
                    <td className="p-6">
                      <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-wider
                        ${u.role === 'admin' ? 'bg-[#D4AF37]/20 text-[#0B3D2E]' : 
                          u.role === 'stylist' ? 'bg-blue-100 text-blue-800' : 
                          'bg-[#E6F4EA] text-[#0B3D2E]'}`}>
                        {u.role || 'customer'}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="p-6 text-right text-sm text-gray-500 font-medium">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}