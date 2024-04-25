import pg from 'pg'

export const pool = new pg.Pool({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'lewla',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'lewla',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    application_name: 'lewla-wss',
})
