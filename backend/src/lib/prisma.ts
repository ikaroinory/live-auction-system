import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function parseQueryToDescription(query: string): string {
  const trimmed = query.trim().toUpperCase()

  if (trimmed.startsWith('SELECT')) {
    const fromMatch = trimmed.match(/FROM\s+`?(\w+)`?\./i)
    const model = fromMatch ? fromMatch[1] : 'unknown'
    if (model !== 'UNKNOWN') {
      return `[SELECT] ${model}`
    }
    const simpleMatch = trimmed.match(/FROM\s+`?(\w+)`?\s+/i)
    const simpleModel = simpleMatch ? simpleMatch[1] : 'unknown'
    return `[SELECT] ${simpleModel}`
  }

  if (trimmed.startsWith('INSERT')) {
    const intoMatch = trimmed.match(/INTO\s+`?(\w+)`?\./i)
    const model = intoMatch ? intoMatch[1] : 'unknown'
    if (model !== 'UNKNOWN') {
      return `[INSERT] ${model}`
    }
    const simpleMatch = trimmed.match(/INTO\s+`?(\w+)`?\s+\(/i)
    const simpleModel = simpleMatch ? simpleMatch[1] : 'unknown'
    return `[INSERT] ${simpleModel}`
  }

  if (trimmed.startsWith('UPDATE')) {
    const tableMatch = trimmed.match(/UPDATE\s+`?(\w+)`?\./i)
    const model = tableMatch ? tableMatch[1] : 'unknown'
    if (model !== 'UNKNOWN') {
      return `[UPDATE] ${model}`
    }
    const simpleMatch = trimmed.match(/UPDATE\s+`?(\w+)`?\s+/i)
    const simpleModel = simpleMatch ? simpleMatch[1] : 'unknown'
    return `[UPDATE] ${simpleModel}`
  }

  if (trimmed.startsWith('DELETE')) {
    const fromMatch = trimmed.match(/FROM\s+`?(\w+)`?\./i)
    const model = fromMatch ? fromMatch[1] : 'unknown'
    if (model !== 'UNKNOWN') {
      return `[DELETE] ${model}`
    }
    const simpleMatch = trimmed.match(/FROM\s+`?(\w+)`?\s+/i)
    const simpleModel = simpleMatch ? simpleMatch[1] : 'unknown'
    return `[DELETE] ${simpleModel}`
  }

  return query.substring(0, 80)
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query'
      },
      {
        emit: 'event',
        level: 'info'
      },
      {
        emit: 'event',
        level: 'warn'
      },
      {
        emit: 'event',
        level: 'error'
      }
    ]
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

prisma.$on('query', (e: Prisma.QueryEvent) => {
  const description = parseQueryToDescription(e.query)
  console.log(`📊 ${description} (${e.duration}ms)`)
})

prisma.$on('info', (e: Prisma.LogEvent) => {
  console.log('ℹ️ ', e.message)
})

prisma.$on('warn', (e: Prisma.LogEvent) => {
  console.warn('⚠️ ', e.message)
})

prisma.$on('error', (e: Prisma.LogEvent) => {
  console.error('❌ ', e.message)
})
