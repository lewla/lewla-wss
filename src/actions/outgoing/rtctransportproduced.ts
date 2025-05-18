import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface RTCTransportProducedData {
    producerId: string
}

export class RTCTransportProducedAction extends BaseAction {
    public static identifier = 'rtctransportproduced'
    public body: { data: RTCTransportProducedData }

    constructor (sender: WebSocket, body: { data: RTCTransportProducedData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.producerId !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
