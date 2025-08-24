import { type WebSocket } from 'ws'
import { BaseAction } from '../base.js'
import { verify } from 'argon2'
import jwt from 'jsonwebtoken'
import { TokenAction } from '../outgoing/token.js'
import { sendError, sendSuccess } from '../../helpers/messaging.js'
import { Member } from '../../db/entity/member.js'
import { app } from '../../index.js'

interface Payload {
    username: string
    password: string
}

export class LoginAction extends BaseAction {
    public static identifier = 'login'
    public body: { data: Payload }

    constructor (sender: WebSocket, body: { data: Payload }, id?: string) {
        super(sender, body, id)
        this.body = body

        if (
            typeof this.body.data.username !== 'string' ||
            typeof this.body.data.password !== 'string'
        ) {
            throw new Error('Invalid payload')
        }
    }

    public async handle (): Promise<void> {
        const result = await app.dataSource
            .getRepository(Member)
            .createQueryBuilder('member')
            .where('member.username = :username', { username: this.body.data.username })
            .getOne()

        if (result instanceof Member) {
            verify(result.password, this.body.data.password).then((success) => {
                if (success) {
                    const token = jwt.sign({ member: result.id }, process.env.JWT_SECRET ?? '')
                    const tokenAction = new TokenAction(this.sender, { data: { token } })
                    tokenAction.send(this.sender)

                    sendSuccess(this.sender, 'Login successful', this.id)
                } else {
                    sendError(this.sender, 'Invalid username or password', this.id)
                }
            }).catch((reason) => {
                sendError(this.sender, 'Error occurred when logging in', this.id)
            })
        } else {
            sendError(this.sender, 'Invalid username or password', this.id)
        }
    }
}
