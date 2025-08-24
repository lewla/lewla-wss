import { WebSocketServer, type WebSocket } from 'ws'
import AppDataSource from '../db/index.js'
import { actions } from '../actions/incoming/index.js'
import { type BaseAction } from '../actions/base.js'
import { sendError } from '../helpers/messaging.js'
import { SFU } from './sfu.js'
import { MemberStatusChangeAction } from '../actions/outgoing/memberstatuschange.js'
import { type DataSource } from 'typeorm'
import { type PublicMember } from '../types/publicmember.js'

export class Application {
    public wss: WebSocketServer
    public dataSource: DataSource
    /**
     * Map of actions that can be handled by the Websocket Server
     */
    public actions: Map<string, typeof BaseAction>
    public connections: Map<WebSocket, {
        member: PublicMember
    }>

    public sfu: SFU

    constructor () {
        this.wss = new WebSocketServer({ port: 8280 })
        this.dataSource = AppDataSource
        this.dataSource.initialize().catch((error) => { console.error(error) })

        this.actions = actions
        this.connections = new Map()
        this.sfu = new SFU()
    }

    async setup (): Promise<void> {
        this.wss.on('connection', (ws, message) => {
            ws.on('error', (err) => { console.error(err) })
            ws.on('close', (code, reason) => {
                const member = this.connections.get(ws)?.member

                if (member !== undefined) {
                    const statusMsg = new MemberStatusChangeAction(ws, { data: { member: member.id, status: 'offline' } })
                    statusMsg.send(this.wss.clients)
                }

                this.connections.delete(ws)
                for (const transport of this.sfu.transports.values()) {
                    if (ws === transport.appData.connection) {
                        transport.close()
                    }
                }
            })
            ws.on('message', (data) => {
                try {
                    if (!(data instanceof Buffer)) {
                        throw new Error('Invalid data')
                    }
                    const message = JSON.parse(data.toString('utf-8')) ?? []
                    const messageAction = message.action
                    const messageId = message.id

                    if (typeof messageAction === 'string') {
                        const Action = this.actions.get(messageAction.toLowerCase())
                        if (Action != null) {
                            if ('data' in message) {
                                const action = new Action(ws, { data: message.data }, (typeof messageId === 'string' ? messageId : undefined))
                                action.handle()
                            } else {
                                throw new Error('No data provided')
                            }
                        } else {
                            throw new Error('Unsupported action: ' + messageAction)
                        }
                    } else {
                        throw new Error('No action provided')
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        console.error(error.stack)
                    } else {
                        console.error(error)
                    }
                    sendError(ws, 'Error handling message')
                }
            })
        })
    }
}
