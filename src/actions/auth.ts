import { type WebSocket } from 'ws'
import { BaseAction } from './base.js'
import { app } from '../index.js'

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
    }>
}

export class AuthAction extends BaseAction {
    public static identifier = 'auth'
    public body: { data: AuthData }

    constructor (sender: WebSocket, body: { data: AuthData }) {
        super(sender, body)
        this.body = body
    }

    public handle (): void {
        const member = app.members.get(this.body.data.token)
        if (member != null) {
            app.connections.set(this.sender, { member })

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
                members: Array.from(app.members.values()).map(member => { return { id: member.id, avatar_url: member.avatar_url, creation_date: member.creation_date, display_name: member.display_name, username: member.username } }),
            }

            this.sender.send(JSON.stringify({ action: 'authenticated', data: authenticatedData }))
            this.sender.send(JSON.stringify({ action: 'setup', data: setupData }))
        }
    }
}
