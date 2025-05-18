import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface VoiceConnectData {
    member: string
    channel: string
}

export class VoiceConnectAction extends BaseAction {
    public static identifier = 'voiceconnect'
    public body: { data: VoiceConnectData }

    constructor (sender: WebSocket, body: { data: VoiceConnectData }) {
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
