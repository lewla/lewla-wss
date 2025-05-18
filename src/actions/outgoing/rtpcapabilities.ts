import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'

interface RTPCapabilitiesData {
    rtpCapabilities: types.RtpCapabilities
    channelId: string
}

export class RTPCapabilitiesAction extends BaseAction {
    public static identifier = 'rtpcapabilities'
    public body: { data: RTPCapabilitiesData }

    constructor (sender: WebSocket, body: { data: RTPCapabilitiesData }) {
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
