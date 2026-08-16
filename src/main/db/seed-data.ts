/**
 * Dados de primeira execução — mesmos valores usados como mock na Fase 1
 * (ver src/renderer/src/lib/data.ts, hoje substituído pelas chamadas IPC).
 */

export const seedIngredients = [
  { id: 'gin-1', name: 'Tanqueray London Dry Gin', category: 'Spirits', supplier: 'Premium Spirits Co.', costPerBottle: 28.5, bottleSizeMl: 700 },
  { id: 'vodka-1', name: 'Grey Goose Vodka', category: 'Spirits', supplier: 'Premium Spirits Co.', costPerBottle: 42.0, bottleSizeMl: 700 },
  { id: 'rum-1', name: 'Bacardi Superior', category: 'Spirits', supplier: 'Caribbean Imports', costPerBottle: 18.0, bottleSizeMl: 700 },
  { id: 'whiskey-1', name: 'Bulleit Bourbon', category: 'Spirits', supplier: 'Premium Spirits Co.', costPerBottle: 32.0, bottleSizeMl: 700 },
  { id: 'whiskey-2', name: 'Macallan 12 Year', category: 'Spirits', supplier: 'Premium Spirits Co.', costPerBottle: 75.0, bottleSizeMl: 700 },
  { id: 'tequila-1', name: 'Patron Silver', category: 'Spirits', supplier: 'Premium Spirits Co.', costPerBottle: 48.0, bottleSizeMl: 700 },
  { id: 'vermouth-1', name: 'Martini Rosso Sweet Vermouth', category: 'Liqueurs', supplier: 'Italian Imports', costPerBottle: 12.5, bottleSizeMl: 1000 },
  { id: 'campari-1', name: 'Campari', category: 'Liqueurs', supplier: 'Italian Imports', costPerBottle: 24.0, bottleSizeMl: 700 },
  { id: 'triple-sec-1', name: 'Cointreau', category: 'Liqueurs', supplier: 'Premium Spirits Co.', costPerBottle: 32.0, bottleSizeMl: 700 },
  { id: 'lime-juice-1', name: 'Suco de Limão Fresco', category: 'Mixers', supplier: 'Local Produce', costPerBottle: 8.0, bottleSizeMl: 1000 },
  { id: 'lemon-juice-1', name: 'Suco de Limão Siciliano Fresco', category: 'Mixers', supplier: 'Local Produce', costPerBottle: 8.0, bottleSizeMl: 1000 },
  { id: 'simple-syrup-1', name: 'Xarope Simples', category: 'Syrups', supplier: 'Bar Supplies Ltd', costPerBottle: 5.0, bottleSizeMl: 1000 },
  { id: 'cranberry-1', name: 'Suco de Cranberry', category: 'Mixers', supplier: 'Beverage Suppliers', costPerBottle: 6.0, bottleSizeMl: 1000 },
  { id: 'orange-juice-1', name: 'Suco de Laranja Fresco', category: 'Mixers', supplier: 'Local Produce', costPerBottle: 9.0, bottleSizeMl: 1000 },
  { id: 'angostura-1', name: 'Angostura Bitters', category: 'Liqueurs', supplier: 'Bar Supplies Ltd', costPerBottle: 10.0, bottleSizeMl: 200 }
]

