import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

export interface Payload {
    member: string
    timestamp?: number
}

export class ConnectedAction extends BaseAction {
    public static identifier = 'connected'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.member !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
