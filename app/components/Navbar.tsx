'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  // HIDE NAVBAR ON ALL ADMIN PAGES
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <nav className="bg-[#0B3D2E] text-white py-4 px-6 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition backdrop-blur-sm">
             <span className="text-2xl">✂️</span> 
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl leading-none tracking-tight">Haircut</span>
            <span className="text-[10px] text-[#D4AF37] font-bold tracking-[0.2em] uppercase mt-0.5">at Home</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-200 items-center">
          <Link href="/#services" className="hover:text-[#D4AF37] transition duration-300">Our Services</Link>
          <Link href="/my-bookings" className="hover:text-[#D4AF37] transition duration-300">My Bookings</Link>
        </div>

        {/* Login Button */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex items-center gap-3 hover:bg-white/5 pl-2 pr-4 py-1.5 rounded-full transition border border-transparent hover:border-white/10">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0B3D2E] font-bold shadow-sm">👤</div>
            <span className="hidden md:inline font-medium text-sm">Login</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}