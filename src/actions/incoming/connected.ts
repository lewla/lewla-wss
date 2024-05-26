import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'
import { ConnectedAction as OutgoingConnectedAction } from '../outgoing/connected.js'

export class ConnectedAction extends BaseAction {
    public static identifier = 'connected'
    public body: { data: any }

    constructor (sender: WebSocket, body: { data: any }) {
        super(sender, body)
        this.body = body
    }

    public handle (): void {
        const member = app.connections.get(this.sender)?.member?.id
        if (member != null) {
            const message = new OutgoingConnectedAction(this.sender, { data: { member, timestamp: Date.now() } })
            message.send(app.wss.clients)
        }
    }
}
