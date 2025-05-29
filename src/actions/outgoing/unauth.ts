import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface UnauthData {
    message: string
}

export class UnauthAction extends BaseAction {
    public static identifier = 'unauth'
    public body: { data: UnauthData }

    constructor (sender: WebSocket, body: { data: UnauthData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.message !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
