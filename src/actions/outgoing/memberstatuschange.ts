import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface MemberStatusChangeData {
    member: string
    status: string
}

export class MemberStatusChangeAction extends BaseAction {
    public static identifier = 'memberstatuschange'
    public body: { data: MemberStatusChangeData }

    constructor (sender: WebSocket, body: { data: MemberStatusChangeData }) {
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
