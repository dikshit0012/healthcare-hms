import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Users, Search, Plus, Shield, UserCheck } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'NURSE', employeeId: '', departmentId: '', branchId: '', specialization: '', consultationFee: 0 })

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await api.get('/users', { params: { search } })
    setUsers(data.data || [])
  }

  const createStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/admin/staff', form)
    setShowModal(false)
    fetchUsers()
  }

  const roleColors: any = {
    PATIENT: 'bg-blue-100 text-blue-700',
    DOCTOR: 'bg-green-100 text-green-700',
    NURSE: 'bg-purple-100 text-purple-700',
    RECEPTIONIST: 'bg-amber-100 text-amber-700',
    LAB_TECHNICIAN: 'bg-pink-100 text-pink-700',
    PHARMACIST: 'bg-indigo-100 text-indigo-700',
    BILLING_STAFF: 'bg-gray-100 text-gray-700',
    ADMIN: 'bg-red-100 text-red-700',
    SUPER_ADMIN: 'bg-red-200 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{u.patient?.fullName || u.doctor?.fullName || u.staff?.fullName || u.email}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{u.email}</td>
                <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-gray-100'}`}>{u.role}</span></td>
                <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{u.status}</span></td>
                <td className="py-3 px-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-400 py-8">No users found</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Staff</h3>
            <form onSubmit={createStaff} className="space-y-4">
              <input placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="input" required />
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" required />
              <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input" />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input">
                <option value="NURSE">Nurse</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="LAB_TECHNICIAN">Lab Technician</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="BILLING_STAFF">Billing Staff</option>
                <option value="DOCTOR">Doctor</option>
              </select>
              {form.role === 'DOCTOR' && (
                <>
                  <input placeholder="Specialization" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="input" />
                  <input placeholder="Consultation Fee" type="number" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: parseInt(e.target.value)})} className="input" />
                </>
              )}
              <input placeholder="Employee ID" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} className="input" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
