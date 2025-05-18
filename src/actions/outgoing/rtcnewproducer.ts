import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'

interface RTCNewProducerData {
    producerId: string
    rtpParameters: types.RtpParameters
    memberId: string
    channelId: string
}

export class RTCNewProducerAction extends BaseAction {
    public static identifier = 'rtcnewproducer'
    public body: { data: RTCNewProducerData }

    constructor (sender: WebSocket, body: { data: RTCNewProducerData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.producerId !== 'string' ||
            typeof this.body.data.memberId !== 'string' ||
            typeof this.body.data.channelId !== 'string' ||
            this.body.data.rtpParameters === undefined
        ) {
            throw new Error('Invalid payload')
        }
    }
}
