import type { WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'
import { app } from '../../index.js'
import { sendError } from '../../helpers/messaging.js'
import { RTCConsumeProducerAction } from '../outgoing/rtcconsumeproucer.js'

interface RTCTransportConsumeData {
    transportId: string
    producerId: string
    rtpCapabilities: types.RtpCapabilities
    channelId: string
}

export class RTCTransportConsumeAction extends BaseAction {
    public static identifier = 'rtctransportconsume'
    public body: { data: RTCTransportConsumeData }

    constructor (sender: WebSocket, body: { data: RTCTransportConsumeData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.transportId !== 'string' ||
            typeof this.body.data.producerId !== 'string' ||
            typeof this.body.data.channelId !== 'string' ||
            this.body.data.rtpCapabilities === undefined
        ) {
            throw new Error('Invalid payload')
        }
    }

    public handle (): void {
        const router = app.sfu.routers.get(this.body.data.channelId)
        const transport = app.sfu.transports.get(this.body.data.transportId)
        const producer = app.sfu.producers.get(this.body.data.producerId)

        if (router === undefined || transport === undefined || producer === undefined) {
            return
        }

        if (router.canConsume({ producerId: this.body.data.producerId, rtpCapabilities: this.body.data.rtpCapabilities })) {
            transport.consume({
                producerId: this.body.data.producerId,
                rtpCapabilities: this.body.data.rtpCapabilities,
                paused: false,
                appData: producer.appData
            }).then((consumer) => {
                app.sfu.consumers.set(consumer.id, consumer)

                const consumeAction = new RTCConsumeProducerAction(
                    this.sender,
                    {
                        data: {
                            id: consumer.id,
                            producerId: consumer.producerId,
                            rtpParameters: consumer.rtpParameters,
                            appData: consumer.appData,
                            kind: 'audio'
                        }
                    }
                )
                consumeAction.send(this.sender)
            }).catch((reason) => {
                console.error(reason)
                sendError(this.sender, 'Error setting up consumer')
            })
        } else {
            sendError(this.sender, 'Cannot consume this producer')
        }
    }
}
