const variants: Record<string, string> = {
  // Appointment / encounter statuses
  CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  COMPLETED: 'bg-sky-50 text-sky-700 ring-sky-200',
  CANCELLED: 'bg-gray-100 text-gray-500 ring-gray-200',
  CHECKED_IN: 'bg-blue-50 text-blue-700 ring-blue-200',
  WAITING: 'bg-amber-50 text-amber-700 ring-amber-200',
  IN_CONSULTATION: 'bg-violet-50 text-violet-700 ring-violet-200',
  REQUESTED: 'bg-orange-50 text-orange-700 ring-orange-200',
  NO_SHOW: 'bg-red-50 text-red-700 ring-red-200',
  RESCHEDULED: 'bg-cyan-50 text-cyan-700 ring-cyan-200',

  // Encounter workflow
  NURSE_ASSESSMENT: 'bg-pink-50 text-pink-700 ring-pink-200',
  READY_FOR_DOCTOR: 'bg-teal-50 text-teal-700 ring-teal-200',
  LAB_PENDING: 'bg-purple-50 text-purple-700 ring-purple-200',
  PHARMACY_PENDING: 'bg-lime-50 text-lime-700 ring-lime-200',
  BILLING_PENDING: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  OPEN: 'bg-blue-50 text-blue-700 ring-blue-200',

  // Lab results
  NORMAL: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ABNORMAL: 'bg-amber-50 text-amber-700 ring-amber-200',
  CRITICAL: 'bg-red-50 text-red-700 ring-red-200',
  PENDING: 'bg-gray-100 text-gray-600 ring-gray-200',

  // Invoice
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  DRAFT: 'bg-gray-100 text-gray-500 ring-gray-200',
  OVERDUE: 'bg-red-50 text-red-700 ring-red-200',
  PARTIAL: 'bg-amber-50 text-amber-700 ring-amber-200',
  REFUNDED: 'bg-violet-50 text-violet-700 ring-violet-200',

  // Prescription / dispensing
  DISPENSED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CREATED: 'bg-gray-100 text-gray-600 ring-gray-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',

  // User status
  INACTIVE: 'bg-gray-100 text-gray-500 ring-gray-200',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-200',
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 ring-amber-200',
  PENDING_APPROVAL: 'bg-orange-50 text-orange-700 ring-orange-200',

  // Doctor verification
  VERIFIED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',

  // Default
  default: 'bg-gray-100 text-gray-600 ring-gray-200',
}

interface BadgeProps {
  status: string
  className?: string
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const style = variants[status] || variants.default
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).toLowerCase()

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset capitalize ${style} ${className}`}>
      {label}
    </span>
  )
}
