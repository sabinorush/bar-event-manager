import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Users, Martini, DollarSign, Truck, Snowflake, UserCheck, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import type { EventScope } from '@shared/types'
import { formatCurrency } from '../lib/format'

interface EventPlannerStep1Props {
  name: string
  onNameChange: (name: string) => void
  scope: EventScope
  onScopeChange: (scope: EventScope) => void
  onNext: () => void
}

export function EventPlannerStep1({ name, onNameChange, scope, onScopeChange, onNext }: EventPlannerStep1Props) {
  const updateScope = (key: keyof EventScope, value: number) => {
    onScopeChange({ ...scope, [key]: value })
  }

  const totalDrinks = scope.pax * scope.drinksPerPax
  const totalRevenue = scope.pax * scope.ticketPrice
  const totalOpsCost = scope.staffCost + scope.iceCost + scope.transportCost

  return (
    <div className="space-y-6">
      <div>
        <h2>Escopo do Evento</h2>
        <p className="text-muted-foreground mt-1">Defina os parâmetros do seu evento e custos operacionais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="lg:col-span-2">
          <Card className="p-6 bg-card border-border">
            <h3 className="mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Detalhes do Evento
            </h3>

            <div className="mb-6">
              <Label htmlFor="eventName" className="mb-2">
                Nome do Evento
              </Label>
              <Input
                id="eventName"
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="bg-background border-border"
                placeholder="Ex.: Aniversário de 30 anos - João"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="pax" className="mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Número de Convidados (Pax)
                </Label>
                <Input
                  id="pax"
                  type="number"
                  value={scope.pax}
                  onChange={(e) => updateScope('pax', parseInt(e.target.value) || 0)}
                  className="bg-background border-border"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="drinksPerPax" className="mb-2 flex items-center gap-2">
                  <Martini className="w-4 h-4" />
                  Drinks por Convidado
                </Label>
                <Input
                  id="drinksPerPax"
                  type="number"
                  value={scope.drinksPerPax}
                  onChange={(e) => updateScope('drinksPerPax', parseFloat(e.target.value) || 0)}
                  className="bg-background border-border"
                  min="0"
                  step="0.5"
                />
              </div>

              <div>
                <Label htmlFor="ticketPrice" className="mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Preço do Ingresso (R$)
                </Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  value={scope.ticketPrice}
                  onChange={(e) => updateScope('ticketPrice', parseFloat(e.target.value) || 0)}
                  className="bg-background border-border"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total de Drinks</span>
                <span className="text-xl text-primary">{totalDrinks} drinks</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="p-6 bg-card border-border h-full">
            <h4 className="mb-4">Prévia de Receita</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Convidados</span>
                <span className="text-foreground">{scope.pax}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Preço/Convidado</span>
                <span className="text-foreground">{formatCurrency(scope.ticketPrice)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span>Receita Total</span>
                <span className="text-gold">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <Card className="p-6 bg-card border-border">
          <h3 className="mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-rose" />
            Custos Operacionais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="staffCost" className="mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Equipe & Mão de Obra (R$)
              </Label>
              <Input
                id="staffCost"
                type="number"
                value={scope.staffCost}
                onChange={(e) => updateScope('staffCost', parseFloat(e.target.value) || 0)}
                className="bg-background border-border"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="iceCost" className="mb-2 flex items-center gap-2">
                <Snowflake className="w-4 h-4" />
                Gelo & Consumíveis (R$)
              </Label>
              <Input
                id="iceCost"
                type="number"
                value={scope.iceCost}
                onChange={(e) => updateScope('iceCost', parseFloat(e.target.value) || 0)}
                className="bg-background border-border"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="transportCost" className="mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Transporte & Logística (R$)
              </Label>
              <Input
                id="transportCost"
                type="number"
                value={scope.transportCost}
                onChange={(e) => updateScope('transportCost', parseFloat(e.target.value) || 0)}
                className="bg-background border-border"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-rose/10 rounded-lg border border-rose/30">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Custo Operacional Total</span>
              <span className="text-xl text-rose">{formatCurrency(totalOpsCost)}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }} className="flex justify-end">
        <Button
          onClick={onNext}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          disabled={scope.pax === 0 || scope.drinksPerPax === 0 || name.trim().length === 0}
        >
          Continuar para Smart Mix
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}
