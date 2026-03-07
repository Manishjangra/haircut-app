import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex shrink-0 fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50">
          <span className="text-3xl text-[#0B3D2E]"></span>
          <h1 className="text-xl font-black text-[#0B3D2E] tracking-tight">Admin<span className="text-[#D4AF37]">Panel</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>👥</span> Users
          </Link>
          <Link href="/admin/stylists" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>🚐</span> Fleet & Stylists
          </Link>
          <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>✂️</span> Services
          </Link>
          <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>📅</span> Bookings
          </Link>
          
          {/* NEW SETTINGS BUTTON */}
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>⚙️</span> Settings
          </Link>

          <Link href="/admin/vouchers" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#0B3D2E] hover:text-[#D4AF37] transition">
            <span>🎟️</span> Vouchers
          </Link>

        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  )
}