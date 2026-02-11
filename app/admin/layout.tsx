import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-blue-400">Admin Panel</h2>
          <p className="text-xs text-gray-400 mt-1">Haircut App Manager</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard */}
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <span>📊</span>
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Bookings */}
          <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <span>📅</span>
            <span className="font-medium">Bookings</span>
          </Link>

          {/* Services */}
          <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <span>✂️</span>
            <span className="font-medium">Services & Prices</span>
          </Link>

          {/* Stylists (NEW) */}
          <Link href="/admin/stylists" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <span>💈</span>
            <span className="font-medium">Stylists</span>
          </Link>

          {/* Users (NEW) */}
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <span>👥</span>
            <span className="font-medium">User List</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link href="/" className="block text-center text-sm text-gray-400 hover:text-white">
            ← Back to Main Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}