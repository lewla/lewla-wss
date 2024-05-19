import { type WebSocket } from 'ws'
import { BaseAction } from './base.js'
import { app } from '../index.js'
import jwt from 'jsonwebtoken'

interface AuthData {
    token: string
}

interface AuthenticatedData {
    member: {
        id: string
        username: string
        display_name: string
        creation_date: Date
        avatar_url: string | null
    }
}

interface SetupData {
    channels: Array<{
        id: string
        type: string
        name: string
        order: number
    }>
    members: Array<{
        id: string
        username: string
        display_name: string
        creation_date: Date
        avatar_url: string | null
        status: 'online' | 'offline' | 'busy' | 'away'
    }>
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
                throw new Error('Invalid token payload')
            }
            if (decoded === undefined || typeof decoded === 'string') {
                throw new Error('Invalid token payload')
            }

            const memberId = decoded.member
            if (typeof memberId !== 'string') {
                throw new Error('Invalid token payload')
            }

            const member = app.members.get(memberId)
            if (member === undefined) {
                throw new Error('Invalid token payload')
            }

            app.connections.set(this.sender, { member: { id: member.id, avatar_url: member.avatar_url, creation_date: member.creation_date, display_name: member.display_name, username: member.username } })

            const onlineMembers = Array.from(app.connections.values()).map(connection => connection.member)
            const onlineMembersIds = onlineMembers.map(onlineMember => onlineMember?.id)

            const authenticatedData: AuthenticatedData = {
                member: {
                    id: member.id,
                    username: member.username,
                    display_name: member.display_name,
                    creation_date: member.creation_date,
                    avatar_url: member.avatar_url,
                }
            }
            const setupData: SetupData = {
                channels: Array.from(app.channels.values()),
                members: Array.from(app.members.values()).map(
                    member => {
                        return {
                            id: member.id,
                            avatar_url: member.avatar_url,
                            creation_date: member.creation_date,
                            display_name: member.display_name,
                            username: member.username,
                            status: onlineMembersIds.includes(member.id) ? 'online' : 'offline'
                        }
                    }
                ),
            }

            this.sender.send(JSON.stringify({ action: 'authenticated', data: authenticatedData }))
            this.sender.send(JSON.stringify({ action: 'setup', data: setupData }))
        })
    }
}
