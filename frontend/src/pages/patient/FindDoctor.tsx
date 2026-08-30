import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { Search, User, Star, Clock, Calendar, Loader2, CheckCircle, MapPin } from 'lucide-react'

export default function FindDoctor() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [slots, setSlots] = useState<any[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(res.data?.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false))
  }, [])

  const fetchSlots = async (doctorId: string, date: string) => {
    setSlotsLoading(true)
    setSelectedSlot(null)
    try {
      const { data } = await api.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`)
      setSlots(data || [])
    } catch { setSlots([]) }
    finally { setSlotsLoading(false) }
  }

  const openBooking = (doc: any) => {
    setSelected(doc)
    setBooked(false)
    setSelectedSlot(null)
    fetchSlots(doc.id, selectedDate)
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    if (selected) fetchSlots(selected.id, date)
  }

  const handleBook = async () => {
    if (!selected || !selectedSlot) return
    setBooking(true)
    try {
      await api.post('/appointments', {
        doctorId: selected.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: 'IN_PERSON',
      })
      setBooked(true)
    } catch {} finally { setBooking(false) }
  }

  const filtered = doctors.filter(d =>
    d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Find a Specialist</h2>
        <p className="text-gray-500 text-sm mt-1">Browse our qualified practitioners and book consultations</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or specialization…"
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col hover:shadow-md hover:shadow-gray-100/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600 flex items-center justify-center font-bold text-lg shrink-0">
                  {doc.fullName?.[0] || <User size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">{doc.fullName}</h3>
                  <p className="text-xs text-sky-600 font-semibold mt-0.5">{doc.specialization}</p>
                  <Badge status={doc.verificationStatus || 'VERIFIED'} className="mt-1.5" />
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4 line-clamp-2 flex-1">
                {doc.professionalBio || 'Experienced medical professional dedicated to patient care.'}
              </p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Star size={13} className="text-amber-400" /> {doc.experience || 5}+ yrs</span>
                <span className="font-semibold text-gray-700">₹{doc.consultationFee || 500}</span>
              </div>

              <button
                onClick={() => openBooking(doc)}
                className="mt-4 w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-sky-700 hover:to-blue-700 transition-all shadow-sm"
              >
                Book Consultation
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Search size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">No doctors found matching your search</p>
            </div>
          )}
        </div>
      )}

      {/* Booking modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={booked ? 'Appointment Booked' : `Book with Dr. ${selected?.fullName}`} size="md">
        {booked ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Appointment Confirmed</h3>
            <p className="text-gray-500 mt-2">Your appointment with Dr. {selected?.fullName} on {selectedDate} at {selectedSlot?.startTime} has been booked.</p>
            <button onClick={() => setSelected(null)} className="mt-6 px-8 py-2.5 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Available Slots</label>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-sky-600" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No slots available for this date</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot: any) => (
                    <button
                      key={slot.startTime}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        selectedSlot?.startTime === slot.startTime
                          ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-sky-300 hover:bg-sky-50'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleBook}
              disabled={!selectedSlot || booking}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-semibold text-sm hover:from-sky-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              {booking ? <><Loader2 size={16} className="animate-spin" /> Booking…</> : 'Confirm Appointment'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
