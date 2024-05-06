import { type WebSocket } from 'ws'
import { BaseAction } from './base.js'
import { app } from '../index.js'

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

    public handle (): void {
        const member = app.members.get(this.body.data.member)
        if (member != null) {
            const data: MemberConnectedData = {
                member: member.id,
                timestamp: Date.now(),
            }

            app.wss.clients.forEach((ws) => {
                ws.send(JSON.stringify({ action: 'memberconnected', data }))
            })
        }
    }
}
