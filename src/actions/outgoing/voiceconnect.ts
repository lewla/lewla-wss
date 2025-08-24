import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

export interface Payload {
    member: string
    channel: string
}

export class VoiceConnectAction extends BaseAction {
    public static identifier = 'voiceconnect'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.member !== 'string' ||
            typeof this.body.data.channel !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
