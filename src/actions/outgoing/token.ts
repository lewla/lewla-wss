import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface Payload {
    token: string
}

export class TokenAction extends BaseAction {
    public static identifier = 'token'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.token !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
