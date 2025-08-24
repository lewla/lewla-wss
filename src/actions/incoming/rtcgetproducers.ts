import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'
import { RTCNewProducerAction } from '../outgoing/rtcnewproducer.js'

export interface Payload {
    channelId: string
}

export class RTCGetProducersAction extends BaseAction {
    public static identifier = 'rtcgetproducers'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.channelId !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        const member = app.connections.get(this.sender)?.member
        const router = app.sfu.routers.get(this.body.data.channelId)

        if (router === undefined || member === undefined) {
            return
        }

        const producers = app.sfu.producers.entries()

        for (const [producerId, producer] of producers) {
            if (typeof producer.appData.memberId === 'string' && producer.appData.channelId === this.body.data.channelId && producer.appData.memberId !== member.id) {
                const newProducer = new RTCNewProducerAction(this.sender, { data: { producerId, rtpParameters: producer.rtpParameters, memberId: producer.appData.memberId, channelId: producer.appData.channelId } })
                newProducer.send(this.sender)
            }
        }
    }
}
