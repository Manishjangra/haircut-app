'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, users: 0 })

  useEffect(() => {
    async function getStats() {
      // 1. Get total bookings
      const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
      
      // 2. Get total users
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

      // 3. Calculate Revenue (Sum of confirmed bookings)
      // Note: This is a simple estimation. For exact sums, we usually use a SQL function.
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('services(price)')
        .eq('status', 'completed')
      
      // @ts-ignore
      const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.services?.price || 0), 0) || 0

      setStats({
        bookings: bookingCount || 0,
        users: userCount || 0,
        revenue: totalRevenue
      })
    }
    getStats()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg opacity-80">Total Revenue</h3>
          <p className="text-4xl font-bold mt-2">₹{stats.revenue}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <h3 className="text-gray-500">Total Bookings</h3>
          <p className="text-4xl font-bold mt-2 text-gray-800">{stats.bookings}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
          <h3 className="text-gray-500">Active Users</h3>
          <p className="text-4xl font-bold mt-2 text-gray-800">{stats.users}</p>
        </div>
      </div>

      <div className="mt-10 p-6 bg-white rounded shadow">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <a href="/admin/bookings" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black">Manage Bookings</a>
          <a href="/admin/services" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black">Update Prices</a>
        </div>
      </div>
    </div>
  )
}