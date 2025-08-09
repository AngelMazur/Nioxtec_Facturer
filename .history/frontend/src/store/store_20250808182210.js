import { create } from 'zustand'

// Estado global de la aplicación. Almacena clientes e invoices.
export const useStore = create((set) => ({
  clients: [],
  invoices: [],
  token: null,
  setClients: (clients) => set({ clients }),
  setInvoices: (invoices) => set({ invoices }),
  setToken: (token) => set({ token }),
}))