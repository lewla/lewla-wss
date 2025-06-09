import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'
import jwt from 'jsonwebtoken'
import { AuthenticatedAction } from '../outgoing/authenticated.js'
import { SetupAction } from '../outgoing/setup.js'
import { sendError } from '../../helpers/messaging.js'
import { UnauthAction } from '../outgoing/unauth.js'
import { MemberStatusChangeAction } from '../outgoing/memberstatuschange.js'

interface AuthData {
    token: string
}

export class AuthAction extends BaseAction {
    public static identifier = 'auth'
    public body: { data: AuthData }

    constructor (sender: WebSocket, body: { data: AuthData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.token !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public handle (): void {
        jwt.verify(this.body.data.token, process.env.JWT_SECRET ?? '', (err, decoded) => {
            if (err !== null) {
                sendError(this.sender, 'Invalid token payload', this.id)
                new UnauthAction(this.sender, { data: { message: 'Login required' } }).send(this.sender)
                return
            }
            if (decoded === undefined || typeof decoded === 'string') {
                sendError(this.sender, 'Invalid token payload', this.id)
                new UnauthAction(this.sender, { data: { message: 'Login required' } }).send(this.sender)
                return
            }

            const memberId = decoded.member
            if (typeof memberId !== 'string') {
                sendError(this.sender, 'Invalid token payload', this.id)
                new UnauthAction(this.sender, { data: { message: 'Login required' } }).send(this.sender)
                return
            }

            const member = app.members.get(memberId)
            if (member === undefined) {
                sendError(this.sender, 'Invalid token payload', this.id)
                new UnauthAction(this.sender, { data: { message: 'Login required' } }).send(this.sender)
                return
            }

            app.connections.set(this.sender, { member: { id: member.id, avatar_url: member.avatar_url, creation_date: member.creation_date, display_name: member.display_name, username: member.username } })

            const onlineMembers = Array.from(app.connections.values()).map(connection => connection.member)
            const onlineMembersIds = onlineMembers.map(onlineMember => onlineMember?.id)

            const authenticatedAction = new AuthenticatedAction(
                this.sender,
                {
                    data: {
                        member: {
                            id: member.id,
                            username: member.username,
                            display_name: member.display_name,
                            creation_date: member.creation_date.toISOString(),
                            avatar_url: member.avatar_url,
                        }
                    }
                }
            )

            const voiceUsers = Array.from(app.sfu.transports.values()).filter(
                transport => {
                    return typeof transport.appData.memberId === 'string' && typeof transport.appData.channelId === 'string' && typeof transport.appData.type === 'string'
                }).map(
                transport => {
                    return {
                        member: transport.appData.memberId,
                        channel: transport.appData.channelId,
                        type: transport.appData.type
                    }
                }
            ) as Array<{ member: string, channel: string, type: string }>

            const setupAction = new SetupAction(this.sender, {
                data: {
                    channels: Array.from(app.channels.values()),
                    members: Array.from(app.members.values()).map(
                        member => {
                            return {
                                id: member.id,
                                type: 'user',
                                avatar_url: member.avatar_url,
                                creation_date: member.creation_date.toISOString(),
                                display_name: member.display_name,
                                username: member.username,
                                status: onlineMembersIds.includes(member.id) ? 'online' : 'offline'
                            }
                        }
                    ),
                    messages: Array.from(app.messages.values()),
                    voiceUsers
                }
            })

            setupAction.send(this.sender)
            authenticatedAction.send(this.sender)

            const statusMsg = new MemberStatusChangeAction(this.sender, { data: { member: member.id, status: 'online' } })
            statusMsg.send(app.wss.clients)
        })
    }
}
