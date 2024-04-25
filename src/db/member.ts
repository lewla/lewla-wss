import { app } from '../index.js'

export interface Member {
    id: string
    username: string
    display_name: string
    password: string
    avatar_url: string | null
    email_address: string | null
    creation_date: Date
}

export const getAll = async (): Promise<Member[]> => {
    const result = await app.db.query('SELECT id, username, display_name, password, avatar_url, email_address, creation_date FROM member')
    return result.rows
}

export const getById = async (id: string): Promise<Member[]> => {
    const result = await app.db.query('SELECT id, username, display_name, password, avatar_url, email_address, creation_date FROM member WHERE id = $1', [id])
    return result.rows
}

export const create = async (member: Member): Promise<boolean> => {
    const result = await app.db.query(`
        INSERT INTO member
            (id, username, display_name, password, avatar_url, email_address)
        VALUES
            ($1, $2, $3, $4, $5, $6)
    `,
    [member.id, member.username, member.display_name, member.password, member.avatar_url, member.email_address])
    return result.rowCount === 1
}
