'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    async function fetchUsers() {
      // Fetching from the 'profiles' table we created earlier
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setUsers(data || [])
    }
    fetchUsers()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customer Database</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{u.full_name || 'No Name'}</td>
                <td className="p-4">{u.phone_number || '-'}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs uppercase">{u.role}</span>
                </td>
                <td className="p-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}