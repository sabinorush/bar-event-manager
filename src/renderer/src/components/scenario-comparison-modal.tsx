import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { formatCurrency } from '../lib/format'
import { useAppStore } from '../store/useAppStore'
import type { Event } from '@shared/types'

interface Scenario {
  name: string
  revenue: number
  ingredientCost: number
  operationalCost: number
  totalCost: number
  netProfit: number
  margin: number
  cocktails: Array<{ name: string; percentage: number }>
}

function eventToScenario(event: Event): Scenario {
  return {
    name: event.name,
    revenue: event.totalRevenue,
    ingredientCost: event.ingredientCost,
    operationalCost: event.operationalCost,
    totalCost: event.totalCost,
    netProfit: event.netProfit,
    margin: event.margin,
    cocktails: event.cocktailMix.map((m) => ({ name: m.recipeName, percentage: m.percentage }))
  }
}

interface ScenarioComparisonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScenarioComparisonModal({ open, onOpenChange }: ScenarioComparisonModalProps) {
  const events = useAppStore((s) => s.events)
  const [eventAId, setEventAId] = useState('')
  const [eventBId, setEventBId] = useState('')

  useEffect(() => {
    if (open && events.length >= 2) {
      setEventAId((current) => current || events[0].id)
      setEventBId((current) => current || events[1].id)
    }
  }, [open, events])

  const eventA = events.find((e) => e.id === eventAId)
  const eventB = events.find((e) => e.id === eventBId)
  const scenarioA = eventA ? eventToScenario(eventA) : null
  const scenarioB = eventB ? eventToScenario(eventB) : null

  const profitDiff = scenarioB && scenarioA ? scenarioB.netProfit - scenarioA.netProfit : 0
  const costDiff = scenarioB && scenarioA ? scenarioB.totalCost - scenarioA.totalCost : 0
  const marginDiff = scenarioB && scenarioA ? scenarioB.margin - scenarioA.margin : 0

  const ComparisonCard = ({ scenario, label }: { scenario: Scenario; label: string }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="p-6 bg-card border-border h-full">
        <div className="mb-4">
          <Badge className="bg-primary/20 text-primary border-primary/50 mb-2">{label}</Badge>
          <h3>{scenario.name}</h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Receita</p>
            <p className="text-xl text-gold">{formatCurrency(scenario.revenue)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custo de Ingredientes</span>
              <span className="text-rose">-{formatCurrency(scenario.ingredientCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custo Operacional</span>
              <span className="text-rose">-{formatCurrency(scenario.operationalCost)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span>Custo Total</span>
              <span className="text-rose">{formatCurrency(scenario.totalCost)}</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              scenario.margin >= 50 ? 'bg-emerald/10 border-emerald/30' : scenario.margin >= 30 ? 'bg-gold/10 border-gold/30' : 'bg-rose/10 border-rose/30'
            }`}
          >
            <p className="text-sm text-muted-foreground mb-1">Lucro Líquido</p>
            <p className={`text-2xl ${scenario.margin >= 50 ? 'text-emerald' : scenario.margin >= 30 ? 'text-gold' : 'text-rose'}`}>
              {formatCurrency(scenario.netProfit)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Margem: {scenario.margin.toFixed(1)}%</p>
          </div>
        </div>

        <div>
          <h4 className="mb-3">Mix de Cocktails</h4>
          <div className="space-y-2">
            {scenario.cocktails.map((cocktail, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-background rounded text-sm">
                <span>{cocktail.name}</span>
                <Badge variant="outline" className="text-xs">
                  {cocktail.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-background border-border">
        <DialogHeader>
          <DialogTitle>Comparação de Cenários</DialogTitle>
          <DialogDescription>Escolha dois eventos para comparar receita, custo e mix de coquetéis lado a lado.</DialogDescription>
        </DialogHeader>

        {events.length < 2 ? (
          <Card className="p-8 bg-card border-border text-center text-muted-foreground">
            <p>Você precisa de pelo menos 2 eventos para comparar cenários.</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Cenário A</Label>
                <Select value={eventAId} onValueChange={setEventAId}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events
                      .filter((e) => e.id !== eventBId)
                      .map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2">Cenário B</Label>
                <Select value={eventBId} onValueChange={setEventBId}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events
                      .filter((e) => e.id !== eventAId)
                      .map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {scenarioA && scenarioB && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <ComparisonCard scenario={scenarioA} label="Cenário A" />
                  <ComparisonCard scenario={scenarioB} label="Cenário B" />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                  <Card className="p-6 bg-card border-border mt-4">
                    <h4 className="mb-4 flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-primary" />
                      Principais Diferenças (B vs A)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-lg border ${profitDiff > 0 ? 'bg-emerald/10 border-emerald/30' : 'bg-rose/10 border-rose/30'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {profitDiff > 0 ? <TrendingUp className="w-4 h-4 text-emerald" /> : <TrendingDown className="w-4 h-4 text-rose" />}
                          <span className="text-sm text-muted-foreground">Diferença de Lucro</span>
                        </div>
                        <p className={`text-xl ${profitDiff > 0 ? 'text-emerald' : 'text-rose'}`}>
                          {profitDiff > 0 ? '+' : ''}
                          {formatCurrency(profitDiff)}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg border ${costDiff < 0 ? 'bg-emerald/10 border-emerald/30' : 'bg-rose/10 border-rose/30'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {costDiff < 0 ? <TrendingDown className="w-4 h-4 text-emerald" /> : <TrendingUp className="w-4 h-4 text-rose" />}
                          <span className="text-sm text-muted-foreground">Diferença de Custo</span>
                        </div>
                        <p className={`text-xl ${costDiff < 0 ? 'text-emerald' : 'text-rose'}`}>
                          {costDiff > 0 ? '+' : ''}
                          {formatCurrency(costDiff)}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg border ${marginDiff > 0 ? 'bg-emerald/10 border-emerald/30' : 'bg-rose/10 border-rose/30'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {marginDiff > 0 ? <TrendingUp className="w-4 h-4 text-emerald" /> : <TrendingDown className="w-4 h-4 text-rose" />}
                          <span className="text-sm text-muted-foreground">Diferença de Margem</span>
                        </div>
                        <p className={`text-xl ${marginDiff > 0 ? 'text-emerald' : 'text-rose'}`}>
                          {marginDiff > 0 ? '+' : ''}
                          {marginDiff.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <p className="text-sm">
                        <span className="text-primary">Análise:</span>{' '}
                        {profitDiff > 0 ? (
                          <span>O Cenário B teve melhor lucratividade, com {formatCurrency(Math.abs(profitDiff))} a mais de lucro.</span>
                        ) : profitDiff < 0 ? (
                          <span>O Cenário A teve melhor lucratividade, com {formatCurrency(Math.abs(profitDiff))} a mais de lucro.</span>
                        ) : (
                          <span>Ambos os cenários tiveram lucratividade igual.</span>
                        )}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              </>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border hover:bg-secondary">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
