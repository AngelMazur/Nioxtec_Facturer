import { create } from 'zustand'

// Estado global de la aplicación. Almacena clientes e invoices.
const initialToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null

// Recuperar estado persistente del ordenamiento
const getPersistedOrderState = () => {
  if (typeof window === 'undefined') return { 
    customInvoiceOrder: [], 
    userHasSorted: false,
    customExpenseOrder: [],
    userHasSortedExpenses: false,
    customClientOrder: [],
    userHasSortedClients: false
  }
  
  try {
    const savedOrder = window.localStorage.getItem('customInvoiceOrder')
    const savedUserSorted = window.localStorage.getItem('userHasSorted')
    const savedExpenseOrder = window.localStorage.getItem('customExpenseOrder')
    const savedUserSortedExpenses = window.localStorage.getItem('userHasSortedExpenses')
    const savedClientOrder = window.localStorage.getItem('customClientOrder')
    const savedUserSortedClients = window.localStorage.getItem('userHasSortedClients')
    
    return {
      customInvoiceOrder: savedOrder ? JSON.parse(savedOrder) : [],
      userHasSorted: savedUserSorted === 'true',
      customExpenseOrder: savedExpenseOrder ? JSON.parse(savedExpenseOrder) : [],
      userHasSortedExpenses: savedUserSortedExpenses === 'true',
      customClientOrder: savedClientOrder ? JSON.parse(savedClientOrder) : [],
      userHasSortedClients: savedUserSortedClients === 'true'
    }
  } catch {
    return { 
      customInvoiceOrder: [], 
      userHasSorted: false,
      customExpenseOrder: [],
      userHasSortedExpenses: false,
      customClientOrder: [],
      userHasSortedClients: false
    }
  }
}

const persistedOrderState = getPersistedOrderState()

