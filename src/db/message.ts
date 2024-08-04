import { app } from '../index.js'

export interface Message {
    id: string
    channel: string
    member: string
    timestamp: string
    type: string
    body: {
        text?: string
        components?: Array<{
            type: string
            data: any
        }>
    }
}

export const getAll = async (): Promise<Message[]> => {
    const result = await app.db.query('SELECT id, channel, member, timestamp, type, body FROM message')
    return result.rows
}

export const getById = async (id: string): Promise<Message[]> => {
    const result = await app.db.query('SELECT id, channel, member, timestamp, type, body FROM message WHERE id = $1', [id])
    return result.rows
}

export const create = async (message: Message): Promise<boolean> => {
    const result = await app.db.query(`
        INSERT INTO message
            (id, channel, member, timestamp, type, body)
        VALUES
            ($1, $2, $3, $4, $5, $6)
    `,
    [message.id, message.channel, message.member, message.timestamp, message.type, message.body])
    return result.rowCount === 1
}
