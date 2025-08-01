import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface MessageData {
    id: string
    timestamp: string
    member: string
    channel: string
    type: string
    body: {
        text?: string
        components?: Array<{
            type: string
            data: any
        }>
    }
}

export class MessageAction extends BaseAction {
    public static identifier = 'message'
    public body: { data: MessageData }

    constructor (sender: WebSocket, body: { data: MessageData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.channel !== 'string' ||
            typeof this.body.data.type !== 'string' ||
            typeof this.body.data.timestamp !== 'string' ||
            typeof this.body.data.member !== 'string' ||
            this.body.data.body == null
        ) {
            throw new Error('Invalid payload')
        }
    }
}
