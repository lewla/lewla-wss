import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { app } from '../../index.js'
import jwt from 'jsonwebtoken'
import { AuthenticatedAction } from '../outgoing/authenticated.js'
import { SetupAction } from '../outgoing/setup.js'
import { sendError } from '../../helpers/messaging.js'
import { UnauthAction } from '../outgoing/unauth.js'
import { MemberStatusChangeAction } from '../outgoing/memberstatuschange.js'
import { Member } from '../../db/entity/member.js'
import { Channel } from '../../db/entity/channel.js'
import { Message } from '../../db/entity/message.js'

interface Payload {
    token: string
}

export class AuthAction extends BaseAction {
    public static identifier = 'auth'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.token !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        try {
            const decoded = jwt.verify(this.body.data.token, process.env.JWT_SECRET ?? '')

            if (typeof decoded === 'string') {
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

            const member = await app.dataSource
                .getRepository(Member)
                .createQueryBuilder('member')
                .where('member.id = :id', { id: memberId })
                .getOne()

            if (member === null) {
                sendError(this.sender, 'Invalid token payload', this.id)
                new UnauthAction(this.sender, { data: { message: 'Login required' } }).send(this.sender)
                return
            }

            app.connections.set(this.sender, { member: { id: member.id, avatar_url: member.avatar_url, created_at: member.created_at, display_name: member.display_name, username: member.username } })

            const onlineMembers = Array.from(app.connections.values()).map(connection => connection.member)
            const onlineMembersIds = onlineMembers.map(onlineMember => onlineMember?.id)

            const channels = await app.dataSource
                .getRepository(Channel)
                .createQueryBuilder('channel')
                .getMany()

            const members = await app.dataSource
                .getRepository(Member)
                .createQueryBuilder('member')
                .getMany()

            const messages = await app.dataSource
                .getRepository(Message)
                .find({
                    relations: {
                        member: true,
                        channel: true,
                    }
                })

            const authenticatedAction = new AuthenticatedAction(
                this.sender,
                {
                    data: {
                        member: {
                            id: member.id,
                            username: member.username,
                            display_name: member.display_name,
                            creation_date: member.created_at.toISOString(),
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
                    channels,
                    members: members.map(
                        member => {
                            return {
                                id: member.id,
                                type: 'user',
                                avatar_url: member.avatar_url,
                                creation_date: member.created_at.toISOString(),
                                display_name: member.display_name,
                                username: member.username,
                                status: onlineMembersIds.includes(member.id) ? 'online' : 'offline'
                            }
                        }
                    ),
                    messages: messages.map(
                        message => {
                            return {
                                id: message.id,
                                type: message.type,
                                member: message.member.id,
                                channel: message.channel.id,
                                body: message.body,
                                timestamp: message.created_at.toISOString(),
                            }
                        }
                    ),
                    voiceUsers
                }
            })

            setupAction.send(this.sender)
            authenticatedAction.send(this.sender)

            const statusMsg = new MemberStatusChangeAction(this.sender, { data: { member: member.id, status: 'online' } })
            statusMsg.send(app.wss.clients)
        } catch (error) {
            console.error(error)
            sendError(this.sender, 'Invalid token payload', this.id)
            new UnauthAction(this.sender, { data: { message: 'Login required' } }).send(this.sender)
        }
    }
}
