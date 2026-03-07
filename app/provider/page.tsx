'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function ProviderDashboard() {
  const [myBookings, setMyBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProviderBookings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return // Redirect to login in a real app
      
      // Assumes you add a "stylist_id" to the bookings table. 
      // Replace 'stylist_id' with 'user_id' if providers book themselves for now.
      const { data } = await supabase
        .from('bookings')
        .select('*, services(name, duration_minutes)')
        .eq('status', 'confirmed') // Only show confirmed jobs
        // .eq('stylist_id', user.id) // <--- UNCOMMENT WHEN SCHEMA IS UPDATED
        .order('booking_date', { ascending: true })

      setMyBookings(data || [])
      setLoading(false)
    }
    fetchProviderBookings()
  }, [])

  if (loading) return <div className="p-10 text-center font-bold">Loading Your Schedule...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-[#0B3D2E] text-white p-8 rounded-3xl shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Schedule</h1>
            <p className="text-[#D4AF37]">View your upcoming confirmed appointments.</p>
          </div>
          <div className="text-5xl">💈</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myBookings.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-white rounded-2xl text-gray-500">
              No upcoming appointments right now. Take a break!
            </div>
          ) : (
            myBookings.map(b => (
              <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-[#D4AF37]">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-[#0B3D2E] text-xl">{b.services?.name}</h3>
                  <span className="bg-[#E6F4EA] text-[#0B3D2E] text-xs font-bold px-2 py-1 rounded">Confirmed</span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <p>📅 {new Date(b.booking_date).toLocaleDateString()}</p>
                  <p>⏰ {new Date(b.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  <p>📍 {b.address}</p>
                </div>

                <button 
                  onClick={async () => {
                    await supabase.from('bookings').update({ status: 'completed' }).eq('id', b.id)
                    window.location.reload()
                  }}
                  className="w-full bg-[#0B3D2E] text-white font-bold py-2 rounded-lg hover:bg-[#D4AF37] hover:text-[#0B3D2E] transition"
                >
                  Mark as Completed
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}