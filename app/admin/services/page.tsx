'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient' // Adjust path if needed (../../supabaseClient)

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDuration, setNewDuration] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    const { data } = await supabase.from('services').select('*').order('id')
    setServices(data || [])
  }

  async function addService() {
    if (!newName || !newPrice) return alert("Fill in all fields")
    
    const { error } = await supabase.from('services').insert({
      name: newName,
      price: parseInt(newPrice),
      duration_minutes: parseInt(newDuration),
    })

    if (error) alert(error.message)
    else {
      setNewName(''); setNewPrice(''); setNewDuration('')
      fetchServices() // Refresh list
    }
  }

  async function deleteService(id: number) {
    if(!confirm("Are you sure?")) return
    await supabase.from('services').delete().eq('id', id)
    fetchServices()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Services</h1>

      {/* Add New Service Form */}
      <div className="bg-white p-6 rounded shadow mb-8 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-bold">Service Name</label>
          <input className="border p-2 rounded w-48" placeholder="e.g. Fade Cut" 
            value={newName} onChange={e => setNewName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold">Price (₹)</label>
          <input className="border p-2 rounded w-24" type="number" placeholder="250" 
            value={newPrice} onChange={e => setNewPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold">Duration (min)</label>
          <input className="border p-2 rounded w-24" type="number" placeholder="30" 
            value={newDuration} onChange={e => setNewDuration(e.target.value)} />
        </div>
        <button onClick={addService} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          + Add
        </button>
      </div>

      {/* List of Services */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-4">{s.name}</td>
                <td className="p-4">₹{s.price}</td>
                <td className="p-4">{s.duration_minutes}m</td>
                <td className="p-4">
                  <button onClick={() => deleteService(s.id)} className="text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}