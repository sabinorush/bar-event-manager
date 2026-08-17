import { useEffect, useState } from 'react'
import { Dashboard } from './components/dashboard'
import { InventoryTable } from './components/inventory-table'
import { RecipeGrid } from './components/recipe-grid'
import { EventPlannerStep1 } from './components/event-planner-step1'
import { EventPlannerStep2 } from './components/event-planner-step2'
import { ShoppingList } from './components/shopping-list'
import { ScenarioComparisonModal } from './components/scenario-comparison-modal'
import { Button } from './components/ui/button'
import { Toaster } from './components/ui/sonner'
import { UpdateNotifier } from './components/update-notifier'
import { LayoutDashboard, Package, Wine, Calendar, Menu, X, Sparkles, Loader2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { CocktailMix, EventScope } from '@shared/types'
import { useAppStore } from './store/useAppStore'

type Screen = 'dashboard' | 'inventory' | 'recipes' | 'event-planner' | 'shopping-list'
type EventStep = 1 | 2

export default function App() {
  const loaded = useAppStore((s) => s.loaded)
  const loadError = useAppStore((s) => s.loadError)
  const loadAll = useAppStore((s) => s.loadAll)
  const createEvent = useAppStore((s) => s.createEvent)

  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')
  const [eventStep, setEventStep] = useState<EventStep>(1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false)

  const [eventName, setEventName] = useState('Novo Evento')
  const [eventScope, setEventScope] = useState<EventScope>({
    pax: 150,
    drinksPerPax: 3,
    ticketPrice: 45,
    staffCost: 800,
    iceCost: 150,
    transportCost: 200
  })

  const [currentEventId, setCurrentEventId] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const navigationItems = [
    { id: 'dashboard' as Screen, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as Screen, label: 'Inventário', icon: Package },
    { id: 'recipes' as Screen, label: 'Receitas', icon: Wine },
    { id: 'event-planner' as Screen, label: 'Planejador de Eventos', icon: Calendar }
  ]

  const handleEventComplete = async (mix: CocktailMix[]) => {
    const created = await createEvent({ name: eventName, scope: eventScope, mix })
    setCurrentEventId(created.id)
    setCurrentScreen('shopping-list')
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <AlertTriangle className="w-8 h-8 text-rose" />
          <p>Não foi possível carregar os dados do bar.</p>
          <p className="text-sm text-muted-foreground break-words">{loadError}</p>
          <Button onClick={() => loadAll()} className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p>Carregando dados do bar...</p>
        </div>
      </div>
    )
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />
      case 'inventory':
        return <InventoryTable />
      case 'recipes':
        return <RecipeGrid />
      case 'event-planner':
        return eventStep === 1 ? (
          <EventPlannerStep1
            name={eventName}
            onNameChange={setEventName}
            scope={eventScope}
            onScopeChange={setEventScope}
            onNext={() => setEventStep(2)}
          />
        ) : (
          <EventPlannerStep2 scope={eventScope} onBack={() => setEventStep(1)} onComplete={handleEventComplete} />
        )
      case 'shopping-list':
        return currentEventId ? <ShoppingList eventId={currentEventId} /> : <Dashboard />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-card/95"
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl">BarEvent Manager Pro</h1>
                <p className="text-xs text-muted-foreground">Gestão Profissional de Bar</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentScreen === item.id

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => {
                      setCurrentScreen(item.id)
                      if (item.id === 'event-planner') setEventStep(1)
                    }}
                    className={isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-secondary'}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}

              <Button variant="outline" onClick={() => setComparisonModalOpen(true)} className="ml-4 border-primary/50 hover:bg-primary/10">
                Comparar Cenários
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-border overflow-hidden"
            >
              <div className="container mx-auto px-6 py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentScreen === item.id

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'default' : 'ghost'}
                      onClick={() => {
                        setCurrentScreen(item.id)
                        if (item.id === 'event-planner') setEventStep(1)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full justify-start ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  onClick={() => {
                    setComparisonModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-start border-primary/50"
                >
                  Comparar Cenários
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen + (currentScreen === 'event-planner' ? eventStep : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <ScenarioComparisonModal open={comparisonModalOpen} onOpenChange={setComparisonModalOpen} />

      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 BarEvent Manager Pro. Todos os direitos reservados.</p>
            <p className="text-sm text-muted-foreground">Powered by otimização de eventos por IA</p>
          </div>
        </div>
      </footer>

      <Toaster />
      <UpdateNotifier />
    </div>
  )
}
