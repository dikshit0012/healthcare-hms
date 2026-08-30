import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import DataTable, { Column } from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { Calendar, X } from 'lucide-react'

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('')
  const limit = 10

  const fetchData = (p: number, status?: string) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: String(limit) })
    if (status) params.set('status', status)
    api.get(`/appointments?${params}`)
      .then(res => {
        setAppointments(res.data?.data || [])
        setTotal(res.data?.total || 0)
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData(page, filter) }, [page, filter])

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return
    await api.patch(`/appointments/${id}/cancel`)
    fetchData(page, filter)
  }

  const columns: Column<any>[] = [
    {
      key: 'doctor',
      label: 'Doctor',
      render: (apt) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm shrink-0">
            {apt.doctor?.fullName?.[0] || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{apt.doctor?.fullName}</p>
            <p className="text-xs text-gray-400">{apt.doctor?.specialization}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (apt) => (
        <div>
          <p className="text-sm text-gray-800">{new Date(apt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p className="text-xs text-gray-400">{apt.startTime} — {apt.endTime}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (apt) => <span className="text-sm text-gray-600 capitalize">{apt.type?.replace('_', ' ').toLowerCase()}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (apt) => <Badge status={apt.status} />,
    },
    {
      key: 'actions',
      label: '',
      className: 'w-12',
      render: (apt) => (
        !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(apt.status) ? (
          <button onClick={() => handleCancel(apt.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
            <X size={16} />
          </button>
        ) : null
      ),
    },
  ]

  const filters = ['', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'CHECKED_IN']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
        <p className="text-gray-500 text-sm mt-1">View and manage all your doctor appointments</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300 hover:text-sky-600'
            }`}
          >
            {f ? f.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={appointments}
        loading={loading}
        emptyTitle="No appointments"
        emptyMessage="You don't have any appointments yet. Find a doctor to get started."
        page={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={setPage}
      />
    </div>
  )
}
