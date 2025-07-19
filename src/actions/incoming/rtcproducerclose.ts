import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'

interface RTCProducerCloseData {
    producerId: string
}

export class RTCProducerCloseAction extends BaseAction {
    public static identifier = 'rtcproducerclose'
    public body: { data: RTCProducerCloseData }

    constructor (sender: WebSocket, body: { data: RTCProducerCloseData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.producerId !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public handle (): void {
        const member = app.connections.get(this.sender)?.member
        const producer = app.sfu.producers.get(this.body.data.producerId)

        if (producer === undefined || member === undefined) {
            return
        }

        if (producer.appData.memberId !== member.id) {
            return
        }

        producer.close()
    }
}
