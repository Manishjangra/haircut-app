'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// --- CONSTANTS ---
const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", 
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
]

const CANCEL_REASONS = [
  "Change of plans",
  "Found another stylist",
  "Too expensive",
  "Booked by mistake",
  "Other"
]

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Tabs & Modals
  const [activeTab, setActiveTab] = useState('upcoming') 
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  
  // Form State
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  // --- 1. FETCH DATA ---
  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('bookings')
      .select('*, services(name, price, duration_minutes)')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: true }) // Upcoming first

    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // --- 2. HELPERS ---
  const handleCancelConfirm = async () => {
    if (!cancelReason) return alert("Please select a reason")
    const { error } = await supabase.from('bookings').update({ status: 'cancelled', cancellation_reason: cancelReason }).eq('id', selectedBooking.id)
    if (!error) { setShowCancel(false); fetchData(); }
  }

  const handleRescheduleConfirm = async () => {
    if (!newDate || !newTime) return alert("Select date & time")
    const fullDate = new Date(`${newDate} ${newTime}`).toISOString()
    const { error } = await supabase.from('bookings').update({ booking_date: fullDate, status: 'pending' }).eq('id', selectedBooking.id)
    if (!error) { setShowReschedule(false); fetchData(); }
  }

  // Filter Data
  const now = new Date()
  const upcoming = bookings.filter(b => new Date(b.booking_date) > now && b.status !== 'cancelled')
  const history = bookings.filter(b => new Date(b.booking_date) <= now || b.status === 'cancelled')
  
  // The "Next" Appointment is the first one in the upcoming list
  const nextAppointment = upcoming.length > 0 ? upcoming[0] : null
  const futureAppointments = upcoming.length > 1 ? upcoming.slice(1) : []

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8F9FA]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0B3D2E]"></div></div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-[#0B3D2E] text-white pt-12 pb-24 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex justify-between items-end relative z-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-[#D4AF37] font-medium tracking-wide text-sm uppercase">Manage Your Style</p>
          </div>
          {/* Custom Tab Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-full flex">
            <button onClick={() => setActiveTab('upcoming')} className={`px-6 py-2 rounded-full text-sm font-bold transition ${activeTab === 'upcoming' ? 'bg-[#D4AF37] text-[#0B3D2E]' : 'text-white hover:bg-white/10'}`}>Upcoming</button>
            <button onClick={() => setActiveTab('past')} className={`px-6 py-2 rounded-full text-sm font-bold transition ${activeTab === 'past' ? 'bg-[#D4AF37] text-[#0B3D2E]' : 'text-white hover:bg-white/10'}`}>History</button>
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* --- VIEW: UPCOMING --- */}
        {activeTab === 'upcoming' && (
          <div className="space-y-8">
            
            {/* 1. HERO CARD (Next Appointment) */}
            {nextAppointment ? (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                
                {/* Left: Info */}
                <div className="p-8 md:p-10 flex-1 flex flex-col justify-between relative">
                  <div>
                    <span className="bg-[#E6F4EA] text-[#0B3D2E] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                      Next Appointment
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B3D2E] mb-2">
                      {nextAppointment.services?.name}
                    </h2>
                    <p className="text-gray-500 text-lg flex items-center gap-2">
                      <span>✂️ with <b>Stylist</b></span>
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-8">
                    <div>
                       <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Date</p>
                       <p className="text-xl font-bold text-[#0B3D2E]">{new Date(nextAppointment.booking_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Time</p>
                       <p className="text-xl font-bold text-[#0B3D2E]">{new Date(nextAppointment.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Price</p>
                       <p className="text-xl font-bold text-[#D4AF37]">${nextAppointment.services?.price}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button 
                      onClick={() => { setSelectedBooking(nextAppointment); setShowReschedule(true); }}
                      className="px-6 py-3 rounded-xl border-2 border-gray-100 font-bold text-[#0B3D2E] hover:border-[#0B3D2E] transition"
                    >
                      Reschedule
                    </button>
                    <button 
                       onClick={() => { setSelectedBooking(nextAppointment); setShowCancel(true); }}
                       className="px-6 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Right: Map/Visual (Placeholder) */}
                <div className="w-full md:w-1/3 bg-[#F0FDF4] relative min-h-[200px]">
                   {/* This simulates a map view */}
                   <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=14&size=400x400&sensor=false&key=YOUR_KEY')] bg-cover opacity-50 grayscale"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-3 rounded-full shadow-lg animate-bounce">
                        📍
                      </div>
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl text-xs text-gray-600 border border-white">
                      {nextAppointment.address}
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl shadow-lg text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-[#0B3D2E] mb-2">No Upcoming Bookings</h3>
                <Link href="/" className="text-[#D4AF37] font-bold hover:underline">Book a fresh cut now →</Link>
              </div>
            )}

            {/* 2. FUTURE BOOKINGS GRID */}
            {futureAppointments.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-[#0B3D2E] mb-6 ml-2">Future Bookings</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {futureAppointments.map(b => (
                    <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#F8F9FA] p-3 rounded-xl text-2xl group-hover:bg-[#E6F4EA] transition">✂️</div>
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded uppercase">{b.status}</span>
                      </div>
                      <h4 className="font-bold text-lg text-[#0B3D2E] mb-1">{b.services?.name}</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        {new Date(b.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(b.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                         <span className="font-bold text-[#0B3D2E]">${b.services?.price}</span>
                         <button onClick={() => { setSelectedBooking(b); setShowReschedule(true); }} className="text-sm font-bold text-gray-400 hover:text-[#0B3D2E]">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: HISTORY --- */}
        {activeTab === 'past' && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            {history.length === 0 ? (
               <div className="p-12 text-center text-gray-400">No past bookings found.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-6 font-bold">Service</th>
                    <th className="p-6 font-bold hidden md:table-cell">Date</th>
                    <th className="p-6 font-bold">Status</th>
                    <th className="p-6 font-bold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="p-6">
                        <p className="font-bold text-[#0B3D2E]">{b.services?.name}</p>
                        <p className="text-xs text-gray-400 md:hidden">{new Date(b.booking_date).toLocaleDateString()}</p>
                      </td>
                      <td className="p-6 text-gray-600 hidden md:table-cell">
                        {new Date(b.booking_date).toLocaleDateString()}
                      </td>
                      <td className="p-6">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           b.status === 'completed' ? 'bg-green-100 text-green-800' : 
                           b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                         }`}>
                           {b.status}
                         </span>
                         {b.status === 'cancelled' && b.cancellation_reason && (
                           <p className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate">Note: {b.cancellation_reason}</p>
                         )}
                      </td>
                      <td className="p-6 text-right font-bold text-[#0B3D2E]">${b.services?.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* --- MODALS (Same Logic, updated CSS) --- */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-[#0B3D2E] mb-6">Change Slot</h3>
            
            <div className="space-y-4">
              <input type="date" className="w-full p-4 bg-gray-50 rounded-xl font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]" onChange={e => setNewDate(e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setNewTime(t)} className={`py-2 rounded-lg text-xs font-bold border transition ${newTime === t ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]' : 'border-gray-200 hover:border-[#0B3D2E]'}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowReschedule(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Cancel</button>
              <button onClick={handleRescheduleConfirm} className="flex-1 py-3 bg-[#D4AF37] text-[#0B3D2E] font-bold rounded-xl shadow-lg hover:shadow-xl transition">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl mb-4 text-red-600">⚠️</div>
            <h3 className="text-2xl font-bold text-[#0B3D2E] mb-2">Cancel Booking?</h3>
            <p className="text-gray-500 mb-6">Please tell us why you are cancelling.</p>
            
            <div className="space-y-3 mb-8">
              {CANCEL_REASONS.map(r => (
                <label key={r} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${cancelReason === r ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <input type="radio" name="cr" value={r} onChange={e => setCancelReason(e.target.value)} className="accent-red-600 w-4 h-4" />
                  <span className="text-sm font-bold text-gray-700">{r}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Keep it</button>
              <button onClick={handleCancelConfirm} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition">Cancel Booking</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}