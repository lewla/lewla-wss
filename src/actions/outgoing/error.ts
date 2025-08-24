import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface Payload {
    message: string
}

export class ErrorAction extends BaseAction {
    public static identifier = 'error'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.message !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
