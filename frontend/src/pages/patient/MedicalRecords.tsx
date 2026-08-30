import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { FileText, Calendar, Activity } from 'lucide-react'

export default function MedicalRecords() {
  const [encounters, setEncounters] = useState<any[]>([])

  useEffect(() => {
    api.get('/encounters')
      .then(res => setEncounters(res.data?.data || []))
      .catch(() => setEncounters([]))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Medical History & Records</h2>
        <p className="text-gray-500 text-sm">Access your clinical encounters, diagnosis notes, and test summaries</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {encounters.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="mx-auto mb-3 text-gray-300" size={40} />
            <p>No past medical encounters recorded yet</p>
          </div>
        ) : (
          encounters.map((enc) => (
            <div key={enc.id} className="p-5 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">{enc.chiefComplaint || 'Consultation Encounter'}</h4>
                <p className="text-xs text-gray-400 mt-1">Dr. {enc.doctor?.fullName || 'Physician'} • {new Date(enc.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                {enc.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
