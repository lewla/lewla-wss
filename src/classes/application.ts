import { WebSocketServer, type WebSocket } from 'ws'
import { pool } from '../db/index.js'
import * as memberModel from '../db/member.js'
import * as channelModel from '../db/channel.js'
import * as messageModel from '../db/message.js'
import { actions } from '../actions/incoming/index.js'
import { type BaseAction } from '../actions/base.js'
import { type Pool } from 'pg'
import { sendError } from '../helpers/messaging.js'
import { SFU } from './sfu.js'

export class Application {
    public wss: WebSocketServer
    public db: Pool
    /**
     * Map of actions that can be handled by the Websocket Server
     */
    public actions: Map<string, typeof BaseAction>
    public members: Map<string, memberModel.Member>
    public connections: Map<WebSocket, {
        member?: {
            id: string
            username: string
            display_name: string
            avatar_url: string | null
            creation_date: Date
        }
    }>

    public channels: Map<string, channelModel.Channel>
    public messages: Map<string, messageModel.Message>
    public sfu: SFU

    constructor () {
        this.wss = new WebSocketServer({ port: 8280 })
        this.db = pool
        this.actions = actions
        this.members = new Map()
        this.connections = new Map()
        this.channels = new Map()
        this.messages = new Map()
        this.sfu = new SFU()
    }

    async setup (): Promise<void> {
        const membersList = await memberModel.getAll()
        membersList.forEach(member => { this.members.set(member.id, member) })

        const channelsList = await channelModel.getAll()
        channelsList.forEach(channel => { this.channels.set(channel.id, channel) })

        const messageList = await messageModel.getAll()
        messageList.forEach(message => { this.messages.set(message.id, message) })

        this.wss.on('connection', (ws, message) => {
            ws.on('error', (err) => { console.error(err) })
            ws.on('close', (code, reason) => { this.connections.delete(ws) })
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
