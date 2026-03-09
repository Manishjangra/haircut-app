'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

const GENDERS = ['Men', 'Women', 'Kids', 'Group']

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Drawer & Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [name, setName] = useState('')
  const [gender, setGender] = useState('Men')
  const [category, setCategory] = useState('') 
  const [price, setPrice] = useState<string | number>('') // Changed to handle both
  const [duration, setDuration] = useState<string | number>('') // Changed to handle both
  const [imageUrl, setImageUrl] = useState('')
  
  // Image Upload State
  const [uploading, setUploading] = useState(false)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url')

  async function fetchServices() {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('id')
    setServices(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('service-images').upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('service-images').getPublicUrl(fileName)
      setImageUrl(data.publicUrl)
    } catch (error: any) {
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (uploading) return alert('Please wait for the image to finish uploading.')

    const serviceData = { 
      name, 
      gender,           
      category,         
      price: Number(price), 
      duration_minutes: Number(duration), 
      image_url: imageUrl 
    }

    if (isEditing && editId) {
      // 🛠️ UPDATE EXISTING SERVICE
      const { error } = await supabase.from('services').update(serviceData).eq('id', editId)
      if (error) alert("Error updating service: " + error.message)
      else alert("✅ Service updated successfully!")
    } else {
      // ✨ INSERT NEW SERVICE
      const { error } = await supabase.from('services').insert([serviceData])
      if (error) alert("Error adding service: " + error.message)
    }
    
    closeDrawer()
    fetchServices() // Refresh the list!
  }

  async function handleDelete(id: number) {
    if (confirm('Are you sure you want to permanently delete this service?')) {
      await supabase.from('services').delete().eq('id', id)
      fetchServices()
    }
  }

  function openAddDrawer() {
    resetForm()
    setIsEditing(false)
    setIsDrawerOpen(true)
  }

  function openEditDrawer(service: any) {
    setIsEditing(true)
    setEditId(service.id)
    setName(service.name)
    setGender(service.gender || 'Men')
    setCategory(service.category || '')
    setPrice(service.price) // Load exact price
    setDuration(service.duration_minutes) // Load exact duration
    setImageUrl(service.image_url || '')
    
    if (service.image_url && service.image_url.includes('supabase')) {
      setImageMode('upload')
    } else {
      setImageMode('url')
    }
    
    setIsDrawerOpen(true)
  }

  function closeDrawer() {
    setIsDrawerOpen(false)
    setTimeout(() => resetForm(), 300)
  }

  function resetForm() {
    setEditId(null)
    setIsEditing(false)
    setName('')
    setGender('Men')
    setCategory('')
    setPrice('')
    setDuration('')
    setImageUrl('')
  }

  // --- Filtering Logic ---
  const filteredServices = services.filter(s => {
    const matchesTab = activeTab === 'All' || s.gender === activeTab;
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = 
      (s.name || '').toLowerCase().includes(searchString) ||
      (s.category || '').toLowerCase().includes(searchString);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Manage Services</h1>
          <p className="text-gray-500 mt-1">Add, edit, and organize your salon menu.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full md:w-64">
            <span className="absolute left-4 top-2.5 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search services..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm transition text-sm"
            />
          </div>
          <button 
            onClick={openAddDrawer}
            className="px-6 py-2.5 bg-[#0B3D2E] text-[#D4AF37] font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm"
          >
            <span>✨</span> Add Service
          </button>
        </div>
      </div>

      {/* Gender Tabs */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-1">
        {['All', ...GENDERS].map(tab => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              activeTab === tab ? 'bg-[#0B3D2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {services.filter(s => s.gender === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-10 text-center text-[#0B3D2E] font-bold">Loading Services...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.length === 0 ? (
            <div className="col-span-full text-center p-12 text-gray-400 font-medium bg-white rounded-3xl border border-gray-100">
              No services found. Try adjusting your search or add a new one!
            </div>
          ) : (
            filteredServices.map(s => (
              <div key={s.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col">
                <div className="h-48 bg-gray-100 relative">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-[#F8F9FA]">✂️</div>
                  )}
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0B3D2E] shadow-sm">
                      {s.duration_minutes} Min
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between bg-white relative z-10">
                  <div>
                    <div className="flex gap-2 mb-2">
                       {s.gender && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.gender}</span>}
                       {s.category && <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">• {s.category}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-[#0B3D2E] mb-1">{s.name}</h3>
                    <p className="text-2xl font-black text-[#D4AF37]">${s.price}</p>
                  </div>
                  
                  {/* EDIT AND DELETE BUTTONS */}
                  <div className="mt-6 flex gap-3 border-t border-gray-50 pt-4">
                    <button onClick={() => openEditDrawer(s)} className="flex-1 py-2 text-sm font-bold text-[#0B3D2E] bg-[#E6F4EA] rounded-xl hover:bg-[#d0ebd6] transition shadow-sm">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="flex-1 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition shadow-sm">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- SLIDE-OUT DRAWER FOR ADD/EDIT --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDrawer}></div>
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 bg-[#0B3D2E] text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{isEditing ? '✏️ Edit Service' : '✨ Add New Service'}</h2>
              <button onClick={closeDrawer} className="text-white hover:text-[#D4AF37] text-3xl leading-none">&times;</button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Service Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Classic Haircut" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Target Group</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition font-bold text-[#0B3D2E]">
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Subcategory</label>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Hair, Beard" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition text-sm"/>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price ($)</label>
                    <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition font-bold"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Time (Mins)</label>
                    <input required type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition font-bold"/>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Service Image</label>
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                      <button type="button" onClick={() => setImageMode('upload')} className={`text-[10px] font-bold px-3 py-1 rounded-md transition ${imageMode === 'upload' ? 'bg-[#0B3D2E] text-white' : 'text-gray-500'}`}>File</button>
                      <button type="button" onClick={() => setImageMode('url')} className={`text-[10px] font-bold px-3 py-1 rounded-md transition ${imageMode === 'url' ? 'bg-[#0B3D2E] text-white' : 'text-gray-500'}`}>URL</button>
                    </div>
                  </div>

                  {imageMode === 'upload' ? (
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#0B3D2E] file:text-white hover:file:bg-[#0B3D2E]/90 transition"/>
                  ) : (
                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] text-sm"/>
                  )}
                  
                  {uploading && <p className="text-sm text-[#D4AF37] font-bold mt-3 animate-pulse">Uploading image...</p>}
                  
                  {imageUrl && !uploading && (
                    <div className="mt-4 h-40 rounded-xl overflow-hidden border border-gray-200 relative group">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md">✕</button>
                    </div>
                  )}
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button type="button" onClick={closeDrawer} className="flex-1 py-3 font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition">Cancel</button>
              <button form="service-form" type="submit" disabled={uploading} className="flex-1 py-3 font-bold text-[#0B3D2E] bg-[#D4AF37] rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50">
                {isEditing ? '💾 Save Changes' : '✨ Create Service'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}