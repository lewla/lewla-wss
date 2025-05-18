import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'
import { VoiceConnectAction as OutgoingVoiceConnectAction } from '../outgoing/voiceconnect.js'
import { RTPCapabilitiesAction } from '../outgoing/rtpcapabilities.js'

interface VoiceConnectData {
    channel: string
}

export class VoiceConnectAction extends BaseAction {
    public static identifier = 'voiceconnect'
    public body: { data: VoiceConnectData }

    constructor (sender: WebSocket, body: { data: VoiceConnectData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.channel !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public handle (): void {
        const member = app.connections.get(this.sender)?.member?.id
        const channel = app.channels.get(this.body.data.channel)?.id
        if (member != null && channel != null) {
            if (app.sfu.routers.get(channel) === undefined) {
                app.sfu.createRouter().then(
                    (router) => {
                        app.sfu.routers.set(channel, router)

                        const message = new OutgoingVoiceConnectAction(this.sender, { data: { member, channel } })
                        message.send(app.wss.clients)

                        if (router !== undefined) {
                            const capabilitiesAction = new RTPCapabilitiesAction(this.sender, { data: { rtpCapabilities: router.rtpCapabilities, channelId: channel } })
                            capabilitiesAction.send(this.sender)
                        }
                    }
                ).catch((error) => { console.error(error) })
            } else {
                const router = app.sfu.routers.get(channel)
                if (router !== undefined) {
                    const message = new OutgoingVoiceConnectAction(this.sender, { data: { member, channel } })
                    message.send(app.wss.clients)

                    const capabilitiesAction = new RTPCapabilitiesAction(this.sender, { data: { rtpCapabilities: router.rtpCapabilities, channelId: channel } })
                    capabilitiesAction.send(this.sender)
                }
            }
        } else {
            console.error(member, channel)
        }
    }
}
