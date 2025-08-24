import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'
import { app } from '../../index.js'
import { RTCTransportProducedAction } from '../outgoing/rtctransportproduced.js'
import { sendError } from '../../helpers/messaging.js'
import { RTCNewProducerAction } from '../outgoing/rtcnewproducer.js'
import { RTCProducerClosedAction } from '../outgoing/rtcproducerclosed.js'
import { VoiceDisconnectAction } from '../outgoing/voicedisconnect.js'
import { Channel } from '../../db/entity/channel.js'

interface Payload {
    transportId: string
    kind: types.MediaKind
    rtpParameters: types.RtpParameters
    appData: types.AppData
    channelId: string
}

export class RTCTransportProduceAction extends BaseAction {
    public static identifier = 'rtctransportproduce'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.transportId !== 'string' ||
            typeof this.body.data.kind !== 'string' ||
            typeof this.body.data.channelId !== 'string' ||
            this.body.data.rtpParameters === undefined ||
            this.body.data.appData === undefined
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        const member = app.connections.get(this.sender)?.member
        const channel = await app.dataSource
            .getRepository(Channel)
            .createQueryBuilder('channel')
            .where('channel.id = :id', { id: this.body.data.channelId })
            .getOne()

        if (member === undefined) {
            sendError(this.sender, 'Invalid member', this.id)
            return
        }

        const transport = app.sfu.transports.get(this.body.data.transportId)

        if (transport === undefined || channel === null) {
            return
        }

        this.body.data.appData.memberId = member.id
        this.body.data.appData.channelId = channel.id
        this.body.data.appData.connection = this.sender

        transport.produce({
            kind: this.body.data.kind,
            rtpParameters: this.body.data.rtpParameters,
            appData: this.body.data.appData
        }).then((producer) => {
            app.sfu.producers.set(producer.id, producer)

            const producedAction = new RTCTransportProducedAction(this.sender, { data: { producerId: producer.id } }, this.id)
            producedAction.send(this.sender)

            const newProducer = new RTCNewProducerAction(this.sender, { data: { producerId: producer.id, rtpParameters: producer.rtpParameters, memberId: member.id, channelId: channel.id } })
            newProducer.broadcast(app.wss.clients)

            producer.observer.on('close', () => {
                app.sfu.producers.delete(producer.id)
                const producerClosed = new RTCProducerClosedAction(this.sender, { data: { producerId: producer.id } })
                producerClosed.send(app.wss.clients)
            })

            producer.on('transportclose', () => {
                producer.close()
                const voiceDisconnect = new VoiceDisconnectAction(this.sender, { data: { member: member.id, channel: channel.id } })
                voiceDisconnect.send(app.wss.clients)
            })
        }).catch((error) => {
            console.error(error)
            sendError(this.sender, 'Error setting up producer', this.id)
        })
    }
}
