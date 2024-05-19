import { type WebSocket } from 'ws'
import * as memberModel from '../db/member.js'
import { BaseAction } from './base.js'
import { randomUUID } from 'crypto'
import { hash } from 'argon2'
import { app } from '../index.js'

interface MemberRegisterData {
    username: string
    password: string
    email_address?: string
}

export class MemberRegisterAction extends BaseAction {
    public static identifier = 'memberregister'
    public body: { data: MemberRegisterData }

    constructor (sender: WebSocket, body: { data: MemberRegisterData }) {
        super(sender, body)
        this.body = body

        if (
            typeof this.body.data.username !== 'string' ||
            typeof this.body.data.password !== 'string' ||
            typeof (this.body.data.email_address ?? '') !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        const passwordHash = await hash(this.body.data.password)

        const memberId = randomUUID()
        const memberCreationDate = new Date()
        memberModel.create({
            id: memberId,
            username: this.body.data.username,
            password: passwordHash,
            email_address: this.body.data.email_address ?? null,
            display_name: this.body.data.username,
            avatar_url: null,
            creation_date: memberCreationDate
        }).then((result) => {
            if (result) {
                app.members.set(memberId, {
                    id: memberId,
                    username: this.body.data.username,
                    display_name: this.body.data.username,
                    avatar_url: null,
                    creation_date: memberCreationDate,
                    email_address: this.body.data.email_address ?? null,
                    password: passwordHash
                })
            } else {
                this.sender.send(JSON.stringify({ action: 'error', data: { message: 'Error occurred when creating member' } }))
            }
        }).catch((reason) => {
            if (reason.code === '23505') {
                this.sender.send(JSON.stringify({ action: 'error', data: { message: 'Username already exists' } }))
            } else {
                this.sender.send(JSON.stringify({ action: 'error', data: { message: 'Error occurred when creating member' } }))
            }
        })
    }
}
