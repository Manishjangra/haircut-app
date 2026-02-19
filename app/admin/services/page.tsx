'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

// Using your exact 'gender' options
const GENDERS = ['Men', 'Women', 'Kids', 'Group']

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  
  // Form State mapped to your DB
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [gender, setGender] = useState('Men') // Maps to DB 'gender'
  const [category, setCategory] = useState('') // Maps to DB 'category' (Hair, Beard, etc.)
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  
  // Image Upload State
  const [uploading, setUploading] = useState(false)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url') // Default to URL based on your data

  async function fetchServices() {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('id')
    setServices(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  // Handle direct file upload to Supabase Storage
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
      gender,           // Saves to your 'gender' column
      category,         // Saves to your 'category' column (e.g., Hair, Beard)
      price: Number(price), 
      duration_minutes: Number(duration), 
      image_url: imageUrl 
    }

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
    setGender(service.gender || 'Men')
    setCategory(service.category || '')
    setPrice(service.price)
    setDuration(service.duration_minutes)
    setImageUrl(service.image_url || '')
    
    // Switch to upload mode only if it's a supabase storage link
    if (service.image_url && service.image_url.includes('supabase')) {
      setImageMode('upload')
    } else {
      setImageMode('url')
    }
  }

  function resetForm() {
    setIsEditing(false)
    setEditId(null)
    setName('')
    setGender('Men')
    setCategory('')
    setPrice('')
    setDuration('')
    setImageUrl('')
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  // Filter logic uses your 'gender' column now
  const filteredServices = activeTab === 'All' 
    ? services 
    : services.filter(s => s.gender === activeTab)

  if (loading) return <div className="p-10 text-center text-[#0B3D2E] font-bold">Loading Services...</div>

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
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Classic Haircut" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E]"/>
              </div>

              {/* GENDER & CATEGORY (Subcategory) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Main Category (Gender)</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value)} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] font-medium text-[#0B3D2E]"
                  >
                    {GENDERS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Subcategory</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Hair, Beard, Color" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] text-sm"/>
                </div>
              </div>
              
              {/* PRICE & DURATION */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price (CAD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 font-bold text-gray-400">$</span>
                    <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E]"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Time (Min)</label>
                  <input required type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E]"/>
                </div>
              </div>

              {/* UPLOAD / URL TOGGLE SECTION */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Service Image</label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button type="button" onClick={() => setImageMode('upload')} className={`text-[10px] font-bold px-3 py-1 rounded-md transition ${imageMode === 'upload' ? 'bg-white text-[#0B3D2E] shadow-sm' : 'text-gray-500'}`}>File</button>
                    <button type="button" onClick={() => setImageMode('url')} className={`text-[10px] font-bold px-3 py-1 rounded-md transition ${imageMode === 'url' ? 'bg-white text-[#0B3D2E] shadow-sm' : 'text-gray-500'}`}>URL</button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#0B3D2E] file:text-white hover:file:bg-[#0B3D2E]/90 transition"/>
                ) : (
                  <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] text-sm"/>
                )}
                
                {uploading && <p className="text-sm text-[#D4AF37] font-bold mt-2">Uploading image...</p>}
                
                {imageUrl && !uploading && (
                  <div className="mt-3 h-32 rounded-lg overflow-hidden border border-gray-200 relative group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md">✕</button>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                {isEditing && <button type="button" onClick={resetForm} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancel</button>}
                <button type="submit" disabled={uploading} className="flex-1 py-3 font-bold text-[#0B3D2E] bg-[#D4AF37] rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50">
                  {isEditing ? 'Update' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: Services Grid */}
        <div className="lg:col-span-2">
          
          {/* GENDER TABS */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['All', ...GENDERS].map(tab => (
              <button 
                key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab ? 'bg-[#0B3D2E] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#0B3D2E]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {filteredServices.length === 0 ? (
              <div className="sm:col-span-2 text-center p-10 text-gray-400 font-medium bg-white rounded-2xl border border-gray-100">
                No services found for {activeTab}.
              </div>
            ) : (
              filteredServices.map(s => (
                <div key={s.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col">
                  <div className="h-48 bg-gray-100 relative">
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">✂️</div>
                    )}
                    
                    {/* Time & Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0B3D2E] shadow-sm">
                        {s.duration_minutes} Min
                      </div>
                      <div className="flex gap-1">
                        {/* Gender Badge */}
                        {s.gender && (
                          <div className="bg-[#0B3D2E]/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wider">
                            {s.gender}
                          </div>
                        )}
                        {/* Category (Subcategory) Badge */}
                        {s.category && (
                          <div className="bg-[#D4AF37]/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-[#0B3D2E] shadow-sm uppercase tracking-wider">
                            {s.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#0B3D2E] mb-1">{s.name}</h3>
                      <p className="text-2xl font-black text-[#D4AF37]">${s.price}</p>
                    </div>
                    <div className="mt-6 flex gap-3 border-t border-gray-50 pt-4">
                      <button onClick={() => handleEdit(s)} className="flex-1 py-2 text-sm font-bold text-[#0B3D2E] bg-[#E6F4EA] rounded-lg hover:bg-[#d0ebd6] transition">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="flex-1 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}