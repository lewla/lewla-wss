import { type WebSocket } from 'ws'
import { BaseAction } from './base.js'

interface MemberConnectedData {
    member: string
    timestamp?: number
}

export class MemberConnectedAction extends BaseAction {
    public static identifier = 'memberconnected'
    public body: { data: MemberConnectedData }

    constructor (sender: WebSocket, body: { data: MemberConnectedData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.member !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
