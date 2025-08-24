import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import { hash } from 'argon2'
import { app } from '../../index.js'
import { sendError, sendSuccess } from '../../helpers/messaging.js'
import { TokenAction } from '../outgoing/token.js'
import { Member } from '../../db/entity/member.js'
import { MemberRegisteredAction } from '../outgoing/memberregistered.js'

export interface Payload {
    username: string
    password: string
    email_address?: string
}

export class RegisterAction extends BaseAction {
    public static identifier = 'register'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
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
        this.body.data.username = this.body.data.username.toLowerCase()

        if (this.body.data.username.length < 2) {
            sendError(this.sender, 'Username is too short', this.id)
            return
        }
        if (this.body.data.username.length > 32) {
            sendError(this.sender, 'Username is too long', this.id)
            return
        }
        if (!/^[a-z0-9._]+$/.test(this.body.data.username)) {
            sendError(this.sender, 'Username contains invalid characters', this.id)
            return
        }
        if (!/[a-z0-9]/.test(this.body.data.username)) {
            sendError(this.sender, 'Username must contain at least one alphanumeric character', this.id)
            return
        }
        if (/[._]{2,}/.test(this.body.data.username)) {
            sendError(this.sender, 'Username cannot contain consequtive dots or underscores', this.id)
            return
        }

        if (this.body.data.password.length < 6) {
            sendError(this.sender, 'Password is too short', this.id)
            return
        }
        if (this.body.data.password.length > 128) {
            sendError(this.sender, 'Password is too long', this.id)
            return
        }

        const passwordHash = await hash(this.body.data.password)

        const memberId = randomUUID()
        const memberCreationDate = new Date()

        const insert = app.dataSource
            .createQueryBuilder()
            .insert()
            .into(Member)
            .values([{
                id: memberId,
                username: this.body.data.username,
                password: passwordHash,
                email_address: this.body.data.email_address ?? null,
                display_name: this.body.data.username,
                avatar_url: null,
                created_at: memberCreationDate
            }])
            .execute()

        insert.then((result) => {
            const token = jwt.sign({ member: memberId }, process.env.JWT_SECRET ?? '')
            const tokenAction = new TokenAction(this.sender, { data: { token } })
            tokenAction.send(this.sender)
            sendSuccess(this.sender, 'Registration successful', this.id)

            const registeredAction = new MemberRegisteredAction(this.sender, {
                data: {
                    id: memberId,
                    display_name: this.body.data.username,
                    avatar_url: null,
                    creation_date: memberCreationDate.toISOString(),
                    type: 'user',
                    status: 'offline'
                }
            })
            registeredAction.send(app.wss.clients)
        }).catch((reason) => {
            sendError(this.sender, 'Error occurred when creating member', this.id)
        })
    }
}
