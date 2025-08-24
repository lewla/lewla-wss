import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface Payload {
    member: string
    status: string
}

export class MemberStatusChangeAction extends BaseAction {
    public static identifier = 'memberstatuschange'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.member !== 'string' ||
            typeof this.body.data.status !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
