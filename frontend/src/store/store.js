import { create } from 'zustand'

// Estado global de la aplicación. Almacena clientes e invoices.
const initialToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null

export const useStore = create((set) => ({
  clients: [],
  invoices: [],
  token: initialToken,
  setClients: (clients) => set({ clients }),
  setInvoices: (invoices) => set({ invoices }),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) window.localStorage.setItem('token', token)
      else window.localStorage.removeItem('token')
    }
    set({ token })
  },
  logout: () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem('token')
    set({ token: null, clients: [], invoices: [] })
  },
}))