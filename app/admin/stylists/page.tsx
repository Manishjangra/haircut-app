'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function StylistsPage() {
  const [stylists, setStylists] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')

  useEffect(() => { fetchStylists() }, [])

  async function fetchStylists() {
    const { data } = await supabase.from('stylists').select('*').order('id')
    setStylists(data || [])
  }

  async function addStylist() {
    if (!newName) return alert("Name is required")
    await supabase.from('stylists').insert({
      name: newName,
      phone: newPhone,
      specialty: newSpecialty
    })
    setNewName(''); setNewPhone(''); setNewSpecialty('')
    fetchStylists()
  }

  async function deleteStylist(id: number) {
    if(!confirm("Remove this stylist?")) return
    await supabase.from('stylists').delete().eq('id', id)
    fetchStylists()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Stylists</h1>

      {/* Add Form */}
      <div className="bg-white p-6 rounded shadow mb-8 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-bold">Name</label>
          <input className="border p-2 rounded w-48" value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-bold">Phone</label>
          <input className="border p-2 rounded w-48" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="555-0000" />
        </div>
        <div>
          <label className="block text-sm font-bold">Specialty</label>
          <input className="border p-2 rounded w-48" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} placeholder="Hair & Beard" />
        </div>
        <button onClick={addStylist} className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">Add Stylist</button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stylists.map(s => (
          <div key={s.id} className="bg-white p-6 rounded shadow border-l-4 border-purple-500 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{s.name}</h3>
              <p className="text-gray-500">{s.specialty}</p>
              <p className="text-sm text-gray-400">{s.phone}</p>
            </div>
            <button onClick={() => deleteStylist(s.id)} className="text-red-500 text-sm hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}