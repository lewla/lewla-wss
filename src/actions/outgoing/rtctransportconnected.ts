import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface RTCTransportConnectedData {
    id: string
}

export class RTCTransportConnectedAction extends BaseAction {
    public static identifier = 'rtctransportconnected'
    public body: { data: RTCTransportConnectedData }

    constructor (sender: WebSocket, body: { data: RTCTransportConnectedData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.id !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
