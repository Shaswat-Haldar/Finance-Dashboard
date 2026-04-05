import { SEED_TRANSACTIONS } from '../data/mockTransactions'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Simulates a network request returning transaction data.
 * Random tiny failure rate demonstrates error handling (optional retry in UI).
 */
export async function fetchMockTransactions({ failRate = 0 } = {}) {
  await delay(550 + Math.random() * 400)
  if (Math.random() < failRate) {
    throw new Error('Mock API: temporary unavailable')
  }
  return SEED_TRANSACTIONS.map((t) => ({ ...t }))
}
