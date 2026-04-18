import 'dotenv/config'
import { db, client } from './index'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

async function runMigrations() {
  console.log('⏳ Running migrations...')
  const migrationsDir = join(process.cwd(), 'drizzle')
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'))

  for (const file of files) {
    console.log(`Executing ${file}...`)
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    // Split by statement if needed, or run as block
    // postgres-js handles multi-statement strings
    await db.execute(sql)
  }

  console.log('✅ Migrations complete!')
}

runMigrations()
  .catch(err => {
    console.error('❌ Migration failed:', err)
    process.exit(1)
  })
  .finally(() => client.end())
