import { useState } from 'react'
import { Card } from './ui/card'
import { KPICard } from './kpi-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, Percent, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '../lib/format'
import { motion } from 'motion/react'
import { useAppStore } from '../store/useAppStore'

const statusLabels: Record<string, string> = {
  Done: 'Concluído',
  Planning: 'Planejado',
  Cancelled: 'Cancelado'
}

export function Dashboard() {
  const [dateRange, setDateRange] = useState('month')
  const stats = useAppStore((s) => s.stats)
  const timeseries = useAppStore((s) => s.timeseries)
  const events = useAppStore((s) => s.events)

  const recentEvents = events.slice(0, 5)

  const chartData = timeseries.map((d) => ({
    date: formatDate(d.date),
    Lucro: d.profit,
    Custos: d.costs
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm text-foreground mb-1">{payload[0].payload.date}</p>
          <p className="text-sm text-[#10B981]">Lucro: {formatCurrency(payload[0].value)}</p>
          <p className="text-sm text-[#F43F5E]">Custos: {formatCurrency(payload[1].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard Executivo</h1>
          <p className="text-muted-foreground mt-1">Monitore o desempenho das operações do seu bar</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Último Trimestre</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Receita Total"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="gold"
          trend={{ value: '12.5%', isPositive: true }}
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(stats.netProfit)}
          icon={TrendingUp}
          color="emerald"
          trend={{ value: '8.3%', isPositive: true }}
        />
        <KPICard
          title="Margem Média %"
          value={`${stats.avgMargin.toFixed(1)}%`}
          icon={Percent}
          color="primary"
          trend={{ value: '2.1%', isPositive: true }}
        />
        <KPICard title="Qtd de Eventos" value={stats.eventsCount.toString()} icon={Calendar} color="rose" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="p-6 bg-card border-border">
          <h3 className="mb-6">Lucro vs Custos por Evento (Últimos 14)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.3 }} />
              <Legend wrapperStyle={{ color: '#F1F5F9' }} iconType="rect" />
              <Bar dataKey="Lucro" fill="#10B981" radius={[4, 4, 0, 0]} className="cursor-pointer hover:opacity-80 transition-opacity" />
              <Bar dataKey="Custos" fill="#F43F5E" radius={[4, 4, 0, 0]} className="cursor-pointer hover:opacity-80 transition-opacity" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h3>Eventos Recentes</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>Nome do Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right">Margem %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.map((event, index) => (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  className="border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <TableCell>{event.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(event.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.status === 'Done' ? 'default' : 'secondary'}
                      className={
                        event.status === 'Done'
                          ? 'bg-emerald/20 text-emerald border-emerald/50'
                          : 'bg-gold/20 text-gold border-gold/50'
                      }
                    >
                      {statusLabels[event.status] ?? event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-gold">{formatCurrency(event.totalRevenue)}</TableCell>
                  <TableCell className="text-right text-emerald">{formatCurrency(event.netProfit)}</TableCell>
                  <TableCell className="text-right">{event.margin.toFixed(1)}%</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  )
}
