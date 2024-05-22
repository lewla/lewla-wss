import { type WebSocket } from 'ws'
import { BaseAction } from './base.js'

interface AuthenticatedData {
    member: {
        id: string
        username: string
        display_name: string
        creation_date: string
        avatar_url: string | null
    }
}

export class AuthenticatedAction extends BaseAction {
    public static identifier = 'authenticated'
    public body: { data: AuthenticatedData }

    constructor (sender: WebSocket, body: { data: AuthenticatedData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.member?.id !== 'string' ||
            typeof this.body.data.member?.username !== 'string' ||
            typeof this.body.data.member?.display_name !== 'string' ||
            typeof this.body.data.member?.creation_date !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