export const useStore = create((set, get) => ({
  clients: [],
  invoices: [],
  token: initialToken,
  // Estado para mantener el orden personalizado de facturas
  customInvoiceOrder: persistedOrderState.customInvoiceOrder, // Array de IDs en el orden deseado
  userHasSorted: persistedOrderState.userHasSorted, // Flag para saber si el usuario ha ordenado manualmente
  // Estado para mantener el orden personalizado de gastos
  customExpenseOrder: persistedOrderState.customExpenseOrder, // Array de IDs en el orden deseado
  userHasSortedExpenses: persistedOrderState.userHasSortedExpenses, // Flag para saber si el usuario ha ordenado manualmente
  // Estado para mantener el orden personalizado de clientes
  customClientOrder: persistedOrderState.customClientOrder, // Array de IDs en el orden deseado
  userHasSortedClients: persistedOrderState.userHasSortedClients, // Flag para saber si el usuario ha ordenado manualmente
  
  setClients: (clients) => set({ clients }),
  setInvoices: (invoices) => set({ invoices }),
  updateInvoicePaid: (invoiceId, paid) => set((state) => ({
    invoices: state.invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, paid } : inv
    ),
  })),
  
  // Método para añadir nueva factura al principio del orden personalizado
  addInvoiceToTop: (invoice) => {
    const { invoices, customInvoiceOrder, userHasSorted } = get()
    const newInvoices = [invoice, ...invoices]
    const newOrder = [invoice.id, ...customInvoiceOrder.filter(id => id !== invoice.id)]
    
    // Persistir en localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('customInvoiceOrder', JSON.stringify(newOrder))
      // Preservar la preferencia del usuario; no resetear sorting manual
      window.localStorage.setItem('userHasSorted', userHasSorted ? 'true' : 'false')
    }
    
    set({ 
      invoices: newInvoices, 
      customInvoiceOrder: newOrder,
      // Mantener el estado actual de userHasSorted para no perder selección al navegar
      userHasSorted
    })
  },
  
  // Método para establecer que el usuario ha ordenado manualmente
  setUserSorted: (sorted = true) => {
    // Persistir en localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userHasSorted', sorted.toString())
      if (sorted) {
        // Si el usuario ordena manualmente, limpiar el orden personalizado
        window.localStorage.removeItem('customInvoiceOrder')
      }
    }
    
    set({ 
      userHasSorted: sorted,
      customInvoiceOrder: sorted ? [] : get().customInvoiceOrder
    })
  },
  
  // Método para obtener facturas en orden personalizado
  getOrderedInvoices: () => {
    const { invoices, customInvoiceOrder, userHasSorted } = get()
    
    if (userHasSorted) {
      return invoices // Devolver orden original si usuario ha ordenado manualmente
    }
    
    if (customInvoiceOrder.length === 0) {
      // Si no hay orden personalizado, ordenar por ID descendente (más recientes primero)
      // Esto asume que los IDs se asignan incrementalmente
      return [...invoices].sort((a, b) => b.id - a.id)
    }
    
    // Aplicar orden personalizado
    const orderedIds = new Set(customInvoiceOrder)
    const ordered = []
    const unordered = []
    
    invoices.forEach(invoice => {
      if (orderedIds.has(invoice.id)) {
        ordered.push(invoice)
      } else {
        unordered.push(invoice)
      }
    })
    
    // Ordenar las facturas según el orden personalizado
    ordered.sort((a, b) => {
      const indexA = customInvoiceOrder.indexOf(a.id)
      const indexB = customInvoiceOrder.indexOf(b.id)
      return indexA - indexB
    })
    
    // Ordenar las no ordenadas por ID descendente (más recientes primero)
    unordered.sort((a, b) => b.id - a.id)
    
    // Añadir las no ordenadas al final
    return [...ordered, ...unordered]
  },
  
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) window.localStorage.setItem('token', token)
      else window.localStorage.removeItem('token')
    }
    set({ token })
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('customInvoiceOrder')
      window.localStorage.removeItem('userHasSorted')
      window.localStorage.removeItem('customExpenseOrder')
      window.localStorage.removeItem('userHasSortedExpenses')
      window.localStorage.removeItem('customClientOrder')
      window.localStorage.removeItem('userHasSortedClients')
    }
    set({ 
      token: null, 
      clients: [], 
      invoices: [], 
      customInvoiceOrder: [], 
      userHasSorted: false,
      customExpenseOrder: [],
      userHasSortedExpenses: false,
      customClientOrder: [],
      userHasSortedClients: false
    })
  },

  // Métodos para gastos (similar a facturas pero añadiendo al final)
  
  // Método para añadir nuevo gasto al final del orden personalizado
  addExpenseToEnd: (expense) => {
    const { customExpenseOrder, userHasSortedExpenses } = get()
    const newOrder = [...customExpenseOrder.filter(id => id !== expense.id), expense.id]
    
    // Persistir en localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('customExpenseOrder', JSON.stringify(newOrder))
      window.localStorage.setItem('userHasSortedExpenses', userHasSortedExpenses ? 'true' : 'false')
    }
    
    set({ 
      customExpenseOrder: newOrder,
      userHasSortedExpenses
    })
  },
  
  // Método para establecer que el usuario ha ordenado manualmente los gastos
  setUserSortedExpenses: (sorted = true) => {
    // Persistir en localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userHasSortedExpenses', sorted.toString())
      if (sorted) {
        // Si el usuario ordena manualmente, limpiar el orden personalizado
        window.localStorage.removeItem('customExpenseOrder')
      }
    }
    
    set({ 
      userHasSortedExpenses: sorted,
      customExpenseOrder: sorted ? [] : get().customExpenseOrder
    })
  },
  
  // Método para obtener gastos en orden personalizado
  getOrderedExpenses: (expenses) => {
    const { customExpenseOrder, userHasSortedExpenses } = get()
    
    if (userHasSortedExpenses) {
      return expenses // Devolver orden original si usuario ha ordenado manualmente
    }
    
    if (customExpenseOrder.length === 0) {
      // Si no hay orden personalizado, ordenar por ID ascendente (más antiguos primero)
      // Esto mantiene los nuevos gastos al final
      return [...expenses].sort((a, b) => a.id - b.id)
    }
    
    // Aplicar orden personalizado
    const orderedIds = new Set(customExpenseOrder)
    const ordered = []
    const unordered = []
    
    expenses.forEach(expense => {
      if (orderedIds.has(expense.id)) {
        ordered.push(expense)
      } else {
        unordered.push(expense)
      }
    })
    
    // Ordenar los gastos según el orden personalizado
    ordered.sort((a, b) => {
      const indexA = customExpenseOrder.indexOf(a.id)
      const indexB = customExpenseOrder.indexOf(b.id)
      return indexA - indexB
    })
    
    // Ordenar los no ordenados por ID ascendente (más antiguos primero)
    unordered.sort((a, b) => a.id - b.id)
    
    // Añadir los no ordenados al final
    return [...ordered, ...unordered]
  },

  // Métodos para clientes (similar a gastos pero añadiendo al final)
  
  // Método para añadir nuevo cliente al principio del orden personalizado
  addClientToEnd: (client) => {
    const { customClientOrder, userHasSortedClients } = get()
    const newOrder = [client.id, ...customClientOrder.filter(id => id !== client.id)]
    
    // Persistir en localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('customClientOrder', JSON.stringify(newOrder))
      window.localStorage.setItem('userHasSortedClients', userHasSortedClients ? 'true' : 'false')
    }
    
    set({ 
      customClientOrder: newOrder,
      userHasSortedClients
    })
  },
  
  // Método para establecer que el usuario ha ordenado manualmente los clientes
  setUserSortedClients: (sorted = true) => {
    // Persistir en localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userHasSortedClients', sorted.toString())
      if (sorted) {
        // Si el usuario ordena manualmente, limpiar el orden personalizado
        window.localStorage.removeItem('customClientOrder')
      }
    }
    
    set({ 
      userHasSortedClients: sorted,
      customClientOrder: sorted ? [] : get().customClientOrder
    })
  },
  
  // Método para obtener clientes en orden personalizado
  getOrderedClients: (clients) => {
    const { customClientOrder, userHasSortedClients } = get()
    
    if (userHasSortedClients) {
      return clients // Devolver orden original si usuario ha ordenado manualmente
    }
    
    if (customClientOrder.length === 0) {
      // Si no hay orden personalizado, ordenar por ID descendente (más nuevos primero)
      // Esto muestra los clientes más recientes al inicio
      return [...clients].sort((a, b) => b.id - a.id)
    }
    
    // Aplicar orden personalizado
    const orderedIds = new Set(customClientOrder)
    const ordered = []
    const unordered = []
    
    clients.forEach(client => {
      if (orderedIds.has(client.id)) {
        ordered.push(client)
      } else {
        unordered.push(client)
      }
    })
    
    // Ordenar los clientes según el orden personalizado
    ordered.sort((a, b) => {
      const indexA = customClientOrder.indexOf(a.id)
      const indexB = customClientOrder.indexOf(b.id)
      return indexA - indexB
    })
    
    // Ordenar los no ordenados por ID descendente (más nuevos primero)
    unordered.sort((a, b) => b.id - a.id)
    
    // Añadir los no ordenados al principio
    return [...unordered, ...ordered]
  },
}))
