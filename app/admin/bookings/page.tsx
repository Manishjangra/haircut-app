'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [stylists, setStylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    
    // 1. Get Stylists
    const { data: stylistData } = await supabase.from('stylists').select('*')
    setStylists(stylistData || [])

    // 2. Get Bookings (Asking for Name AND Price now)
    const { data: bookingData, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        address,
        status,
        stylist_id,
        services ( name, price ),  
        profiles ( full_name, phone_number )
      `)
      .order('booking_date', { ascending: false })
   
   
      console.log("Raw Data from Database:", bookingData)

    if (error) {
      console.error("Error fetching bookings:", error)
    } else {
      setBookings(bookingData || [])
    }
    setLoading(false)
  }

  // Assign Stylist
  async function assignStylist(bookingId: number, stylistId: string) {
    if (!stylistId) return
    const { error } = await supabase
      .from('bookings')
      .update({ stylist_id: parseInt(stylistId), status: 'confirmed' })
      .eq('id', bookingId)

    if (error) alert("Failed to assign stylist")
    else fetchData()
  }

  // Update Status
  async function updateStatus(id: number, status: string) {
    if (status === 'cancelled' && !confirm("Cancel this booking?")) return;
    await supabase.from('bookings').update({ status }).eq('id', id)
    fetchData()
  }

  if (loading) return <div className="p-10 text-gray-500">Loading bookings...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <button onClick={fetchData} className="text-sm text-blue-600 hover:underline">Refresh List ↻</button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 border-b">Date</th>
              <th className="p-4 border-b">Customer</th>
              <th className="p-4 border-b">Service</th>
              <th className="p-4 border-b">Price</th> 
              <th className="p-4 border-b w-48">Stylist</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {bookings.map(b => {
              // Data Safety Checks
              const serviceName = b.services?.name || 'Unknown Service';
              const servicePrice = b.services?.price ? `₹${b.services.price}` : '-';
              const userName = b.profiles?.full_name || 'Guest User';
              const userPhone = b.profiles?.phone_number || 'No Phone';

              return (
                <tr key={b.id} className="border-b hover:bg-gray-50 transition">
                  
                  {/* Date */}
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">
                      {new Date(b.booking_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(b.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{userName}</div>
                    <div className="text-gray-500">{userPhone}</div>
                    <div className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={b.address}>
                      📍 {b.address}
                    </div>
                  </td>

                  {/* Service Name */}
                   <td className="p-4">
                    <span className={`font-medium ${b.services ? 'text-blue-700' : 'text-red-500'}`}>
                        {b.services ? b.services.name : 'Deleted Service'}
                    </span>
                    </td>

                  {/* Price */}
                    <td className="p-4 font-bold text-green-700">
                    {b.services ? `₹${b.services.price}` : '₹0'}
                    </td>

                  {/* Stylist Dropdown */}
                  <td className="p-4">
                    <select 
                      className={`border rounded p-2 text-sm w-full outline-none focus:ring-2 focus:ring-blue-500
                        ${b.stylist_id ? 'bg-white text-black' : 'bg-red-50 text-red-500 font-medium'}`}
                      value={b.stylist_id || ""}
                      onChange={(e) => assignStylist(b.id, e.target.value)}
                      disabled={b.status === 'cancelled' || b.status === 'completed'}
                    >
                      <option value="" disabled>⚠️ Needs Stylist</option>
                      {stylists.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                        b.status === 'completed' ? 'bg-gray-800 text-white' : 
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                      {b.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {b.status !== 'completed' && b.status !== 'cancelled' && (
                        <button onClick={() => updateStatus(b.id, 'cancelled')} 
                          className="text-red-600 hover:text-red-800 font-bold px-2">✕</button>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b.id, 'completed')} 
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Done</button>
                      )}
                    </div>
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
        
        {bookings.length === 0 && (
           <div className="p-10 text-center text-gray-500">No bookings found yet.</div>
        )}
      </div>
    </div>
  )
}