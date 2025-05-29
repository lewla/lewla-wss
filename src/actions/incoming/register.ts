import { type WebSocket } from 'ws'
import * as memberModel from '../../db/member.js'
import { BaseAction } from '../base.js'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import { hash } from 'argon2'
import { app } from '../../index.js'
import { sendError, sendSuccess } from '../../helpers/messaging.js'
import { TokenAction } from '../outgoing/token.js'

interface RegisterData {
    username: string
    password: string
    email_address?: string
}

export class RegisterAction extends BaseAction {
    public static identifier = 'register'
    public body: { data: RegisterData }

    constructor (sender: WebSocket, body: { data: RegisterData }) {
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

                const token = jwt.sign({ member: memberId }, process.env.JWT_SECRET ?? '')
                const tokenAction = new TokenAction(this.sender, { data: { token } })
                tokenAction.send(this.sender)
                sendSuccess(this.sender, 'Registration successful', this.id)
            } else {
                sendError(this.sender, 'Error occurred when creating member', this.id)
            }
        }).catch((reason) => {
            let error = 'Error occurred when creating member'
            if (reason.code === '23505') {
                error = 'Username already exists'
            }
            sendError(this.sender, error, this.id)
        })
    }
}
