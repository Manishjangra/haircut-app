'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'pending', 'confirmed', 'completed', 'cancelled'

  async function fetchBookings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(name, price)')
      .order('booking_date', { ascending: false })

    if (!error && data) {
      setBookings(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Quick Action to update the status of a booking
  async function updateStatus(id: number, newStatus: string) {
    if (confirm(`Are you sure you want to mark this booking as ${newStatus.toUpperCase()}?`)) {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) {
        alert("Error updating status: " + error.message)
      } else {
        fetchBookings() // Refresh the list
      }
    }
  }

  // Filter the bookings based on the selected tab
  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab)

  if (loading) return <div className="p-10 text-center text-[#0B3D2E] font-bold">Loading Bookings...</div>

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Booking Management</h1>
          <p className="text-gray-500 mt-1">Review, approve, and track all customer appointments.</p>
        </div>
      </div>

      {/* Custom Tab Switcher */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-1">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition duration-300 ${
              activeTab === tab 
                ? 'bg-[#0B3D2E] text-[#D4AF37] shadow-md' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
            {/* Show count badges for specific tabs */}
            {tab !== 'all' && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab ? 'bg-[#D4AF37] text-[#0B3D2E]' : 'bg-gray-200 text-gray-500'
              }`}>
                {bookings.filter(b => b.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#F8F9FA] text-[#0B3D2E] text-xs uppercase tracking-widest font-bold border-b border-gray-100">
              <tr>
                <th className="p-6">Service details</th>
                <th className="p-6">Schedule & Location</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">
                    No bookings found for this category.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition duration-200 group">
                    
                    {/* Service & Price */}
                    <td className="p-6">
                      <p className="font-bold text-[#1A1A1A] text-lg">{b.services?.name || 'Unknown Service'}</p>
                     <p className="text-[#D4AF37] font-black mt-1">${b.services?.price}</p>
                      {/* --- THIS LINE IS FIXED --- */}
                      <p className="text-xs text-gray-400 font-mono mt-2">ID: #{b.id}</p>
                    </td>

                    {/* Date & Location */}
                    <td className="p-6">
                      <div className="flex items-center gap-2 font-bold text-[#0B3D2E] mb-1">
                        <span>📅</span>
                        <span>{new Date(b.booking_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-[#D4AF37]">{new Date(b.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex items-start gap-2 mt-2">
                        <span className="text-gray-400 text-sm">📍</span>
                        <p className="text-sm text-gray-500 max-w-xs leading-snug">{b.address}</p>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="p-6">
                      <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider
                        ${b.status === 'confirmed' ? 'bg-[#E6F4EA] text-green-800 border border-green-200' : 
                          b.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 
                          b.status === 'completed' ? 'bg-gray-100 text-gray-600 border border-gray-200' : 
                          'bg-red-50 text-red-800 border border-red-200'}`}>
                        {b.status}
                      </span>
                      {b.status === 'cancelled' && b.cancellation_reason && (
                        <p className="text-xs text-red-500 mt-2 font-medium max-w-[150px]">
                          Reason: {b.cancellation_reason}
                        </p>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-6 text-right space-x-2">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-4 py-2 bg-[#D4AF37] text-[#0B3D2E] font-bold text-sm rounded-lg hover:shadow-md transition">
                            Approve
                          </button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-lg hover:bg-red-100 transition">
                            Decline
                          </button>
                        </>
                      )}

                      {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b.id, 'completed')} className="px-4 py-2 bg-[#0B3D2E] text-white font-bold text-sm rounded-lg hover:shadow-md transition">
                          Mark Completed
                        </button>
                      )}

                      {(b.status === 'completed' || b.status === 'cancelled') && (
                        <span className="text-gray-400 text-sm font-medium italic">No actions needed</span>
                      )}
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