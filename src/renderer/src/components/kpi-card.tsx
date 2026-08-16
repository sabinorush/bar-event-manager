import { Card } from './ui/card'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'

interface KPICardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  color: 'gold' | 'emerald' | 'rose' | 'primary'
}

const colorClasses = {
  gold: 'text-[#F59E0B] bg-[#F59E0B]/10',
  emerald: 'text-[#10B981] bg-[#10B981]/10',
  rose: 'text-[#F43F5E] bg-[#F43F5E]/10',
  primary: 'text-primary bg-primary/10'
}

const iconBgClasses = {
  gold: 'bg-[#F59E0B]/20',
  emerald: 'bg-[#10B981]/20',
  rose: 'bg-[#F43F5E]/20',
  primary: 'bg-primary/20'
}

export function KPICard({ title, value, icon: Icon, trend, color }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground mb-2">{title}</p>
            <h3 className={`text-3xl font-semibold ${colorClasses[color].split(' ')[0]}`}>{value}</h3>
            {trend && (
              <p className={`mt-2 text-sm ${trend.isPositive ? 'text-emerald' : 'text-rose'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[0]}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
