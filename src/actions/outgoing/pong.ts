import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface Payload {
    timestamp: number
}

export class PongAction extends BaseAction {
    public static identifier = 'pong'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.timestamp !== 'number'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
