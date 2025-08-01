import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface ErrorData {
    message: string
}

export class ErrorAction extends BaseAction {
    public static identifier = 'error'
    public body: { data: ErrorData }

    constructor (sender: WebSocket, body: { data: ErrorData }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.message !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }
}
