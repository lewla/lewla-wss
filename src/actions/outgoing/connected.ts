import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface ConnectedData {
    member: string
    timestamp?: number
}

export class ConnectedAction extends BaseAction {
    public static identifier = 'connected'
    public body: { data: ConnectedData }

    constructor (sender: WebSocket, body: { data: ConnectedData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.member !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
