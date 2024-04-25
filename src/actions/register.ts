import { type WebSocket } from 'ws'
import { BaseAction } from './base.js'

interface MemberRegisterData {
    username: string
}

export class MemberRegisterAction extends BaseAction {
    public static identifier = 'memberregister'
    public body: { data: MemberRegisterData }

    constructor (sender: WebSocket, body: { data: MemberRegisterData }) {
        super(sender, body)
        this.body = body
    }

    public handle (): void {
    }
}
