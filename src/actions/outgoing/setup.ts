import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'

interface SetupData {
    channels: Array<{
        id: string
        type: string
        name: string
        order: number
    }>
    members: Array<{
        id: string
        type: string
        display_name: string
        avatar_url: string | null
        status: string
        creation_date: string
    }>
    messages: Array<{
        id: string
        timestamp: string
        member: string
        channel: string
        type: string
        body: {
            text?: string
            components?: Array<{
                type: string
                data: any
            }>
        }
    }>
    voiceUsers: Array<{
        member: string
        channel: string
        type: string
    }>
}

export class SetupAction extends BaseAction {
    public static identifier = 'setup'
    public body: { data: SetupData }

    constructor (sender: WebSocket, body: { data: SetupData }) {
        super(sender, body)
        this.body = body
    }
}
