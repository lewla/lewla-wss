import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'
import { sendError } from '../../helpers/messaging.js'
import { randomUUID } from 'crypto'
import { MessageAction as OutgoingMessageAction } from '../outgoing/message.js'

interface MessageData {
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
            this.body.data.body == null
        ) {
            throw new Error('Invalid payload')
        }
    }

    public handle (): void {
        const member = app.connections.get(this.sender)?.member
        const channel = app.channels.get(this.body.data.channel)

        if (member === undefined) {
            sendError(this.sender, 'Invalid member')
            return
        }
        if (channel === undefined) {
            sendError(this.sender, 'Invalid channel')
            return
        }

        const message = new OutgoingMessageAction(
            this.sender,
            {
                data: {
                    id: randomUUID(),
                    member: member.id,
                    timestamp: new Date().toISOString(),
                    channel: channel.id,
                    type: this.body.data.type,
                    body: this.body.data.body
                }
            }
        )

        message.send(app.wss.clients)
    }
}
