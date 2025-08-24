import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'

interface Payload {
    id: string
    rtpParameters: types.RtpParameters
    producerId: string
    kind: types.MediaKind
    appData: types.AppData
}

export class RTCConsumeProducerAction extends BaseAction {
    public static identifier = 'rtcconsumeproducer'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body
        if (
            typeof this.body.data.id !== 'string' ||
            typeof this.body.data.producerId !== 'string' ||
            (this.body.data.kind !== 'audio' && this.body.data.kind !== 'video') ||
            this.body.data.producerId === undefined ||
            this.body.data.appData === undefined
        ) {
            throw new Error('Invalid payload')
        }
    }
}
