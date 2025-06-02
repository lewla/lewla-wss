import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import type { types } from 'mediasoup'
import { app } from '../../index.js'
import { RTCCreateReceiveTransportAction as OutgoingRTCCreateReceiveTransportAction } from '../outgoing/rtccreatereceivetransport.js'

interface RTCCreateTransportData {
    sctpCapabilities: types.SctpCapabilities
    channelId: string
}

export class RTCCreateReceiveTransportAction extends BaseAction {
    public static identifier = 'rtccreatereceivetransport'
    public body: { data: RTCCreateTransportData }

    constructor (sender: WebSocket, body: { data: RTCCreateTransportData }) {
        super(sender, body)
        this.body = body

        if (
            this.body.data.sctpCapabilities.numStreams === undefined ||
            typeof this.body.data.channelId !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        const router = app.sfu.routers.get(this.body.data.channelId)
        const worker = app.sfu.workers.get('test')
        const member = app.connections.get(this.sender)?.member
        const channel = app.channels.get(this.body.data.channelId)

        if (worker === undefined) {
            return
        }

        const server = app.sfu.servers.get(worker)

        if (server === undefined || router === undefined || member === undefined || channel === undefined) {
            return
        }

        const transport = await router.createWebRtcTransport({
            webRtcServer: server,
            numSctpStreams: this.body.data.sctpCapabilities.numStreams,
            enableSctp: true,
            enableTcp: true,
            enableUdp: true,
            preferUdp: true,
            appData: {
                memberId: member.id,
                channelId: channel.id,
                connection: this.sender,
                type: 'recv'
            },
        })

        app.sfu.transports.set(transport.id, transport)

        const createTransport = new OutgoingRTCCreateReceiveTransportAction(this.sender, {
            data: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
                sctpParameters: transport.sctpParameters,
                channelId: channel.id,
                iceServers: app.sfu.getTurnServers(member.id)
            }
        })
        createTransport.send(this.sender)

        transport.observer.on('close', () => {
            app.sfu.transports.delete(transport.id)
        })
    }
}
