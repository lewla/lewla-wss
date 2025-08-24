import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'
import { sendError } from '../../helpers/messaging.js'
import { randomUUID } from 'crypto'
import { MessageAction as OutgoingMessageAction } from '../outgoing/message.js'
import { escapeHtmlChars } from '../../helpers/text.js'
import { Message } from '../../db/entity/message.js'
import { Channel } from '../../db/entity/channel.js'

export interface Payload {
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
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
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

    public async handle (): Promise<void> {
        const member = app.connections.get(this.sender)?.member
        const channel = await app.dataSource
            .getRepository(Channel)
            .createQueryBuilder('channel')
            .where('channel.id = :id', { id: this.body.data.channel })
            .getOne()

        if (member === undefined) {
            sendError(this.sender, 'Invalid member', this.id)
            return
        }
        if (channel === null) {
            sendError(this.sender, 'Invalid channel', this.id)
            return
        }

        const id = randomUUID()
        const timestamp = new Date().toISOString()

        if (typeof this.body.data.body.text === 'string') {
            this.body.data.body.text = escapeHtmlChars(this.body.data.body.text)
        }

        const messageData = {
            id,
            channel: { id: channel.id },
            member: { id: member.id },
            created_at: timestamp,
            type: this.body.data.type,
            body: this.body.data.body
        }

        const insert = app.dataSource
            .createQueryBuilder()
            .insert()
            .into(Message)
            .values([messageData])
            .execute()

        insert.then((result) => {
            const message = new OutgoingMessageAction(
                this.sender,
                {
                    data: {
                        id,
                        member: member.id,
                        timestamp,
                        channel: channel.id,
                        type: this.body.data.type,
                        body: this.body.data.body
                    }
                }
            )

            message.send(app.wss.clients)
        }).catch((error) => {
            console.error(error)
        })
    }
}
