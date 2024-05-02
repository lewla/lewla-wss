import { type WebSocket } from 'ws'
import { BaseAction } from './base.js'

interface PingData {
    timestamp: number
}

interface PongData {
    timestamp: number
}

export class PingAction extends BaseAction {
    public static identifier = 'ping'
    public body: { data: PingData }

    constructor (sender: WebSocket, body: { data: PingData }) {
        super(sender, body)
        this.body = body
    }

    public handle (): void {
        const data: PongData = {
            timestamp: this.body.data.timestamp,
        }

        this.sender.send(JSON.stringify({ action: 'pong', data }))
    }
}
