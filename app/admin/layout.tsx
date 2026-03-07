'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Helper to automatically close sidebar when a link is tapped on mobile
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 border-b border-gray-100 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💈</span>
          <h1 className="text-lg font-black text-[#0B3D2E] tracking-tight">Admin<span className="text-[#D4AF37]">Panel</span></h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-[#0B3D2E] p-2 focus:outline-none bg-gray-50 rounded-lg border border-gray-200"
        >
          {/* Hamburger Icon / Close Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* --- MOBILE OVERLAY BACKDROP --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col 
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        md:translate-x-0 md:static md:shrink-0 md:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-gray-50">
          <span className="text-3xl text-[#0B3D2E]">💈</span>
          <h1 className="text-xl font-black text-[#0B3D2E] tracking-tight">Admin<span className="text-[#D4AF37]">Panel</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/admin/users" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>👥</span> Users
          </Link>
          <Link href="/admin/stylists" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>🚐</span> Fleet & Stylists
          </Link>
          <Link href="/admin/services" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>✂️</span> Services
          </Link>
          <Link href="/admin/bookings" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>📅</span> Bookings
          </Link>
          <Link href="/admin/vouchers" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>🎟️</span> Vouchers
          </Link>
          <Link href="/admin/settings" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>⚙️</span> Settings
          </Link>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full md:h-screen w-full relative">
        {children}
      </main>
    </div>
  )
}