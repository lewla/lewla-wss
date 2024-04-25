import { app } from '../index.js'

export interface Channel {
    id: string
    type: string
    name: string
    order: number
}

export const getAll = async (): Promise<Channel[]> => {
    const result = await app.db.query('SELECT id, type, name, "order" FROM channel')
    return result.rows
}

export const getById = async (id: string): Promise<Channel[]> => {
    const result = await app.db.query('SELECT id, type, name, "order" FROM channel WHERE id = $1', [id])
    return result.rows
}

export const create = async (channel: Channel): Promise<boolean> => {
    const result = await app.db.query(`
        INSERT INTO channel
            (id, type, name, "order")
        VALUES
            ($1, $2, $3, $4)
    `,
    [channel.id, channel.type, channel.name, channel.order])
    return result.rowCount === 1
}
