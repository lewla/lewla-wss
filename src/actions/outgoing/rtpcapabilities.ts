import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'

export interface Payload {
    rtpCapabilities: types.RtpCapabilities
    channelId: string
}

export class RTPCapabilitiesAction extends BaseAction {
    public static identifier = 'rtpcapabilities'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.rtpCapabilities.codecs === 'undefined' ||
            typeof this.body.data.rtpCapabilities.headerExtensions === 'undefined' ||
            typeof this.body.data.channelId !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
