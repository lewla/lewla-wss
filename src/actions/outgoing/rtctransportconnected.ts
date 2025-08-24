import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

export interface Payload {
    id: string
}

export class RTCTransportConnectedAction extends BaseAction {
    public static identifier = 'rtctransportconnected'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.id !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
