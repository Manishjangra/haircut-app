'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

const GENDERS = ['Men', 'Women', 'Kids', 'Group']

export default function AdminServicesPage() {
  // Main View State
  const [viewMode, setViewMode] = useState<'services' | 'packages'>('services')
  
  // Data State
  const [services, setServices] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerType, setDrawerType] = useState<'service' | 'package'>('service')
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  // Form State (Shared & Service)
  const [name, setName] = useState('')
  const [gender, setGender] = useState('Men')
  const [category, setCategory] = useState('') 
  const [price, setPrice] = useState<string | number>('') 
  const [duration, setDuration] = useState<string | number>('') 
  const [imageUrl, setImageUrl] = useState('')
  
  // Form State (Package Specific)
  const [rating, setRating] = useState<string | number>('5.0')
  const [selectedServices, setSelectedServices] = useState<any[]>([]) // Array of selected service objects
  
  // Image Upload State
  const [uploading, setUploading] = useState(false)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url')

  async function fetchData() {
    setLoading(true)
    const [servicesRes, packagesRes] = await Promise.all([
      supabase.from('services').select('*').order('id'),
      supabase.from('packages').select('*').order('id')
    ])
    setServices(servicesRes.data || [])
    setPackages(packagesRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

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

    try {
      if (drawerType === 'service') {
        const serviceData = { 
          name, 
          gender, 
          category, 
          price: Number(price), 
          duration_minutes: Number(duration), 
          image_url: imageUrl 
        }
        
        let error;
        if (isEditing && editId) {
          const res = await supabase.from('services').update(serviceData).eq('id', editId)
          error = res.error;
        } else {
          const res = await supabase.from('services').insert([serviceData])
          error = res.error;
        }

        // 👇 THIS IS THE CRUCIAL PART: Don't close the drawer if there's an error!
        if (error) {
          alert("❌ Supabase Error (Service): " + error.message);
          console.error("Full Service Error:", error);
          return; 
        }

      } else {
        // 📦 PACKAGE SUBMISSION
        const packageData = {
          name, 
          gender, 
          price: Number(price),
          rating: Number(rating),
          image_url: imageUrl,
          services: selectedServices.map(s => ({
            name: s.name,
            price: s.price,
            selected: true
          }))
        }
        
        let error;
        if (isEditing && editId) {
          const res = await supabase.from('packages').update(packageData).eq('id', editId)
          error = res.error;
        } else {
          const res = await supabase.from('packages').insert([packageData])
          error = res.error;
        }

        // 👇 Catch package errors too!
        if (error) {
          alert("❌ Supabase Error (Package): " + error.message);
          console.error("Full Package Error:", error);
          return; 
        }
      }
      
      // Only close and refresh if it actually succeeded!
      closeDrawer()
      fetchData()
      
    } catch (err: any) {
      alert("❌ Unexpected Error: " + err.message);
      console.error(err);
    }
  }

  async function handleDelete(id: number, type: 'service' | 'package') {
    if (confirm(`Are you sure you want to permanently delete this ${type}?`)) {
      const table = type === 'service' ? 'services' : 'packages'
      await supabase.from(table).delete().eq('id', id)
      fetchData()
    }
  }

  function toggleServiceInPackage(service: any) {
    setSelectedServices(prev => {
      // 1. Add or remove the service from the checklist
      const exists = prev.find(s => s.id === service.id)
      const newSelected = exists 
        ? prev.filter(s => s.id !== service.id) 
        : [...prev, service]
      
      // 2. 🪄 MAGIC: Automatically calculate the total price of all selected services!
      const autoCalculatedPrice = newSelected.reduce((total, currentService) => {
        return total + (Number(currentService.price) || 0);
      }, 0);

      // 3. Update the price box in the UI
      setPrice(autoCalculatedPrice);

      return newSelected;
    })
  }

  function openAddDrawer(type: 'service' | 'package') {
    resetForm()
    setDrawerType(type)
    setIsEditing(false)
    setIsDrawerOpen(true)
  }

  function openEditDrawer(item: any, type: 'service' | 'package') {
    resetForm()
    setDrawerType(type)
    setIsEditing(true)
    setEditId(item.id)
    setName(item.name)
    setGender(item.gender || 'Men')
    setPrice(item.price)
    setImageUrl(item.image_url || '')
    setImageMode(item.image_url?.includes('supabase') ? 'upload' : 'url')
    
    if (type === 'service') {
      setCategory(item.category || '')
      setDuration(item.duration_minutes)
    } else {
      setRating(item.rating || '5.0')
      // Map JSONB back to full service objects for the checklist
      const mappedServices = (item.services || []).map((jsonService: any) => {
        return services.find(s => s.name === jsonService.name) || jsonService
      }).filter(Boolean)
      setSelectedServices(mappedServices)
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
    setRating('5.0')
    setImageUrl('')
    setSelectedServices([])
  }

  // --- Filtering Logic ---
  const filteredItems = (viewMode === 'services' ? services : packages).filter(item => {
    const matchesTab = activeTab === 'All' || item.gender === activeTab;
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.name || '').toLowerCase().includes(searchString) ||
      (item.category || '').toLowerCase().includes(searchString);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B3D2E]">Manage Catalog</h1>
          <p className="text-gray-500 mt-1">Organize your individual services and bundled packages.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full md:w-64">
            <span className="absolute left-4 top-2.5 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder={`Search ${viewMode}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm transition text-sm"
            />
          </div>
          {/* 👇 FIX #1: Auto-convert viewMode string to singular */}
          <button 
            onClick={() => openAddDrawer(viewMode === 'services' ? 'service' : 'package')}
            className="px-6 py-2.5 bg-[#0B3D2E] text-[#D4AF37] font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm"
          >
            <span>✨</span> Add {viewMode === 'services' ? 'Service' : 'Package'}
          </button>
        </div>
      </div>

      {/* Main View Mode Toggle & Gender Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Toggle Services vs Packages */}
        <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-inner">
          <button 
            onClick={() => setViewMode('services')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'services' ? 'bg-white text-[#0B3D2E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ✂️ Single Services
          </button>
          <button 
            onClick={() => setViewMode('packages')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'packages' ? 'bg-white text-[#0B3D2E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            📦 Bundled Packages
          </button>
        </div>

        {/* Gender Tabs */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-1">
          {['All', ...GENDERS].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === tab ? 'bg-[#0B3D2E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-10 text-center text-[#0B3D2E] font-bold">Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center p-12 text-gray-400 font-medium bg-white rounded-3xl border border-gray-100">
              No {viewMode} found. Try adjusting your search or add a new one!
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col">
                <div className="h-48 bg-gray-100 relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-[#F8F9FA]">{viewMode === 'services' ? '✂️' : '📦'}</div>
                  )}
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    {viewMode === 'services' ? (
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0B3D2E] shadow-sm">
                        {item.duration_minutes} Min
                      </div>
                    ) : (
                      <div className="bg-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1">
                        ⭐ {item.rating}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between bg-white relative z-10">
                  <div>
                    <div className="flex gap-2 mb-2">
                       {item.gender && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.gender}</span>}
                       {viewMode === 'services' && item.category && <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">• {item.category}</span>}
                    </div>
                    <h3 className="text-xl font-bold text-[#0B3D2E] mb-1">{item.name}</h3>
                    <p className="text-2xl font-black text-[#D4AF37]">${item.price}</p>
                    
                    {/* Packages extra info */}
                    {viewMode === 'packages' && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Included Services:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {(item.services || []).map((s: any, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-[#D4AF37]">✓</span> {s.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* EDIT AND DELETE BUTTONS */}
                  <div className="mt-6 flex gap-3 border-t border-gray-50 pt-4">
                    {/* 👇 FIX #2: Auto-convert for Edit */}
                    <button onClick={() => openEditDrawer(item, viewMode === 'services' ? 'service' : 'package')} className="flex-1 py-2 text-sm font-bold text-[#0B3D2E] bg-[#E6F4EA] rounded-xl hover:bg-[#d0ebd6] transition shadow-sm">
                      ✏️ Edit
                    </button>
                    {/* 👇 FIX #3: Auto-convert for Delete */}
                    <button onClick={() => handleDelete(item.id, viewMode === 'services' ? 'service' : 'package')} className="flex-1 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition shadow-sm">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- SLIDE-OUT DRAWER --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end text-left">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDrawer}></div>
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 bg-[#0B3D2E] text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{isEditing ? `✏️ Edit ${drawerType === 'service' ? 'Service' : 'Package'}` : `✨ Add ${drawerType === 'service' ? 'Service' : 'Package'}`}</h2>
              <button onClick={closeDrawer} className="text-white hover:text-[#D4AF37] text-3xl leading-none">&times;</button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <form id="drawer-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* COMMON FIELDS */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{drawerType === 'service' ? 'Service' : 'Package'} Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder={`e.g. ${drawerType === 'service' ? 'Classic Haircut' : 'The Gentleman Cut'}`} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Target Group</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition font-bold text-[#0B3D2E]">
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  
                  {drawerType === 'service' ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Subcategory</label>
                      <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Hair, Beard" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition text-sm"/>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Rating</label>
                      <input type="number" step="0.1" max="5.0" value={rating} onChange={e => setRating(e.target.value)} placeholder="5.0" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition font-bold text-sm"/>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{drawerType === 'package' ? 'Bundle Price ($)' : 'Price ($)'}</label>
                    <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition font-bold text-lg text-[#0B3D2E]"/>
                  </div>
                  {drawerType === 'service' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Time (Mins)</label>
                      <input required type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0B3D2E] focus:bg-white transition font-bold text-lg"/>
                    </div>
                  )}
                </div>

                {/* PACKAGE ONLY: SERVICE BUILDER */}
                {drawerType === 'package' && (
                  <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-200 shadow-inner">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Included Services in Bundle</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {services.map(s => {
                        const isSelected = selectedServices.some(selected => selected.id === s.id)
                        return (
                          <div 
                            key={s.id} 
                            onClick={() => toggleServiceInPackage(s)}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${isSelected ? 'bg-white border-[#D4AF37] ring-1 ring-[#D4AF37]' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'bg-gray-50 border-gray-300'}`}>
                                {isSelected && '✓'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{s.name}</p>
                                <p className="text-xs text-gray-400">${s.price}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* COMMON: IMAGE UPLOAD */}
                <div className="bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Image</label>
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
              <button form="drawer-form" type="submit" disabled={uploading} className="flex-1 py-3 font-bold text-[#0B3D2E] bg-[#D4AF37] rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-50">
                {isEditing ? '💾 Save Changes' : '✨ Create'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}