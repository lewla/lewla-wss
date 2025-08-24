import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'
import { VoiceConnectAction as OutgoingVoiceConnectAction } from '../outgoing/voiceconnect.js'
import { RTPCapabilitiesAction } from '../outgoing/rtpcapabilities.js'
import { Channel } from '../../db/entity/channel.js'

interface Payload {
    channel: string
}

export class VoiceConnectAction extends BaseAction {
    public static identifier = 'voiceconnect'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.channel !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        const member = app.connections.get(this.sender)?.member?.id
        const channel = await app.dataSource
            .getRepository(Channel)
            .createQueryBuilder('channel')
            .where('channel.id = :id', { id: this.body.data.channel })
            .getOne()

        if (member != null && channel != null) {
            if (app.sfu.routers.get(channel.id) === undefined) {
                app.sfu.createRouter().then(
                    (router) => {
                        app.sfu.routers.set(channel.id, router)

                        for (const transport of app.sfu.transports.values()) {
                            if (transport.appData.memberId === member) {
                                transport.close()
                            }
                        }

                        const message = new OutgoingVoiceConnectAction(this.sender, { data: { member, channel: channel.id } })
                        message.send(app.wss.clients)

                        if (router !== undefined) {
                            const capabilitiesAction = new RTPCapabilitiesAction(this.sender, { data: { rtpCapabilities: router.rtpCapabilities, channelId: channel.id } })
                            capabilitiesAction.send(this.sender)
                        }
                    }
                ).catch((error) => { console.error(error) })
            } else {
                const router = app.sfu.routers.get(channel.id)
                if (router !== undefined) {
                    for (const transport of app.sfu.transports.values()) {
                        if (transport.appData.memberId === member) {
                            transport.close()
                        }
                    }

                    const message = new OutgoingVoiceConnectAction(this.sender, { data: { member, channel: channel.id } })
                    message.send(app.wss.clients)

                    const capabilitiesAction = new RTPCapabilitiesAction(this.sender, { data: { rtpCapabilities: router.rtpCapabilities, channelId: channel.id } })
                    capabilitiesAction.send(this.sender)
                }
            }
        } else {
            console.error(member, channel)
        }
    }
}
