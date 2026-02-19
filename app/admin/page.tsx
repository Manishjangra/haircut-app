'use client'
import { useEffect, useState } from 'react'
import { supabase } from './../supabaseClient'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch all bookings with service prices
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, services(name, price)')
        .order('created_at', { ascending: false })

      if (bookings) {
        // Calculate Stats
        const total = bookings.length
        const pending = bookings.filter(b => b.status === 'pending').length
        
        // Calculate Revenue (Only for completed or confirmed bookings)
        const revenue = bookings
          .filter(b => b.status === 'completed' || b.status === 'confirmed')
          .reduce((sum, b) => sum + (b.services?.price || 0), 0)

        setStats({ totalBookings: total, pendingBookings: pending, revenue })
        
        // Get the 5 most recent bookings for the preview table
        setRecentBookings(bookings.slice(0, 5))
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0B3D2E]">Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here is what's happening today.</p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#E6F4EA] rounded-xl flex items-center justify-center text-2xl">💰</div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total Revenue</p>
            <h2 className="text-3xl font-black text-[#0B3D2E]">${stats.revenue}</h2>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl">⏳</div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Pending Confirmations</p>
            <h2 className="text-3xl font-black text-[#0B3D2E]">{stats.pendingBookings}</h2>
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">📅</div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Total Bookings</p>
            <h2 className="text-3xl font-black text-[#0B3D2E]">{stats.totalBookings}</h2>
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0B3D2E]">Recent Appointments</h2>
          <Link href="/admin/bookings" className="text-sm font-bold text-[#D4AF37] hover:underline">View All →</Link>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-bold">
            <tr>
              <th className="p-4">Service</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentBookings.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">No recent bookings.</td></tr>
            ) : (
              recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-[#0B3D2E]">{b.services?.name || 'Unknown'}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(b.booking_date).toLocaleDateString()} at {new Date(b.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-wider
                      ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-[#0B3D2E]">
                    ${b.services?.price || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}