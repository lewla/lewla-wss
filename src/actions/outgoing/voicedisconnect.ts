import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface VoiceDisconnectData {
    member: string
    channel: string
}

export class VoiceDisconnectAction extends BaseAction {
    public static identifier = 'voicedisconnect'
    public body: { data: VoiceDisconnectData }

    constructor (sender: WebSocket, body: { data: VoiceDisconnectData }) {
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
