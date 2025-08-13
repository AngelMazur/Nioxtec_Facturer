import { create } from 'zustand'

// Estado global de la aplicación. Almacena clientes e invoices.
const initialToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null

// Recuperar estado persistente del ordenamiento
const getPersistedOrderState = () => {
  if (typeof window === 'undefined') return { customInvoiceOrder: [], userHasSorted: false }
  
  try {
    const savedOrder = window.localStorage.getItem('customInvoiceOrder')
    const savedUserSorted = window.localStorage.getItem('userHasSorted')
    
    return {
      customInvoiceOrder: savedOrder ? JSON.parse(savedOrder) : [],
      userHasSorted: savedUserSorted === 'true'
    }
  } catch {
    return { customInvoiceOrder: [], userHasSorted: false }
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
  
  setClients: (clients) => set({ clients }),
  setInvoices: (invoices) => set({ invoices }),
  
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
    }
    set({ token: null, clients: [], invoices: [], customInvoiceOrder: [], userHasSorted: false })
  },
}))