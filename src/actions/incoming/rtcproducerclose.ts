import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'

export interface Payload {
    producerId: string
}

export class RTCProducerCloseAction extends BaseAction {
    public static identifier = 'rtcproducerclose'
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
