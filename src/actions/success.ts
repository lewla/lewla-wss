import { type WebSocket } from 'ws'
import { BaseAction } from './base.js'

interface SuccessData {
    message: string
}

export class SuccessAction extends BaseAction {
    public static identifier = 'success'
    public body: { data: SuccessData }

    constructor (sender: WebSocket, body: { data: SuccessData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.message !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
