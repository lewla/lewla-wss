import { type WebSocket } from 'ws'

export class BaseAction {
    public static identifier: string
    public body: { data: any }
    public sender: WebSocket

    constructor (sender: WebSocket, body: { data: any }) {
        this.sender = sender
        this.body = body
    }

    public handle (): any {}
}
