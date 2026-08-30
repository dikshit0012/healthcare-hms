import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'violet' | 'indigo' | 'sky' | 'teal'
  trend?: { value: string; up: boolean }
  subtitle?: string
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
  sky: { bg: 'bg-sky-50', icon: 'text-sky-600', ring: 'ring-sky-100' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600', ring: 'ring-teal-100' },
}

export default function StatCard({ title, value, icon: Icon, color = 'sky', trend, subtitle }: StatCardProps) {
  const c = colorMap[color] || colorMap.sky

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100/50 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-gray-500 truncate">{title}</p>
          <p className="text-[28px] font-bold text-gray-900 mt-1 tracking-tight leading-none">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span className="text-xs font-semibold">{trend.value}</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center shrink-0 ml-4`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </div>
  )
}
