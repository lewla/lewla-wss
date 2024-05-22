import { WebSocket } from 'ws'

export class BaseAction {
    public static identifier: string
    public body: { data: any }
    public sender: WebSocket

    constructor (sender: WebSocket, body: { data: any }) {
        this.sender = sender
        this.body = body
    }

    public handle (): any {}

    public send (target: Set<WebSocket> | WebSocket): void {
        const identifier = (this.constructor as typeof BaseAction).identifier ?? ''
        if (target instanceof WebSocket) {
            target.send(JSON.stringify({ action: identifier, data: this.body.data }))
        } else {
            target.forEach((ws) => {
                ws.send(JSON.stringify({ action: identifier, data: this.body.data }))
            })
        }
    }
}
