import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { fetchMockTransactions } from '../api/mockApi'
import { dedupeById, sanitizeTransaction, sanitizeTransactions } from '../utils/transactions'

const genId = () =>
  `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

const safeLocalStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      /* quota / private mode */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}

function clampRole(v, fallback) {
  return v === 'admin' || v === 'viewer' ? v : fallback
}

function clampTheme(v, fallback) {
  return v === 'dark' || v === 'light' ? v : fallback
}

function clampSortBy(v, fallback) {
  return v === 'date' || v === 'amount' || v === 'category' ? v : fallback
}

function clampSortDir(v, fallback) {
  return v === 'asc' || v === 'desc' ? v : fallback
}

function clampGroupBy(v, fallback) {
  return v === 'none' || v === 'month' || v === 'category' ? v : fallback
}

const initialSlice = {
  searchQuery: '',
  filterCategory: 'all',
  filterType: 'all',
  filterDateFrom: '',
  filterDateTo: '',
  filterAmountMin: '',
  filterAmountMax: '',
  sortBy: 'date',
  sortDir: 'desc',
  groupBy: 'none',
}

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      apiLoading: false,
      apiError: null,

      transactions: [],
      role: 'viewer',
      theme: 'light',

      ...initialSlice,

      formOpen: false,
      editingTransaction: null,

      fetchInitialData: async () => {
        set({ apiLoading: true, apiError: null })
        try {
          const raw = await fetchMockTransactions()
          const transactions = dedupeById(sanitizeTransactions(raw))
          set({ transactions, apiLoading: false })
        } catch (e) {
          set({
            apiError: e?.message || 'Failed to load data',
            apiLoading: false,
          })
        }
      },

      retryFetch: async () => {
        await get().fetchInitialData()
      },

      setRole: (role) => set({ role: clampRole(role, get().role) }),

      setTheme: (theme) => {
        const next = clampTheme(theme, get().theme)
        set({ theme: next })
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next === 'dark')
        }
      },

      setSearchQuery: (searchQuery) =>
        set({ searchQuery: typeof searchQuery === 'string' ? searchQuery : '' }),
      setFilterCategory: (filterCategory) =>
        set({
          filterCategory:
            typeof filterCategory === 'string' ? filterCategory : 'all',
        }),
      setFilterType: (filterType) =>
        set({ filterType: typeof filterType === 'string' ? filterType : 'all' }),
      setFilterDateFrom: (filterDateFrom) =>
        set({
          filterDateFrom:
            typeof filterDateFrom === 'string' ? filterDateFrom : '',
        }),
      setFilterDateTo: (filterDateTo) =>
        set({ filterDateTo: typeof filterDateTo === 'string' ? filterDateTo : '' }),
      setFilterAmountMin: (filterAmountMin) =>
        set({
          filterAmountMin:
            typeof filterAmountMin === 'string' ? filterAmountMin : '',
        }),
      setFilterAmountMax: (filterAmountMax) =>
        set({
          filterAmountMax:
            typeof filterAmountMax === 'string' ? filterAmountMax : '',
        }),
      setGroupBy: (groupBy) =>
        set({ groupBy: clampGroupBy(groupBy, get().groupBy) }),
      setSort: (sortBy, sortDir) =>
        set({
          sortBy: clampSortBy(sortBy, get().sortBy),
          sortDir: clampSortDir(sortDir, get().sortDir),
        }),

      resetFilters: () => set({ ...initialSlice }),

      openAddForm: () =>
        set({ formOpen: true, editingTransaction: null }),
      openEditForm: (transaction) =>
        set({ formOpen: true, editingTransaction: transaction }),
      closeForm: () =>
        set({ formOpen: false, editingTransaction: null }),

      addTransaction: (payload) => {
        const raw = {
          id: genId(),
          date: payload.date,
          amount: Number(payload.amount),
          category: payload.category.trim(),
          type: payload.type,
          description: payload.description.trim(),
        }
        const tx = sanitizeTransaction(raw)
        if (!tx) return
        set((s) => ({ transactions: [tx, ...s.transactions] }))
      },

      updateTransaction: (id, payload) => {
        set((s) => ({
          transactions: s.transactions.map((t) => {
            if (t.id !== id) return t
            const raw = {
              ...t,
              date: payload.date,
              amount: Number(payload.amount),
              category: payload.category.trim(),
              type: payload.type,
              description: payload.description.trim(),
            }
            return sanitizeTransaction(raw) ?? t
          }),
        }))
      },

      deleteTransaction: (id) => {
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        }))
      },

      resetDemoData: async () => {
        set({ apiLoading: true, apiError: null })
        try {
          const raw = await fetchMockTransactions()
          const transactions = dedupeById(sanitizeTransactions(raw))
          set({ transactions, apiLoading: false })
        } catch (e) {
          set({
            apiError: e?.message || 'Failed to reset',
            apiLoading: false,
          })
        }
      },
    }),
    {
      name: 'finance-dashboard-storage',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        role: state.role,
        theme: state.theme,
        searchQuery: state.searchQuery,
        filterCategory: state.filterCategory,
        filterType: state.filterType,
        filterDateFrom: state.filterDateFrom,
        filterDateTo: state.filterDateTo,
        filterAmountMin: state.filterAmountMin,
        filterAmountMax: state.filterAmountMax,
        sortBy: state.sortBy,
        sortDir: state.sortDir,
        groupBy: state.groupBy,
      }),
      merge: (persisted, current) => {
        const p =
          persisted && typeof persisted === 'object' ? persisted : {}
        const merged = { ...current, ...p }
        merged.transactions = dedupeById(
          sanitizeTransactions(
            Array.isArray(merged.transactions) ? merged.transactions : [],
          ),
        )
        merged.role = clampRole(merged.role, current.role)
        merged.theme = clampTheme(merged.theme, current.theme)
        merged.sortBy = clampSortBy(merged.sortBy, current.sortBy)
        merged.sortDir = clampSortDir(merged.sortDir, current.sortDir)
        merged.groupBy = clampGroupBy(merged.groupBy, current.groupBy)
        merged.filterCategory =
          typeof merged.filterCategory === 'string'
            ? merged.filterCategory
            : current.filterCategory
        merged.filterType =
          typeof merged.filterType === 'string'
            ? merged.filterType
            : current.filterType
        merged.searchQuery =
          typeof merged.searchQuery === 'string'
            ? merged.searchQuery
            : current.searchQuery
        merged.filterDateFrom =
          typeof merged.filterDateFrom === 'string'
            ? merged.filterDateFrom
            : ''
        merged.filterDateTo =
          typeof merged.filterDateTo === 'string' ? merged.filterDateTo : ''
        merged.filterAmountMin =
          typeof merged.filterAmountMin === 'string'
            ? merged.filterAmountMin
            : ''
        merged.filterAmountMax =
          typeof merged.filterAmountMax === 'string'
            ? merged.filterAmountMax
            : ''
        return merged
      },
    },
  ),
)
