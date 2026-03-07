'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

function BookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const serviceId = searchParams.get('serviceId')
  const serviceName = searchParams.get('name') || 'Service'
  const price = 45 // Default fallback price
  
  const [user, setUser] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form Data
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

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
  }, [router])

  async function handleBooking() {
    setLoading(true)
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
      setLoading(false)
    } else {
      router.push('/my-bookings?success=true')
    }
  }

  // Helper to check if current step is valid to proceed
  const isStepValid = () => {
    if (currentStep === 1) return selectedDate !== '' && selectedTime !== ''
    if (currentStep === 2) return address.trim() !== ''
    return true
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0B3D2E]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER & PROGRESS BAR */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-[#0B3D2E] mb-6">Book Appointment</h1>
          
          <div className="flex justify-between items-center relative max-w-sm mx-auto">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-[#D4AF37] -z-10 -translate-y-1/2 transition-all duration-300" 
              style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
            ></div>

            {/* Step Indicators */}
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm
                  ${currentStep >= step ? 'bg-[#0B3D2E] text-[#D4AF37]' : 'bg-white text-gray-400 border-2 border-gray-200'}
                `}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-sm mx-auto mt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Schedule</span>
            <span>Location</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* STEPPER CONTENT CARD */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10 min-h-[400px] flex flex-col justify-between">
          
          {/* STEP 1: DATE & TIME */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#0B3D2E]">When should we come?</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Select Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  className="w-full p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none font-medium text-gray-700 transition"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Select Time</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border
                        ${selectedTime === time 
                          ? 'bg-[#0B3D2E] text-[#D4AF37] border-[#0B3D2E] shadow-md scale-105' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#D4AF37]'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#0B3D2E]">Where are we heading?</h2>
              
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Full Address</label>
                <textarea 
                  placeholder="Street address, City, ZIP code, any special instructions..."
                  className="w-full p-4 bg-[#F8F9FA] rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none h-40 resize-none font-medium text-gray-700 transition"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#0B3D2E]">Review your booking</h2>
              
              <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-gray-200 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Service</p>
                    <p className="font-bold text-lg text-[#0B3D2E]">{serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase">Price</p>
                    <p className="font-black text-xl text-[#D4AF37]">${price}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : ''}</p>
                    <p className="text-gray-500">{selectedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl">📍</span>
                  <p className="font-medium text-gray-600">{address}</p>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
                <span>🔒</span> Payment collected securely on-site or via invoice.
              </p>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="mt-10 flex gap-4 pt-6 border-t border-gray-100">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition"
              >
                Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!isStepValid()}
                className="flex-1 bg-[#D4AF37] text-[#0B3D2E] py-4 rounded-xl font-bold hover:bg-[#c4a02d] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step →
              </button>
            ) : (
              <button 
                onClick={handleBooking}
                disabled={loading}
                className="flex-1 bg-[#0B3D2E] text-[#D4AF37] py-4 rounded-xl font-black hover:bg-[#072a20] transition shadow-xl disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-[#D4AF37]"></div>
                    Processing...
                  </>
                ) : 'Confirm Appointment'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0B3D2E]"></div></div>}>
      <BookingContent />
    </Suspense>
  )
}