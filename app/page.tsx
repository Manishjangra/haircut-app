'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Link from 'next/link'

export default function Home() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase.from('services').select('*').order('id')
      if (!error) setServices(data || [])
      setLoading(false)
    }
    fetchServices()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#F8F9FA]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B3D2E]"></div>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-white pb-16 pt-12 md:pt-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="order-2 md:order-1">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0B3D2E] leading-[1.15] mb-6 tracking-tight">
              Luxury Grooming, <br />
              Delivered to <br />
              Your Doorstep.
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed">
              Book in seconds, skip the commute. Professional styling in the comfort of your home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#services" className="bg-[#D4AF37] text-[#0B3D2E] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#b8962e] transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 text-center">
                Book Your Stylist Now
              </a>
              <button className="border-2 border-[#0B3D2E] text-[#0B3D2E] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#0B3D2E] hover:text-white transition duration-200">
                Download App
              </button>
            </div>
          </div>

          {/* Right Image (Placeholder) */}
          <div className="order-1 md:order-2 relative">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white rotate-1 hover:rotate-0 transition duration-500">
               {/* This uses a high-quality placeholder. Replace src="" with your own image later. */}
               <img 
                 src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" 
                 alt="Barber Service at Home" 
                 className="w-full h-[500px] object-cover"
               />
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (3 Cards) --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-[#0B3D2E]">How It Works</h3>
          <div className="w-16 h-1 bg-[#D4AF37] mt-2 rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-lg transition duration-300">
            <div className="bg-[#F0FDF4] p-4 rounded-full text-2xl text-[#0B3D2E]">📋</div>
            <div>
              <h4 className="font-bold text-xl text-[#0B3D2E] mb-2">1. Choose</h4>
              <p className="text-gray-500 leading-relaxed">Select your preferred service from our menu of premium haircuts.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-lg transition duration-300">
            <div className="bg-[#F0FDF4] p-4 rounded-full text-2xl text-[#0B3D2E]">📅</div>
            <div>
              <h4 className="font-bold text-xl text-[#0B3D2E] mb-2">2. Schedule</h4>
              <p className="text-gray-500 leading-relaxed">Pick a time that works for you. We come to your location.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-lg transition duration-300">
            <div className="bg-[#F0FDF4] p-4 rounded-full text-2xl text-[#0B3D2E]">🛋️</div>
            <div>
              <h4 className="font-bold text-xl text-[#0B3D2E] mb-2">3. Relax</h4>
              <p className="text-gray-500 leading-relaxed">Sit back and enjoy a premium haircut without leaving home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROS / SERVICES GRID --- */}
      <section id="services" className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[#0B3D2E]">Our Top-Rated Pros</h2>
              <p className="text-gray-500 mt-2">Expert stylists ready to serve you.</p>
            </div>
            <a href="#" className="text-[#0B3D2E] font-bold hover:text-[#D4AF37] transition">See all →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col h-full group">
                
                <div className="flex items-start gap-4 mb-6">
                  {/* Avatar Placeholder */}
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${service.id}&backgroundColor=b6e3f4`} 
                      alt="Pro" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#0B3D2E] group-hover:text-[#D4AF37] transition">{service.name}</h3>
                    <div className="flex items-center gap-1 text-[#D4AF37] text-sm font-medium">
                      <span>★ 4.9</span>
                      <span className="text-gray-400 font-normal">(120+ cuts)</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{service.duration_minutes} mins</p>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Total</p>
                    <p className="text-2xl font-bold text-[#0B3D2E]">₹{service.price}</p>
                  </div>
                  
                  <Link 
                    href={`/book?serviceId=${service.id}&name=${encodeURIComponent(service.name)}`}
                    className="bg-[#D4AF37] text-[#0B3D2E] px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#b8962e] transition shadow-sm"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA (App Download) --- */}
      <section className="max-w-7xl mx-auto px-6 pb-20 pt-10">
        <div className="bg-[#0B3D2E] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl">
          <div className="z-10 text-white max-w-lg relative">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for a fresh look?</h2>
             <p className="text-gray-300 mb-8 text-lg">Join 1,000+ happy clients. Real-time updates, secure payments, and premium service.</p>
             <div className="flex gap-4">
               <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 border border-gray-700 hover:bg-gray-900 transition">
                 <span className="text-2xl">🍎</span>
                 <div className="text-left leading-none">
                    <div className="text-[10px] uppercase">Download on the</div>
                    <div className="font-bold text-sm">App Store</div>
                 </div>
               </button>
               <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 border border-gray-700 hover:bg-gray-900 transition">
                 <span className="text-2xl">▶️</span>
                 <div className="text-left leading-none">
                    <div className="text-[10px] uppercase">Get it on</div>
                    <div className="font-bold text-sm">Google Play</div>
                 </div>
               </button>
             </div>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[#D4AF37]/10 skew-x-12 transform translate-x-20"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
        </div>
      </section>

    </main>
  )
}