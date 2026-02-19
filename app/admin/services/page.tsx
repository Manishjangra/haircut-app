'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  async function fetchServices() {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('id')
    setServices(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const serviceData = { name, price: Number(price), duration_minutes: Number(duration), image_url: imageUrl }

    if (isEditing && editId) {
      await supabase.from('services').update(serviceData).eq('id', editId)
    } else {
      await supabase.from('services').insert([serviceData])
    }
    
    resetForm()
    fetchServices()
  }

  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this service?')) {
      await supabase.from('services').delete().eq('id', id)
      fetchServices()
    }
  }

  function handleEdit(service: any) {
    setIsEditing(true)
    setEditId(service.id)
    setName(service.name)
    setPrice(service.price)
    setDuration(service.duration_minutes)
    setImageUrl(service.image_url || '')
  }

  function resetForm() {
    setIsEditing(false)
    setEditId(null)
    setName('')
    setPrice('')
    setDuration('')
    setImageUrl('')
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Services...</div>

  return (
    <div className="p-6 md:p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-[#0B3D2E]">Manage Services</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* LEFT: Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-10">
            <h2 className="text-xl font-bold text-[#0B3D2E] mb-6">
              {isEditing ? '✏️ Edit Service' : '✨ Add New Service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Service Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E]"/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price (₹)</label>
                  <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E]"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Duration (Min)</label>
                  <input required type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E]"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Image URL</label>
                <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] text-sm"/>
                {imageUrl && (
                  <div className="mt-3 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+Image'} />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                {isEditing && (
                  <button type="button" onClick={resetForm} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                )}
                <button type="submit" className="flex-1 py-3 font-bold text-[#0B3D2E] bg-[#D4AF37] rounded-xl shadow-md hover:shadow-lg transition">
                  {isEditing ? 'Update' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Services Grid */}
        <div className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-6">
            {services.map(s => (
              <div key={s.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col">
                
                {/* Image Area */}
                <div className="h-48 bg-gray-100 relative">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">✂️</div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0B3D2E] shadow-sm">
                    {s.duration_minutes} Min
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#0B3D2E] mb-2">{s.name}</h3>
                    <p className="text-2xl font-black text-[#D4AF37]">₹{s.price}</p>
                  </div>
                  
                  <div className="mt-6 flex gap-3 border-t border-gray-50 pt-4">
                    <button onClick={() => handleEdit(s)} className="flex-1 py-2 text-sm font-bold text-[#0B3D2E] bg-[#E6F4EA] rounded-lg hover:bg-[#d0ebd6] transition">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="flex-1 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}