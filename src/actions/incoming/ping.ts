import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { PongAction } from '../outgoing/pong.js'

interface PingData {
    timestamp: number
}

export class PingAction extends BaseAction {
    public static identifier = 'ping'
    public body: { data: PingData }

    constructor (sender: WebSocket, body: { data: PingData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.timestamp !== 'number'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public handle (): void {
        const pong = new PongAction(this.sender, { data: { timestamp: this.body.data.timestamp } }, this.id)
        pong.send(this.sender)
    }
}
