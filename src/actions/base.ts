import { WebSocket } from 'ws'
import { randomUUID } from 'crypto'

export class BaseAction {
    public static identifier: string
    public body: { data: any }
    public sender: WebSocket
    public id: string

    constructor (sender: WebSocket, body: { data: any }, id?: string) {
        this.sender = sender
        this.body = body
        this.id = id ?? randomUUID()
    }

    public handle (): any {}

    public send (target: Set<WebSocket> | WebSocket): void {
        const identifier = (this.constructor as typeof BaseAction).identifier ?? ''
        if (target instanceof WebSocket) {
            target.send(JSON.stringify({ id: this.id, action: identifier, data: this.body.data }))
        } else {
            target.forEach((ws) => {
                ws.send(JSON.stringify({ id: this.id, action: identifier, data: this.body.data }))
            })
        }
    }

    public broadcast (target: Set<WebSocket>): void {
        const identifier = (this.constructor as typeof BaseAction).identifier ?? ''
        target.forEach((ws) => {
            if (ws !== this.sender) {
                ws.send(JSON.stringify({ id: this.id, action: identifier, data: this.body.data }))
            }
        })
    }
}
