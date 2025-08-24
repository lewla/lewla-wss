import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface Payload {
    producerId: string
}

export class RTCTransportProducedAction extends BaseAction {
    public static identifier = 'rtctransportproduced'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.producerId !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
