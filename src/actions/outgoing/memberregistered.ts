import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

export interface Payload {
    id: string
    type: string
    display_name: string
    avatar_url: string | null
    status: string
    creation_date: string
}

export class MemberRegisteredAction extends BaseAction {
    public static identifier = 'memberregistered'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.id !== 'string' ||
            typeof this.body.data.type !== 'string' ||
            typeof this.body.data.display_name !== 'string' ||
            typeof this.body.data.status !== 'string' ||
            typeof this.body.data.creation_date !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
