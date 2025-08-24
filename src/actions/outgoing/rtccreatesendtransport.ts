import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'

interface Payload {
    id: string
    iceParameters: types.IceParameters
    iceCandidates: types.IceCandidate[]
    dtlsParameters: types.DtlsParameters
    sctpParameters: types.SctpParameters | undefined
    channelId: string
    iceServers: RTCIceServer[]
}

export class RTCCreateSendTransportAction extends BaseAction {
    public static identifier = 'rtccreatesendtransport'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.id !== 'string' ||
            typeof this.body.data.channelId !== 'string' ||
            this.body.data.iceParameters === undefined ||
            this.body.data.iceCandidates === undefined ||
            this.body.data.dtlsParameters === undefined
        ) {
            throw new Error('Invalid payload')
        }
    }
}
