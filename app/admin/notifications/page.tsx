'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all') // 'all', 'customers', 'providers'

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data && !error) setNotifications(data)
    setLoading(false)
  }

  async function sendNotification(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !message) return alert("Title and Message are required!")
    setSending(true)

    // Save to database (The Flutter app will listen for this)
    const { error } = await supabase.from('notifications').insert({
      title,
      message,
      target_audience: audience
    })

    setSending(false)

    if (error) {
      alert(`Error sending notification: ${error.message}`)
    } else {
      setTitle('')
      setMessage('')
      setAudience('all')
      alert('✅ Notification blasted successfully!')
      fetchNotifications()
    }
  }

  async function deleteNotification(id: string) {
    if(!confirm("Delete this notification history?")) return
    await supabase.from('notifications').delete().eq('id', id)
    fetchNotifications()
  }

  return (
    <div className="max-w-5xl space-y-8 relative">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0B3D2E]">Broadcast Notifications</h1>
        <p className="text-gray-500 mt-1">Send alerts, promos, and updates to your customers and fleet.</p>
      </div>

      {/* COMPOSER FORM */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#0B3D2E] mb-6 flex items-center gap-2">
          <span>📢</span> Compose Message
        </h2>
        
        <form onSubmit={sendNotification} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notification Title</label>
              <input 
                required value={title} onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Flash Sale! 20% Off Haircuts ✂️" 
                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-lg" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message Body</label>
              <textarea 
                required value={message} onChange={e => setMessage(e.target.value)} 
                placeholder="Type your message here..." rows={3}
                className="w-full border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none resize-none" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Audience</label>
              <div className="flex flex-wrap gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${audience === 'all' ? 'border-[#0B3D2E] bg-[#0B3D2E]/5 text-[#0B3D2E] font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <input type="radio" name="audience" value="all" checked={audience === 'all'} onChange={() => setAudience('all')} className="hidden" />
                  <span>🌍</span> Everyone
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${audience === 'customers' ? 'border-[#0B3D2E] bg-[#0B3D2E]/5 text-[#0B3D2E] font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <input type="radio" name="audience" value="customers" checked={audience === 'customers'} onChange={() => setAudience('customers')} className="hidden" />
                  <span>👥</span> Customers Only
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${audience === 'providers' ? 'border-[#0B3D2E] bg-[#0B3D2E]/5 text-[#0B3D2E] font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <input type="radio" name="audience" value="providers" checked={audience === 'providers'} onChange={() => setAudience('providers')} className="hidden" />
                  <span>🚐</span> Providers Only
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" disabled={sending}
              className="bg-[#D4AF37] text-[#0B3D2E] px-10 py-4 rounded-xl font-black shadow-md hover:bg-[#c29f31] hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? '⏳ Sending...' : '🚀 Blast Notification'}
            </button>
          </div>
        </form>
      </div>

      {/* NOTIFICATION HISTORY */}
      <div>
        <h2 className="text-lg font-bold text-gray-600 mb-4">Broadcast History</h2>
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-bold">Loading history...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-gray-100 text-gray-400">
            No notifications sent yet.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 relative group">
                
                <div className="text-3xl mt-1">
                  {n.target_audience === 'customers' ? '👥' : n.target_audience === 'providers' ? '🚐' : '🌍'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-[#0B3D2E] text-lg">{n.title}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
                      To: {n.target_audience}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-3 font-medium">
                    Sent: {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>

                <button 
                  onClick={() => deleteNotification(n.id)} 
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  title="Delete from history"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}