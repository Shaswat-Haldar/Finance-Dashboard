import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi, transactionsApi, analyticsApi } from '../api/client'
import { dedupeById, sanitizeTransaction, sanitizeTransactions } from '../utils/transactions'

const safeLocalStorage = {
  getItem: (name) => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name, value) => {
    try { localStorage.setItem(name, value) } catch { /* ignore */ }
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name) } catch { /* ignore */ }
  },
}

function clampRole(v, fallback) {
  return v === 'admin' || v === 'viewer' ? v : fallback
}

function clampTheme(v, fallback) {
  return v === 'dark' || v === 'light' ? v : fallback
}

function createToast(message, tone = 'info') {
  return {
    id: `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    tone,
  }
}

const initialFilterSlice = {
  searchQuery: '',
  filterCategories: [],
  filterType: 'all',
  filterDateFrom: '',
  filterDateTo: '',
  filterAmountMin: '',
  filterAmountMax: '',
  sortBy: 'date',
  sortDir: 'desc',
  groupBy: 'none',
  density: 'comfortable',
}

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      token: null,
      
      // UI State
      apiLoading: false,
      apiError: null,
      theme: 'light',
      toasts: [],
      formOpen: false,
      editingTransaction: null,

      // Data State
      transactions: [],
      analytics: {
        summary: { totalIncome: 0, totalExpense: 0, balance: 0, totalTransactions: 0 },
        trend: [],
        byCategory: [],
        categories: [],
      },
      lastUpdatedAt: null,

      ...initialFilterSlice,

      // --- Auth Actions ---
      register: async (name, email, password) => {
        set({ apiLoading: true, apiError: null })
        try {
          const { user, token } = await authApi.register({ name, email, password })
          set({ user, token, apiLoading: false })
          return { success: true }
        } catch (e) {
          set({ apiError: e.message, apiLoading: false })
          return { success: false, error: e.message }
        }
      },

      setRole: async (role) => {
        const { token } = get()
        if (!token) return
        set({ apiLoading: true })
        try {
          const { user, token: newToken } = await authApi.updateRole(token, role)
          set({ user, token: newToken, apiLoading: false })
          get().pushToast(`Role switched to ${role}.`, 'info')
        } catch (e) {
          set({ apiLoading: false })
          get().pushToast(e.message, 'error')
        }
      },

      login: async (email, password) => {
        set({ apiLoading: true, apiError: null })
        try {
          const { user, token } = await authApi.login({ email, password })
          set({ user, token, apiLoading: false })
          return { success: true }
        } catch (e) {
          set({ apiError: e.message, apiLoading: false })
          return { success: false, error: e.message }
        }
      },

      logout: () => {
        set({ user: null, token: null, transactions: [], analytics: { 
          summary: { totalIncome: 0, totalExpense: 0, balance: 0, totalTransactions: 0 },
          trend: [], byCategory: [], categories: [] 
        }})
      },

      // --- Data Actions ---
      fetchInitialData: async () => {
        const { token } = get()
        if (!token) return

        set({ apiLoading: true, apiError: null })
        try {
          // Fetch all data in parallel
          const [txData, summaryData, trendData, categoriesData] = await Promise.all([
            transactionsApi.list(token, { limit: 100 }), // Fetch recent 100
            analyticsApi.getSummary(token),
            analyticsApi.getTrend(token),
            analyticsApi.getCategories(token),
          ])

          set({
            transactions: sanitizeTransactions(txData.data),
            analytics: {
              summary: summaryData.data,
              trend: trendData.data,
              byCategory: [], // We'll fetch this if needed or calculate locally
              categories: categoriesData.data,
            },
            apiLoading: false,
            lastUpdatedAt: new Date().toISOString(),
          })
        } catch (e) {
          set({ apiError: e.message, apiLoading: false })
        }
      },

      retryFetch: async () => {
        await get().fetchInitialData()
      },

      refreshAnalytics: async () => {
        const { token } = get()
        if (!token) return
        try {
          const [summaryData, trendData] = await Promise.all([
            analyticsApi.getSummary(token),
            analyticsApi.getTrend(token),
          ])
          set({
            analytics: {
              ...get().analytics,
              summary: summaryData.data,
              trend: trendData.data,
            }
          })
        } catch (e) { console.error('Analytics refresh failed', e) }
      },

      addTransaction: async (payload) => {
        const { token } = get()
        try {
          const { data } = await transactionsApi.create(token, payload)
          const tx = sanitizeTransaction(data)
          set((s) => ({
            transactions: [tx, ...s.transactions],
            lastUpdatedAt: new Date().toISOString(),
            toasts: [...s.toasts, createToast('Transaction added.', 'success')],
          }))
          get().refreshAnalytics()
        } catch (e) {
          set((s) => ({ toasts: [...s.toasts, createToast(e.message, 'error')] }))
        }
      },

      updateTransaction: async (id, payload) => {
        const { token } = get()
        try {
          const { data } = await transactionsApi.update(token, id, payload)
          const tx = sanitizeTransaction(data)
          set((s) => ({
            transactions: s.transactions.map((t) => (t.id === id ? tx : t)),
            lastUpdatedAt: new Date().toISOString(),
            toasts: [...s.toasts, createToast('Transaction updated.', 'success')],
          }))
          get().refreshAnalytics()
        } catch (e) {
          set((s) => ({ toasts: [...s.toasts, createToast(e.message, 'error')] }))
        }
      },

      deleteTransaction: async (id) => {
        const { token } = get()
        try {
          await transactionsApi.delete(token, id)
          set((s) => ({
            transactions: s.transactions.filter((t) => t.id !== id),
            lastUpdatedAt: new Date().toISOString(),
            toasts: [...s.toasts, createToast('Transaction deleted.', 'success')],
          }))
          get().refreshAnalytics()
        } catch (e) {
          set((s) => ({ toasts: [...s.toasts, createToast(e.message, 'error')] }))
        }
      },

      // --- UI Actions ---
      setTheme: (theme) => {
        const next = clampTheme(theme, get().theme)
        set({ theme: next })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next === 'dark')
        }
      },
      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilterType: (t) => set({ filterType: t }),
      pushToast: (message, tone) => set((s) => ({ toasts: [...s.toasts, createToast(message, tone)] })),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      openAddForm: () => set({ formOpen: true, editingTransaction: null }),
      openEditForm: (tx) => set({ formOpen: true, editingTransaction: tx }),
      closeForm: () => set({ formOpen: false, editingTransaction: null }),
      resetDemoData: () => get().fetchInitialData(), // Now just refreshes from real DB
    }),
    {
      name: 'finance-dashboard-storage',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        theme: state.theme,
        density: state.density,
        sortBy: state.sortBy,
        sortDir: state.sortDir,
      }),
    },
  ),
)
