import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// postgres-js client — max:10 for a dev workload
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  // Keep dates as plain YYYY-MM-DD strings (don't convert to JS Date objects)
  types: {
    date: {
      to: 1082,
      from: [1082],
      serialize: (x: string) => x,
      parse: (x: string) => x,
    },
  },
})

export const db = drizzle(client, { schema })

export { client }
