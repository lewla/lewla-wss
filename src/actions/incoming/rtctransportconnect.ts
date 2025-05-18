import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'
import { app } from '../../index.js'
import { RTCTransportConnectedAction } from '../outgoing/rtctransportconnected.js'

interface RTCTransportConnectData {
    transportId: string
    dtlsParameters: types.DtlsParameters
    channelId: string
}

export class RTCTransportConnectAction extends BaseAction {
    public static identifier = 'rtctransportconnect'
    public body: { data: RTCTransportConnectData }

    constructor (sender: WebSocket, body: { data: RTCTransportConnectData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.transportId !== 'string' ||
            typeof this.body.data.channelId !== 'string' ||
            this.body.data.dtlsParameters === undefined
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        const router = app.sfu.routers.get(this.body.data.channelId)
        const transport = app.sfu.transports.get(this.body.data.transportId)

        if (router === undefined || transport === undefined) {
            return
        }

        await transport.connect({ dtlsParameters: this.body.data.dtlsParameters })
            .then(() => {
                const connectedAction = new RTCTransportConnectedAction(this.sender, { data: { id: transport.id } }, this.id)
                connectedAction.send(this.sender)
            })
            .catch((error) => { console.error(error) })
    }
}
