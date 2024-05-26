import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface PongData {
    timestamp: number
}

export class PongAction extends BaseAction {
    public static identifier = 'pong'
    public body: { data: PongData }

    constructor (sender: WebSocket, body: { data: PongData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.timestamp !== 'number'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
