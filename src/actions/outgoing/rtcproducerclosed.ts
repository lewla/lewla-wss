import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface RTCProducerClosedData {
    producerId: string
}

export class RTCProducerClosedAction extends BaseAction {
    public static identifier = 'rtcproducerclosed'
    public body: { data: RTCProducerClosedData }

    constructor (sender: WebSocket, body: { data: RTCProducerClosedData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.producerId !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
