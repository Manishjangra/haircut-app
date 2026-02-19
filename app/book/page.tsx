'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

function BookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const serviceId = searchParams.get('serviceId')
  const serviceName = searchParams.get('name') || 'Service'
  
  // Default prices (In a real app, fetch this from DB)
  // We try to grab price from URL or default to 45
  const price = 45 

  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock Time Slots for the "App-like" feel
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", 
    "01:00 PM", "02:00 PM", "03:00 PM", 
    "04:00 PM", "05:00 PM"
  ]

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login?redirect=/book')
      else setUser(user)
    }
    getUser()
  }, [])

  async function handleBooking() {
    if (!selectedDate || !selectedTime || !address) {
      alert("Please fill in all details.")
      return
    }

    setLoading(true)
    // Combine Date and Time
    const fullDate = new Date(`${selectedDate} ${selectedTime}`).toISOString()

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      service_id: serviceId,
      booking_date: fullDate,
      address: address,
      status: 'pending'
    })

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push('/my-bookings?success=true')
    }
    setLoading(false)
  }

  if (!user) return <div className="p-20 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* 1. Date Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#0B3D2E] mb-4 flex items-center gap-2">
              <span className="bg-[#E6F4EA] p-2 rounded-lg text-[#0B3D2E]">📅</span> Select Date
            </h2>
            <input 
              type="date" 
              className="w-full p-4 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#D4AF37] outline-none font-medium text-gray-700"
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* 2. Time Selection (Visual Grid) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[#0B3D2E] mb-4 flex items-center gap-2">
              <span className="bg-[#E6F4EA] p-2 rounded-lg text-[#0B3D2E]">⏰</span> Select Time
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 px-2 rounded-xl text-sm font-bold transition border
                    ${selectedTime === time 
                      ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37]'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Address */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold text-[#0B3D2E] mb-4 flex items-center gap-2">
              <span className="bg-[#E6F4EA] p-2 rounded-lg text-[#0B3D2E]">📍</span> Location
            </h2>
            <textarea 
              placeholder="Enter your full address..."
              className="w-full p-4 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#D4AF37] outline-none h-24 resize-none"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY (Sticky) */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-[#0B3D2E] mb-6 border-b pb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Service</span>
                <span className="font-medium text-[#1A1A1A] text-right w-1/2">{serviceName}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Stylist</span>
                <span className="font-medium text-[#1A1A1A]">Any Pro</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Date</span>
                <span className="font-medium text-[#1A1A1A]">{selectedDate || '--'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Time</span>
                <span className="font-medium text-[#1A1A1A]">{selectedTime || '--'}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6 flex justify-between items-center">
              <span className="font-bold text-lg text-[#0B3D2E]">Total</span>
              <span className="font-bold text-2xl text-[#0B3D2E]">${price}</span>
            </div>

            <button 
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-[#D4AF37] text-[#0B3D2E] py-4 rounded-xl font-bold hover:bg-[#b8962e] transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4">
              Free cancellation up to 2 hours before.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

// Suspense wrapper is required for useSearchParams in Next.js
export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Booking...</div>}>
      <BookingContent />
    </Suspense>
  )
}