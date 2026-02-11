import Link from 'next/link'
import './globals.css'

export const metadata = { title: 'Haircut at Home', description: 'Luxury Grooming Delivered' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#F8F9FA] text-[#1A1A1A] font-sans antialiased">
        
        {/* HEADER / NAVBAR */}
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
              {/* This link scrolls to the Services section on the homepage */}
              <Link href="/#services" className="hover:text-[#D4AF37] transition duration-300">
                Our Services
              </Link>
              
              <Link href="/my-bookings" className="hover:text-[#D4AF37] transition duration-300">
                My Bookings
              </Link>
              
              <Link href="/about" className="hover:text-[#D4AF37] transition duration-300">
                Contact Support
              </Link>
            </div>

            {/* Right Side (Login Button) */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="flex items-center gap-3 hover:bg-white/5 pl-2 pr-4 py-1.5 rounded-full transition border border-transparent hover:border-white/10">
                <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0B3D2E] font-bold shadow-sm">
                  👤
                </div>
                <span className="hidden md:inline font-medium text-sm">Login</span>
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  )
}