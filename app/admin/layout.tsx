'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
      setLoading(false)
    }
    checkAuth()
  }, [pathname, router])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#0B3D2E]"></div>
      </div>
    )
  }

  if (pathname === '/admin/login') return <>{children}</>

  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/admin' },
    { name: 'Bookings', icon: '📅', path: '/admin/bookings' },
    { name: 'Services', icon: '✂️', path: '/admin/services' },
    { name: 'Stylists', icon: '💈', path: '/admin/stylists' },
    { name: 'Users', icon: '👥', path: '/admin/users' },
  ]

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B3D2E] text-white flex flex-col shadow-2xl z-20 flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold tracking-wide flex items-center gap-2">
            <span>🛡️</span>
            <span>Haircut<span className="text-[#D4AF37]">Admin</span></span>
          </h2>
          <p className="text-xs text-gray-400 mt-2 tracking-wider uppercase">Manager Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive ? 'bg-[#D4AF37] text-[#0B3D2E] font-bold shadow-md' : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" className="flex items-center justify-center gap-2 w-full p-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition">
            <span>🏠</span> Back to Main Site
          </Link>
          <button 
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/admin/login')
            }} 
            className="flex items-center justify-center gap-2 w-full p-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}