export const seedRecipes: Array<{
  id: string
  name: string
  category: string
  glassType: string
  ingredients: Array<{ ingredientId: string; amountMl: number }>
}> = [
  {
    id: 'negroni',
    name: 'Negroni',
    category: 'Classic',
    glassType: 'Copo Rocks',
    ingredients: [
      { ingredientId: 'gin-1', amountMl: 30 },
      { ingredientId: 'vermouth-1', amountMl: 30 },
      { ingredientId: 'campari-1', amountMl: 30 }
    ]
  },
  {
    id: 'margarita',
    name: 'Margarita',
    category: 'Classic',
    glassType: 'Taça Coupe',
    ingredients: [
      { ingredientId: 'tequila-1', amountMl: 50 },
      { ingredientId: 'triple-sec-1', amountMl: 20 },
      { ingredientId: 'lime-juice-1', amountMl: 25 }
    ]
  },
  {
    id: 'whiskey-sour',
    name: 'Whiskey Sour',
    category: 'Classic',
    glassType: 'Copo Rocks',
    ingredients: [
      { ingredientId: 'whiskey-1', amountMl: 50 },
      { ingredientId: 'lemon-juice-1', amountMl: 25 },
      { ingredientId: 'simple-syrup-1', amountMl: 20 }
    ]
  },
  {
    id: 'cosmopolitan',
    name: 'Cosmopolitan',
    category: 'Classic',
    glassType: 'Taça Martini',
    ingredients: [
      { ingredientId: 'vodka-1', amountMl: 40 },
      { ingredientId: 'triple-sec-1', amountMl: 15 },
      { ingredientId: 'lime-juice-1', amountMl: 15 },
      { ingredientId: 'cranberry-1', amountMl: 30 }
    ]
  },
  {
    id: 'mojito',
    name: 'Mojito',
    category: 'Classic',
    glassType: 'Copo Highball',
    ingredients: [
      { ingredientId: 'rum-1', amountMl: 50 },
      { ingredientId: 'lime-juice-1', amountMl: 25 },
      { ingredientId: 'simple-syrup-1', amountMl: 20 }
    ]
  },
  {
    id: 'old-fashioned',
    name: 'Old Fashioned',
    category: 'Classic',
    glassType: 'Copo Rocks',
    ingredients: [
      { ingredientId: 'whiskey-1', amountMl: 60 },
      { ingredientId: 'simple-syrup-1', amountMl: 10 },
      { ingredientId: 'angostura-1', amountMl: 2 }
    ]
  },
  {
    id: 'macallan-old-fashioned',
    name: 'Premium Old Fashioned',
    category: 'Premium',
    glassType: 'Copo Rocks',
    ingredients: [
      { ingredientId: 'whiskey-2', amountMl: 60 },
      { ingredientId: 'simple-syrup-1', amountMl: 10 },
      { ingredientId: 'angostura-1', amountMl: 2 }
    ]
  },
  {
    id: 'tequila-sunrise',
    name: 'Tequila Sunrise',
    category: 'Classic',
    glassType: 'Copo Highball',
    ingredients: [
      { ingredientId: 'tequila-1', amountMl: 50 },
      { ingredientId: 'orange-juice-1', amountMl: 100 }
    ]
  }
]

export const seedEvents: Array<{
  id: string
  name: string
  eventDate: string
  status: string
  pax: number
  drinksPerPax: number
  ticketPrice: number
  staffCost: number
  iceCost: number
  transportCost: number
  snapshot: { totalRevenue: number; ingredientCost: number; operationalCost: number; totalCost: number; netProfit: number; margin: number }
}> = [
  {
    id: 'evt-1',
    name: 'Lançamento Startup Tech',
    eventDate: '2024-11-20',
    status: 'Done',
    pax: 150,
    drinksPerPax: 3,
    ticketPrice: 45,
    staffCost: 800,
    iceCost: 150,
    transportCost: 200,
    snapshot: { totalRevenue: 6750, ingredientCost: 1700, operationalCost: 1150, totalCost: 2850, netProfit: 3900, margin: 57.78 }
  },
  {
    id: 'evt-2',
    name: 'Gala Corporativa de Fim de Ano',
    eventDate: '2024-11-15',
    status: 'Done',
    pax: 250,
    drinksPerPax: 4,
    ticketPrice: 65,
    staffCost: 1400,
    iceCost: 300,
    transportCost: 350,
    snapshot: { totalRevenue: 16250, ingredientCost: 4150, operationalCost: 2050, totalCost: 6200, netProfit: 10050, margin: 61.85 }
  },
  {
    id: 'evt-3',
    name: 'Recepção de Casamento - Silva',
    eventDate: '2024-11-08',
    status: 'Done',
    pax: 180,
    drinksPerPax: 5,
    ticketPrice: 75,
    staffCost: 1000,
    iceCost: 220,
    transportCost: 280,
    snapshot: { totalRevenue: 13500, ingredientCost: 3900, operationalCost: 1500, totalCost: 5400, netProfit: 8100, margin: 60.0 }
  },
  {
    id: 'evt-4',
    name: 'Lounge VIP Festival de Música',
    eventDate: '2024-12-05',
    status: 'Planning',
    pax: 200,
    drinksPerPax: 4,
    ticketPrice: 85,
    staffCost: 1200,
    iceCost: 250,
    transportCost: 300,
    snapshot: { totalRevenue: 17000, ingredientCost: 5450, operationalCost: 1750, totalCost: 7200, netProfit: 9800, margin: 57.65 }
  },
  {
    id: 'evt-5',
    name: 'Réveillon',
    eventDate: '2024-12-31',
    status: 'Planning',
    pax: 300,
    drinksPerPax: 6,
    ticketPrice: 120,
    staffCost: 2000,
    iceCost: 400,
    transportCost: 450,
    snapshot: { totalRevenue: 36000, ingredientCost: 11650, operationalCost: 2850, totalCost: 14500, netProfit: 21500, margin: 59.72 }
  }
]

/** Mix de coquetéis usado no seed de cada evento (mesma proporção para todos, só para demo). */
export const seedEventMix: Array<{ recipeId: string; percentage: number }> = [
  { recipeId: 'negroni', percentage: 30 },
  { recipeId: 'margarita', percentage: 40 },
  { recipeId: 'whiskey-sour', percentage: 30 }
]
